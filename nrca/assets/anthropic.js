/**
 * NRCA Brain — Anthropic Messages API client for the browser.
 *
 * Talks ONLY to https://api.anthropic.com. Non-streaming requests retry with
 * exponential backoff on 429/529/5xx (honoring retry-after). Streaming parses
 * the SSE event stream and assembles the full message, including tool_use
 * blocks whose input arrives as concatenated input_json_delta.partial_json.
 *
 * Contract notes:
 *  - claude-opus-5: never send temperature/top_p/top_k or a thinking config
 *    (this client sends none of them for any model); DO send
 *    `"fallbacks": "default"` plus the anthropic-beta fallback header.
 *  - Callers must always check stop_reason ("refusal", "max_tokens",
 *    "tool_use") on the returned message.
 */

export const MODELS = [
  { id: "claude-opus-5",  label: "Opus 5 — best answers",   inPerM: 5, outPerM: 25 },
  { id: "claude-sonnet-5", label: "Sonnet 5 — balanced",    inPerM: 3, outPerM: 15 },
  { id: "claude-haiku-4-5", label: "Haiku 4.5 — fastest/cheapest", inPerM: 1, outPerM: 5 },
];

const API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const OPUS_5 = "claude-opus-5";
const OPUS_5_BETA = "server-side-fallback-2026-07-01";

const MAX_TRIES = 4;
const DEFAULT_MAX_TOKENS_STREAM = 16000; // chat
const DEFAULT_MAX_TOKENS_COMPLETE = 4000; // OCR
const MAX_RETRY_WAIT_MS = 120000;

/** Rough token cost of an image content block: ≈ (w*h)/750, capped at 4784. */
export function estimateImageTokens(widthPx, heightPx) {
  return Math.min(4784, Math.ceil((widthPx * heightPx) / 750));
}

export class AnthropicError extends Error {
  constructor(message, { status = 0, type = "api_error", retryAfter = null } = {}) {
    super(message);
    this.name = "AnthropicError";
    this.status = status; // HTTP status (0 = network failure)
    this.type = type; // Anthropic error type, e.g. "authentication_error"
    this.retryAfter = retryAfter; // seconds, from the retry-after header, if any
  }
}

function buildHeaders(apiKey, model) {
  const headers = {
    "content-type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": ANTHROPIC_VERSION,
    "anthropic-dangerous-direct-browser-access": "true",
  };
  if (model === OPUS_5) headers["anthropic-beta"] = OPUS_5_BETA;
  return headers;
}

function buildBody(opts, stream) {
  const body = {
    model: opts.model,
    max_tokens:
      opts.maxTokens ?? (stream ? DEFAULT_MAX_TOKENS_STREAM : DEFAULT_MAX_TOKENS_COMPLETE),
    messages: opts.messages,
  };
  if (opts.system != null) body.system = opts.system;
  if (opts.tools && opts.tools.length) body.tools = opts.tools;
  if (opts.model === OPUS_5) body.fallbacks = "default";
  if (stream) body.stream = true;
  return body;
}

function abortError(signal) {
  if (signal && signal.reason) return signal.reason;
  if (typeof DOMException !== "undefined") return new DOMException("Aborted", "AbortError");
  const err = new Error("Aborted");
  err.name = "AbortError";
  return err;
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) {
      reject(abortError(signal));
      return;
    }
    const timer = setTimeout(() => {
      if (signal) signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError(signal));
    };
    if (signal) signal.addEventListener("abort", onAbort, { once: true });
  });
}

async function parseErrorResponse(res) {
  let type = "api_error";
  let message = "HTTP " + res.status;
  try {
    const data = await res.json();
    if (data && data.error) {
      type = data.error.type || type;
      message = data.error.message || message;
    }
  } catch {
    /* non-JSON error body */
  }
  let retryAfter = null;
  try {
    const ra = res.headers && res.headers.get && res.headers.get("retry-after");
    if (ra != null && ra !== "" && !Number.isNaN(parseFloat(ra))) retryAfter = parseFloat(ra);
  } catch {
    /* headers unavailable */
  }
  return new AnthropicError(message, { status: res.status, type, retryAfter });
}

function isRetryableStatus(status) {
  return status === 429 || status === 529 || (status >= 500 && status < 600);
}

function backoffMs(attempt) {
  // attempt 0 → ~1s, 1 → ~2s, 2 → ~4s (plus jitter)
  return 1000 * Math.pow(2, attempt) + Math.floor(Math.random() * 250);
}

/**
 * Non-streaming completion.
 * opts = { apiKey, model, system, messages, tools, maxTokens, signal }
 * → the full message object from the API.
 * Retries 429/529/5xx (and transient network failures) up to 4 attempts,
 * honoring the retry-after header when present.
 */
export async function completeMessage(opts) {
  const fetchImpl = opts.fetch || globalThis.fetch;
  const headers = buildHeaders(opts.apiKey, opts.model);
  const body = JSON.stringify(buildBody(opts, false));
  let lastError = null;

  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    if (attempt > 0) {
      let waitMs = backoffMs(attempt - 1);
      if (lastError instanceof AnthropicError && lastError.retryAfter != null) {
        waitMs = Math.min(lastError.retryAfter * 1000, MAX_RETRY_WAIT_MS);
      }
      await delay(waitMs, opts.signal);
    }

    let res;
    try {
      res = await fetchImpl(API_URL, {
        method: "POST",
        headers,
        body,
        signal: opts.signal,
      });
    } catch (err) {
      if (err && err.name === "AbortError") throw err;
      // network failure — treat as transient
      lastError = new AnthropicError(err && err.message ? err.message : "Network error", {
        status: 0,
        type: "network_error",
      });
      continue;
    }

    if (res.ok) return res.json();

    const apiError = await parseErrorResponse(res);
    if (isRetryableStatus(res.status)) {
      lastError = apiError;
      continue;
    }
    throw apiError; // 400/401/403/404… — not retryable
  }
  throw lastError || new AnthropicError("Request failed", { status: 0 });
}

