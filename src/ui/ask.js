/*
 * Ask (6b), from the Ask bar on Today.
 *
 * The assistant is the existing one, untouched: sendChat() still answers what
 * the app can answer itself first (the Library, the calculators, the guard
 * for anyone under age), asks for consent before health data leaves the
 * phone, uses the managed service for Pro or the person's own key, counts
 * the daily allowance and keeps the conversation. This screen is its new
 * face: it borrows the assistant's own thread (#chat-msgs), input (#chat-in)
 * and allowance line (#ai-quota) from the old page (tlBorrow, shell.js) and
 * the shell puts them back when the screen goes.
 *
 * A free plan reaches Pro (5c) on sending, through the gate sendChat has
 * always had.
 */

/* Suggestions: about the person's own stack and labs, never what to take. */
function tlAskSuggestions(d) {
  var p = tlProtocol(d, tlEnv()), first = (p.compounds && p.compounds[0] && p.compounds[0].name) || 'BPC-157';
  var out = ['What changed in my latest labs?', 'What does the research say about ' + first + '?', 'How does ' + first + '’s half-life work?',
    'What should I ask my physician at my next visit?'];
  return out;
}

function tlAskClear() {
  if (typeof clearChatMemory === 'function') clearChatMemory();
  tlAskDecorate();
}

/* Where an answer came from, on each answer: the app itself (free, from the
   Library and the calculators) or the assistant, with the log when the
   personalized setting sends it. */
/* The old page's canned lines ("Hello — I'm your therapy research
   assistant…", "Conversation cleared…") are not answers: the screen's own
   empty text stands in for them. */
var TL_ASK_CANNED = /^(Hello \u2014 I'm your therapy research assistant|Hello — I'm your therapy research assistant|Conversation cleared\.)/;

function tlAskProvenance(node) {
  if (node.querySelector('.cdot') || node.querySelector('.tl-ask-from') || node.classList.contains('tl-ask-canned')) return;
  var bub = node.querySelector('.cbub');
  if (bub && TL_ASK_CANNED.test(bub.textContent.trim())) { node.classList.add('tl-ask-canned'); return; }
  var local = node.classList.contains('msg');
  var personal = typeof aiPersonalized === 'function' ? aiPersonalized() : false;
  var text = local ? 'From the Library' : personal ? 'From your log and the assistant' : 'From the assistant';
  var from = document.createElement('div');
  from.className = 'tl-ask-from';
  from.innerHTML = tlIcon('sparkle', true) + '<span>' + text + '</span>';
  node.insertBefore(from, node.firstChild);
  /* The actions, in the design's words. */
  Array.prototype.forEach.call(node.querySelectorAll('.cmsg-btn'), function (b) {
    var t = b.textContent;
    if (/Copy/.test(t)) { b.textContent = 'Copy'; b.classList.add('tl-ask-act'); }
    else if (/Export|Save|Share/.test(t)) { b.textContent = 'Share with my physician'; b.classList.add('tl-ask-act'); }
  });
}

function tlAskDecorate() {
  var thread = document.getElementById('chat-msgs');
  if (!thread) return;
  Array.prototype.forEach.call(thread.querySelectorAll('.cmsg.ai, .msg.ai'), tlAskProvenance);
  var empty = document.querySelector('.tl-ask-empty');
  if (empty) empty.hidden = Array.prototype.some.call(thread.children, function (c) { return !c.classList.contains('tl-ask-canned'); });
}

var tlAskObserver = null;

function tlAskScreen(el) {
  var d = gd(), paid = !!(window.TLTier && TLTier.isPro && (TLTier.isPro() || TLTier.get() === 'byok'));
  el.innerHTML = '<div class="ds-screen tl-ask">' +
    '<div class="ds-header tl-ask-head"><button type="button" class="ds-btn ds-btn-ghost tl-ask-back" data-tl-back>' + tlIcon('caret-left') + '<span>Today</span></button>' +
      '<h1 class="tl-ask-title">' + tlIcon('sparkle', true) + '<span>Ask</span>' + (paid ? '' : '<span class="ds-tag ds-tag-accent">Pro</span>') + '</h1>' +
      '<button type="button" class="ds-btn ds-btn-ghost tl-ask-clear" data-tl-call="tlAskClear">Clear</button></div>' +
    '<div class="tl-ask-thread" id="tl-ask-thread"><p class="tl-ask-empty">Ask about a compound, your labs or your plan. Answers come from your log and the Library, and end with questions to take to your physician.</p></div>' +
    '<div class="tl-ask-composer">' +
      '<div class="tl-ask-sugg" role="group" aria-label="Suggestions">' + tlAskSuggestions(d).map(function (q) {
        return '<button type="button" class="ds-chip tl-ask-chip" data-ask="' + tlEsc(q) + '"><span>' + tlEsc(q) + '</span></button>';
      }).join('') + '</div>' +
      '<div class="tl-ask-row" id="tl-ask-row">' +
        '<button type="button" class="tl-ask-send" data-tl-call="tlAskSend" aria-label="Send">' +
          '<svg viewBox="0 0 40 44" focusable="false" aria-hidden="true"><polygon points="' + TL_HEX_POINTS + '"/></svg>' + tlIcon('paper-plane-right', true) + '</button>' +
      '</div>' +
      '<div class="tl-ask-meta"><span id="tl-ask-quota"></span>' +
        '<button type="button" class="ds-btn ds-btn-ghost tl-ask-settings" data-tl-go="ask/settings">' + tlIcon('sliders-horizontal') + '<span>Assistant settings</span></button></div>' +
      '<p class="tl-ask-disc">Informational only, not medical advice. Your physician decides.</p>' +
    '</div></div>';
  var root = el.firstChild;
  var thread = document.getElementById('chat-msgs'), input = document.getElementById('chat-in'), quota = document.getElementById('ai-quota');
  if (typeof initChatMemory === 'function' && thread && !thread.children.length && !(window.S && S.chatHist && S.chatHist.length)) { try { initChatMemory(); } catch (e) {} }
  tlBorrow(thread, root.querySelector('#tl-ask-thread'));
  var row = root.querySelector('#tl-ask-row');
  if (input) {
    input.setAttribute('placeholder', 'Ask about a compound, your labs or your plan');
    input.setAttribute('aria-label', 'Ask the assistant');
    input.setAttribute('enterkeyhint', 'send');
    tlBorrow(input, row);
    row.appendChild(row.querySelector('.tl-ask-send'));
  }
  if (quota) tlBorrow(quota, root.querySelector('#tl-ask-quota'));
  /* The screen's thread box scrolls, not the old element inside it. */
  var scroller = root.querySelector('#tl-ask-thread');
  var toEnd = function () { scroller.scrollTop = scroller.scrollHeight; };
  if (tlAskObserver) tlAskObserver.disconnect();
  if (thread && window.MutationObserver) {
    tlAskObserver = new MutationObserver(function () { tlAskDecorate(); if (scroller.isConnected) toEnd(); });
    tlAskObserver.observe(thread, { childList: true });
  }
  tlAskDecorate();
  toEnd();
  root.addEventListener('click', function (e) {
    var chip = e.target.closest ? e.target.closest('[data-ask]') : null;
    if (!chip || !input) return;
    input.value = chip.getAttribute('data-ask');
    tlAskSend();
  });
}

/* Send what is typed, the way the old send button did. */
function tlAskSend() {
  if (typeof sendChat === 'function') sendChat();
}
