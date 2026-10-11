<div align="center">

# PseudoPrep

**Think. Trace. Solve.**

A free, browser-based pseudocode practice platform for placement aspirants.

`HTML5` `CSS3` `Vanilla JavaScript` — no backend, no build step, no dependencies.

[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-blue)](#-deploy-to-github-pages)
[![Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-informational)](#-license)

</div>

---

## 📖 About

PseudoPrep helps engineering students prepare for pseudocode / dry-run sections
of hiring assessments by practising **code tracing** — reading a snippet of
pseudocode, manually working out the output, and checking yourself against a
validated answer key with a full explanation.

It is a complete, self-contained practice product:

- ✍️ **264 original questions** across 18 topics and 3 difficulty levels
- ⏱️ **Timed tests** with an auto-submitting deadline timer
- 🧭 **Question palette**, mark-for-review, bookmarks, clear-answer
- 📊 **Results** with topic/difficulty breakdowns and per-question explanations
- 🔁 **Review mode** — revisit incorrect questions, bookmark, and mark as mastered
- 💾 **Local persistence** — progress, theme, and attempt history in `localStorage`
- ♿ **Accessible** — semantic HTML, keyboard navigable, reduced-motion aware
- 📱 **Responsive** — works on mobile, tablet, and desktop
- 🌙 **Dark mode** with a persistent preference

> ⚠️ **Disclaimer** — PseudoPrep is an **independent educational project**.
> All questions are original practice material. It is **not** affiliated with,
> endorsed by, or reproducing questions from Infosys (or any other company).
> No official exam questions, cutoffs, or hiring patterns are claimed.

---

## 🚀 Quick Start

### Run locally (30 seconds)

1. Clone or download this repository.
2. Open **`index.html`** in any modern browser.

That's it. There is no install, no build step, and no server required.

```bash
git clone https://github.com/arya-dev2005/pseudoprep.git
cd pseudoprep
# open index.html in your browser
```

Optionally, serve it locally for the cleanest experience:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

### Run the test harness

Open **`tests.html`** in a browser. It runs a lightweight self-check on the
core scoring logic (perfect score, unanswered handling, negative marking,
zero-division safety, question-bank schema validation) and prints pass/fail
results on the page and in the console.

---

## 📁 Project Structure

```
pseudoprep/
├── index.html      # App structure (all views)
├── style.css       # Styling, theming, responsive layouts
├── script.js       # Application logic (state, timer, scoring, persistence)
├── questions.js    # Original 50-question bank (validated at load)
├── questions2.js   # Original 214-question batch, merged into the app pool
├── validate-bank.js # Schema, answer-key, artifact, bias, and arithmetic validator
├── tests.html      # Lightweight test harness for core logic
└── README.md
```

---

## 🧠 How It Works

1. **Home / Dashboard** — start a practice or timed test, browse topic-wise
   categories, and see your progress (attempts, accuracy, weakest topics,
   recent history). First visit shows an honest empty state, not fake stats.
2. **Setup** — pick a topic, difficulty, question count, and mode. Optional
   randomization (on by default) and negative marking (off by default). If the
   bank can't satisfy your selection, you get a clear explanation instead of a
   broken session.
3. **Question view** — trace the pseudocode in a monospaced, scrollable code
   block and pick an answer. Navigate freely with Previous/Next or the
   question palette; answers never get lost. Mark questions for review,
   bookmark them, or clear an answer.
4. **Submit** — manual submission asks for confirmation and reports how many
   questions are unanswered. Timed tests auto-submit exactly once when the
   deadline passes.
5. **Results** — score, correct/incorrect/unanswered counts, **accuracy of
   attempted questions** (distinct from score % of the whole test), time
   taken, topic and difficulty breakdowns, and a full question-by-question
   review with your answer, the correct answer, and an explanation.
6. **Review & Revision** — filter all questions by topic, difficulty, and
   status (previously incorrect, bookmarked, mastered). Retake any subset.

---

## ⏱️ Timer: How It Stays Honest

Timed tests use a **deadline timestamp**, not a decrementing counter:

- Refresh mid-test? The session and the **original deadline** are restored —
  refreshing cannot reset the clock.
- Time runs out? The test submits **exactly once** (guarded in code).
- Submit manually first? The timer stops immediately and the same guard
  prevents duplicate attempt records.

> **Note:** this is a client-side timer, suitable for *practice*. It is not a
> tamper-proof, server-enforced exam clock, and this app doesn't pretend to be.

---

## 💾 Data & Privacy

- All progress is stored in your browser's `localStorage` under the versioned
  key `pseudoprep.v1`.
- **No analytics, no accounts, no data ever leaves your device.**
- Progress does **not** sync across devices or browsers, and clearing site
  data erases it. A **Reset all progress** option (with confirmation) is
  built in.
- Corrupted or missing stored data is handled gracefully — the app falls back
  to defaults with a console warning instead of crashing.

---

## 📚 Pseudocode Conventions

All questions follow one documented convention set (also readable in-app
under **Conventions**):

| Construct        | Meaning                                                     |
|------------------|-------------------------------------------------------------|
| `FOR i = a TO b` | Inclusive of both `a` and `b`, step `+1` (`STEP -1` to descend) |
| `x / y`          | Integer division, truncated toward zero (`7 / 2 = 3`)       |
| `x MOD y`        | Remainder (`17 MOD 5 = 2`)                                  |
| `AND` / `OR`     | Boolean logic with **short-circuit** evaluation             |
| `BREAK`          | Exits the innermost loop                                    |
| `CONTINUE`       | Next iteration of the innermost loop                        |
| Arrays / strings | **0-indexed** unless a question explicitly says otherwise   |
| Functions        | Arguments **by value**; single `RETURN` value; base case always shown |

Students trace code **manually** — the site never executes pseudocode and
never uses `eval`.

---

## 🌐 Deploy to GitHub Pages

1. **Create a repository** on GitHub (e.g. `pseudoprep`).
2. **Upload the files to the repository root.** `index.html` must sit at the
   root — all asset paths are already relative, so Pages' `/reponame/` subpath
   works out of the box.
3. Go to **Settings → Pages**.
   - Source: *Deploy from a branch*
   - Branch: `main`, folder: `/ (root)`
   - Click **Save**.
4. Wait 1–2 minutes for the deployment to finish, then **open the URL shown
   on the Pages settings page and verify the app loads**. Deployment is only
   "done" once you've actually seen it working.
5. Push updates → they go live automatically once the deployment completes.

### Troubleshooting

| Problem | Fix |
|---|---|
| Page loads with no styling | CSS/JS files aren't at the repo root, or got renamed. Check `style.css` and `script.js` sit next to `index.html`. |
| Blank page, console shows `QUESTIONS is not defined` | `questions.js` is missing or failed to load. Check the filename/case. |
| 404 on the Pages URL | Pages may still be building — wait a couple of minutes and hard-refresh (`Ctrl+Shift+R`). |
| Old version still showing | The deployment may be cached; hard-refresh or wait a minute. |
| Progress vanished | Browser storage was cleared (private mode, "clear site data"). Progress is per-browser by design. |

---

## 🧪 Quality Assurance

Core scoring logic is covered by the test harness in `tests.html`:

- ✅ Perfect score calculation
- ✅ All-unanswered input handled without division by zero
- ✅ Negative-marking math (`+1` correct, `−0.25` wrong)
- ✅ Attempted-question accuracy vs whole-test score %
- ✅ Question-bank schema validation (ids, answer indices, options)
- ✅ Duplicate-id detection at load time

<details>
<summary><strong>Manual testing checklist (click to expand)</strong></summary>

1. Home shows an empty state on first visit; stats appear after an attempt
2. Setup availability counts are accurate; over-asking is blocked with a clear message
3. Answers persist across navigation; palette states update live
4. Timer auto-submits exactly once at expiry; manual submit cannot double-record
5. Refresh mid-timed-test resumes with the original deadline
6. Zero-attempt submission shows 0% attempted accuracy — no NaN anywhere
7. Retry-incorrect builds a session from exactly the wrong/skipped questions
8. Review filters work; bookmarks and mastered flags persist across reloads
9. Reset progress (with confirmation) wipes everything
10. Corrupt `localStorage` degrades gracefully
11. Usable at 360px / 768px / 1280px; keyboard-only navigation works
12. No console errors during normal use

</details>

---

## 🏗️ Architecture (brief)

- **`questions.js`** and **`questions2.js`** — pure data. Each question has a
  stable ID, topic, difficulty, options, a single 0-based `answerIndex`, an
  explanation, and tags. Both banks are validated at load; when both scripts
  are included, the 200-question batch is appended to `QUESTIONS` while
  remaining available separately as `QUESTIONS_BATCH2`.
- **`validate-bank.js`** — optional validator for schema rules, duplicate
  options, drafting artifacts, explanation/key consistency, answer-index bias,
  and safe arithmetic in straight-line questions without using `eval`.
- **`script.js`** — one persisted `state` object (prefs, attempts, bookmarks,
  mastered, recoverable session) plus one ephemeral runtime `session`.
  Scoring lives in a single **pure** function, `computeResults()`, shared by
  the app and the test harness, so graded logic is testable in isolation.
- **Rendering** — every view is built with DOM APIs and `textContent`; no
  `innerHTML` with dynamic data, no `eval`, no `new Function`.
- **Storage** — one versioned key with shape validation on read and
  try/catch on write.

---

## ⚠️ Known Limitations

- The question bank ships to the browser, so answers are technically
  inspectable. This is a **practice** tool, not a proctored exam — and no
  answer secrecy is claimed.
- Client-side timers are convenience timers, not tamper-proof exam clocks.
- Progress is per-browser/per-device; clearing site data erases it.
- Pseudocode is traced manually by the student; there is no interpreter.

## 🔮 Future Improvements

- Optional pseudocode interpreter for auto-graded tracing practice
- Spaced-repetition scheduling for review mode
- Progress export/import (JSON)
- JSON/CSV question import for self-authored banks
- Web Worker–based timer with integrity hashing for stricter timed practice

---

## 🤝 Contributing

Suggestions and original question contributions are welcome! If adding
questions, please:

1. Keep the existing schema (stable `id`, `topic`, `difficulty`, options,
   `answerIndex`, `explanation`, `tags`).
2. Verify each answer by hand-tracing the code.
3. Ensure distractors are plausible but clearly wrong.
4. Don't reproduce copyrighted question material.

## 📄 License

Released under the [MIT License](LICENSE).

---

<div align="center">

**PseudoPrep** — an independent educational project.
Not affiliated with or endorsed by Infosys.

</div>