/**
 * Streaming completion.
 * opts = { apiKey, model, system, messages, tools, maxTokens, signal,
 *          onText(delta), onThinking(delta), onToolUse(name) }
 * → assembled { content, stop_reason, usage, model } once the stream ends.
 * Errors (HTTP or mid-stream) are thrown for the caller's UI to surface.
 */
export async function streamMessage(opts) {
  const fetchImpl = opts.fetch || globalThis.fetch;
  const res = await fetchImpl(API_URL, {
    method: "POST",
    headers: buildHeaders(opts.apiKey, opts.model),
    body: JSON.stringify(buildBody(opts, true)),
    signal: opts.signal,
  });
  if (!res.ok) throw await parseErrorResponse(res);
  return readMessageStream(res, opts);
}

/**
 * SSE assembler, separated for testability: takes any Response-like object
 * (`{ body: { getReader() } }`) whose body yields Anthropic SSE bytes, and
 * assembles the final message object. Fires the optional onText / onThinking /
 * onToolUse callbacks as deltas arrive.
 */
export async function readMessageStream(response, callbacks = {}) {
  const { onText, onThinking, onToolUse } = callbacks;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  const message = { content: [], stop_reason: null, usage: {}, model: null };
  const partialJson = new Map(); // block index → accumulated partial_json
  let finished = false;

  const handleEvent = (data) => {
    switch (data.type) {
      case "message_start": {
        const m = data.message || {};
        if (m.id) message.id = m.id;
        if (m.role) message.role = m.role;
        if (m.model) message.model = m.model;
        if (m.usage) Object.assign(message.usage, m.usage);
        break;
      }
      case "content_block_start": {
        const idx = data.index;
        const block = Object.assign({}, data.content_block);
        if (block.type === "text" && block.text == null) block.text = "";
        if (block.type === "thinking" && block.thinking == null) block.thinking = "";
        if (block.type === "tool_use") {
          partialJson.set(idx, "");
          if (block.input == null) block.input = {};
          if (onToolUse) onToolUse(block.name);
        }
        message.content[idx] = block;
        break;
      }
      case "content_block_delta": {
        const idx = data.index;
        const block = message.content[idx];
        const d = data.delta || {};
        if (!block) break;
        if (d.type === "text_delta") {
          block.text = (block.text || "") + d.text;
          if (onText) onText(d.text);
        } else if (d.type === "thinking_delta") {
          block.thinking = (block.thinking || "") + d.thinking;
          if (onThinking) onThinking(d.thinking);
        } else if (d.type === "input_json_delta") {
          partialJson.set(idx, (partialJson.get(idx) || "") + d.partial_json);
        } else if (d.type === "signature_delta") {
          block.signature = (block.signature || "") + d.signature;
        }
        break;
      }
      case "content_block_stop": {
        const idx = data.index;
        const block = message.content[idx];
        if (block && block.type === "tool_use" && partialJson.has(idx)) {
          const raw = partialJson.get(idx).trim();
          partialJson.delete(idx);
          try {
            block.input = raw ? JSON.parse(raw) : {};
          } catch {
            // Truncated mid-JSON (usually max_tokens). Don't blow up the whole
            // stream — hand back what we have and let the caller decide from
            // stop_reason.
            block.input = {};
            block.input_truncated = true;
          }
        }
        break;
      }
      case "message_delta": {
        if (data.delta) {
          if (data.delta.stop_reason != null) message.stop_reason = data.delta.stop_reason;
          if (data.delta.stop_sequence !== undefined) {
            message.stop_sequence = data.delta.stop_sequence;
          }
        }
        if (data.usage) Object.assign(message.usage, data.usage);
        break;
      }
      case "message_stop":
        finished = true;
        break;
      case "ping":
        break;
      case "error": {
        const e = (data && data.error) || {};
        throw new AnthropicError(e.message || "Stream error", {
          status: 0,
          type: e.type || "api_error",
        });
      }
      default:
        // Unknown event types are ignored for forward compatibility.
        break;
    }
  };

  // SSE framing: events are separated by a blank line; each event has
  // optional "event:" lines and one or more "data:" lines.
  let buffer = "";
  const drainBuffer = (flush) => {
    buffer = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    for (;;) {
      const sep = buffer.indexOf("\n\n");
      let rawEvent;
      if (sep !== -1) {
        rawEvent = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
      } else if (flush && buffer.trim()) {
        rawEvent = buffer;
        buffer = "";
      } else {
        return;
      }
      const dataLines = [];
      for (const line of rawEvent.split("\n")) {
        if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).replace(/^ /, ""));
        }
        // "event:" lines are redundant (payload carries .type); ":" comments ignored.
      }
      if (!dataLines.length) continue;
      const payload = dataLines.join("\n");
      let data;
      try {
        data = JSON.parse(payload);
      } catch {
        continue; // malformed frame — skip
      }
      handleEvent(data);
      if (finished) return;
    }
  };

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      drainBuffer(false);
      if (finished) break;
    }
    if (!finished) {
      buffer += decoder.decode();
      drainBuffer(true);
    }
  } finally {
    try {
      if (reader.releaseLock) reader.releaseLock();
    } catch {
      /* reader may already be released */
    }
  }

  return message;
}
