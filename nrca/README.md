# NRCA Brain — TruPro Roofing internal tool

A private, in-browser assistant built on TruPro's licensed copy of the NRCA Roofing
Manual. Ask technical questions and get answers with citations to the actual manual
sections, upload roof photos for analysis, and draft repair scopes that can be pasted
straight into an estimate.

**Live pages** (once merged to the site):

- `…/nrca/` — the chat tool (daily use)
- `…/nrca/process.html` — the one-time manual processor (setup only)

## How it keeps the manual private

This repository is public, so **no manual content ever lives here** — only the tool's
code. The manual is processed **entirely inside your browser**: you drag the PDF in
once, the text is extracted on your own device, and the resulting search index is
stored in your browser (IndexedDB) plus a single backup file, `nrca-index.json`,
that you keep in the company Google Drive. Manual text leaves your device only as
small excerpts sent to Anthropic's API (api.anthropic.com) to answer your questions —
the same place the photos you attach go. Nothing else is contacted, ever.

Do not share `nrca-index.json` outside TruPro — it contains the manual's text, and
the manual is licensed to the company.

## One-time setup (one person does this)

1. Download `NRCA-RoofMan26e-1082.pdf` from the company Google Drive to a desktop
   or laptop (not a phone — processing 1,082 pages needs a machine that stays awake).
2. Open `…/nrca/process.html` and drag the PDF in.
3. The tool first tries to read the PDF's text layer — free and fast. Pages without
   readable text need OCR; you'll be offered two options:
   - **On-device OCR (free)** — runs locally, roughly 1–2 hours for the full manual,
     decent quality.
   - **Claude OCR (recommended)** — much better with tables and dense layouts. Needs
     an Anthropic API key; the page shows the estimated cost for your chosen model
     **before** anything is spent (rough guide for ~1,000 pages: Haiku ≈ $10,
     Sonnet ≈ $20, Opus ≈ $45).
   Keep the tab open; progress is checkpointed, so if anything interrupts it you can
   reload and resume where it left off.
4. When it finishes, click **Download nrca-index.json** and put that file in Google
   Drive next to the manual PDF.

**Everyone else on the team:** open `…/nrca/`, choose *Import nrca-index.json*, and
pick the file from Drive. Done — no reprocessing.

## Using the chat

- Open settings (gear icon), paste your Anthropic API key (from
  [console.anthropic.com](https://console.anthropic.com) → API Keys), and pick a
  model. The key is stored only in your browser.
- Ask anything the manual covers — fastening patterns, flashing details, slope
  requirements, membrane compatibility. Answers cite pages like **[NRCA p. 412]**;
  tap a citation to see the manual text it came from.
- **Photos:** attach roof photos from the field (camera button) and describe the
  problem — the assistant reads the photos alongside the manual.
- **Repair scopes:** ask for one ("draft a repair scope for this") and you'll get a
  structured scope card with copy/download buttons, formatted to paste into an
  estimate.

**Cost:** typical questions run a few cents to ~$0.15 each on Opus (the default,
best answers); Sonnet and Haiku are cheaper. There is no subscription — you pay
Anthropic per use through your API key.

## Notes

- Answers are decision support for trained roofing professionals, not a substitute
  for the manual itself or for code/manufacturer requirements on a specific job.
- Chats and the index live in the browser you used. Clearing site data removes
  them (re-import the index JSON to restore).
- New manual edition later? Run the processor again on the new PDF and replace
  `nrca-index.json` in Drive.
