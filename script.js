/* ============================================================
   PseudoPrep application logic.
   Architecture: one state object + pure helpers + small render
   functions. Persistence is versioned ("pseudoprep.v1") and
   read/write is wrapped in try/catch with shape validation.
   ============================================================ */
"use strict";

/* ---------------- storage ---------------- */
const STORAGE_KEY = "pseudoprep.v1";

function loadProgress() {
  const blank = { prefs: { theme: "light" }, attempts: [], bookmarks: [], mastered: [], activeSession: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blank;
    const data = JSON.parse(raw);
    const out = { ...blank };
    if (data && typeof data === "object") {
      if (data.prefs && typeof data.prefs.theme === "string") out.prefs.theme = data.prefs.theme;
      if (Array.isArray(data.attempts)) out.attempts = data.attempts.filter(validAttempt);
      if (Array.isArray(data.bookmarks)) out.bookmarks = data.bookmarks.filter(x => typeof x === "string");
      if (Array.isArray(data.mastered)) out.mastered = data.mastered.filter(x => typeof x === "string");
      if (validActiveSession(data.activeSession)) out.activeSession = data.activeSession;
    }
    return out;
  } catch (e) {
    console.warn("PseudoPrep: stored progress was invalid and has been reset.", e);
    return blank;
  }
}
function validAttempt(a) {
  return a && typeof a.id === "string" && typeof a.date === "number" &&
         typeof a.correct === "number" && Array.isArray(a.questionResults);
}
function validActiveSession(s) {
  return s && typeof s === "object" && Array.isArray(s.questionIds) &&
         Array.isArray(s.answers) && s.questionIds.length === s.answers.length &&
         typeof s.config === "object" &&
         (s.deadline === null || typeof s.deadline === "number");
}
function saveProgress() {
  try {
    const persist = {
      prefs: state.prefs,
      attempts: state.attempts.slice(0, 60),
      bookmarks: state.bookmarks,
      mastered: state.mastered,
      activeSession: state.activeSession
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  } catch (e) {
    console.warn("PseudoPrep: could not save progress (storage unavailable or full).", e);
    toast("Warning: progress could not be saved in this browser.");
  }
}

/* ---------------- state ---------------- */
const state = loadProgress();
let session = null;      // runtime session (questions are live references)
let timerId = null;
let lastResults = null;  // results of the most recent attempt (for retry-incorrect)

const $ = (id) => document.getElementById(id);
const listen = (id, event, handler) => {
  const element = $(id);
  if (element) element.addEventListener(event, handler);
};
const byId = Object.create(null);
const qById = (qid) => byId[qid] || (byId[qid] = QUESTIONS.find(q => q.id === qid));

/* ---------------- utils ---------------- */
function esc() { /* unused — we always use textContent */ }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function fmtTime(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60), r = s % 60;
  return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
}
function pct(n, d) { return d === 0 ? 0 : Math.round((n / d) * 100); }
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, 2600);
}

/* ---------------- views / router ---------------- */
const VIEWS = ["home", "setup", "quiz", "results", "review", "conventions"];
function showView(name) {
  for (const v of VIEWS) {
    const el = $("view-" + v);
    if (el) el.hidden = (v !== name);
  }
  window.scrollTo({ top: 0, behavior: "auto" });
  if (name === "home") renderHome();
  if (name === "review") renderReview();
}

/* ---------------- dashboard ---------------- */
function renderHome() {
  $("statTotal").textContent = String(QUESTIONS.length);
  const attempts = state.attempts;
  if (attempts.length === 0) {
    $("statAttempts").textContent = "0";
    $("statAccuracy").textContent = "—";
    $("emptyStats").hidden = false;
    $("weakTopicsBox").hidden = true;
    $("emptyHistory").hidden = false;
    $("resetBtn").hidden = true;
    $("historyList").replaceChildren();
  } else {
    let answered = 0, correct = 0;
    for (const a of attempts) { answered += a.correct + a.wrong; correct += a.correct; }
    $("statAttempts").textContent = String(attempts.length);
    $("statAccuracy").textContent = answered ? pct(correct, answered) + "%" : "—";
    $("emptyStats").hidden = true;

    // weakest topics (min 3 answered)
    const perTopic = {};
    for (const a of attempts) {
      for (const r of a.questionResults) {
        const q = qById(r.qid);
        if (!q) continue;
        const t = perTopic[q.topic] || (perTopic[q.topic] = { a: 0, c: 0 });
        if (r.selected !== null) { t.a++; if (r.selected === q.answerIndex) t.c++; }
      }
    }
    const weak = Object.entries(perTopic)
      .filter(([, v]) => v.a >= 3)
      .map(([topic, v]) => ({ topic, acc: pct(v.c, v.a) }))
      .sort((x, y) => x.acc - y.acc)
      .slice(0, 3);
    if (weak.length) {
      $("weakTopicsBox").hidden = false;
      $("weakTopics").replaceChildren(...weak.map(w => {
        const li = document.createElement("li");
        const name = document.createElement("span"); name.textContent = w.topic;
        const val = document.createElement("span"); val.textContent = w.acc + "% correct";
        li.append(name, val);
        return li;
      }));
    } else {
      $("weakTopicsBox").hidden = true;
    }

    const hist = attempts.slice().reverse().slice(0, 5);
    $("historyList").replaceChildren(...hist.map(a => {
      const li = document.createElement("li");
      const left = document.createElement("span");
      left.textContent = new Date(a.date).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) + " · " + a.mode;
      const right = document.createElement("span");
      right.textContent = a.correct + "/" + a.total + " (" + a.attemptedAccuracy + "% attempted)";
      li.append(left, right);
      return li;
    }));
    $("emptyHistory").hidden = true;
    $("resetBtn").hidden = false;
  }

  // continue box
  const cont = state.activeSession;
  if (cont) {
    $("continueBox").hidden = false;
    const elapsed = cont.deadline ? fmtTime(cont.deadline - Date.now()) + " left" : "untimed";
    $("continueInfo").textContent =
      cont.config.mode === "timed" ? "Timed test in progress (" + elapsed + ")." : "Practice session in progress.";
  } else {
    $("continueBox").hidden = true;
  }

  // topic grid
  const grid = $("topicGrid");
  grid.replaceChildren(...TOPICS.map(t => {
    const n = QUESTIONS.filter(q => q.topic === t).length;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn topic-btn";
    b.textContent = t + " (" + n + ")";
    b.addEventListener("click", () => openSetup({ topic: t }));
    return b;
  }));
}

/* ---------------- setup ---------------- */
let setupDefaults = { mode: "practice", topic: "all" };
function openSetup(overrides) {
  setupDefaults = { ...setupDefaults, ...overrides };
  populateTopicSelect();
  $("cfgMode").value = setupDefaults.mode;
  const selectedTopics = setupDefaults.topic === "all" ? ["all"] :
    (Array.isArray(setupDefaults.topic) ? setupDefaults.topic : [setupDefaults.topic]);
  [...$("cfgTopic").options].forEach(option => {
    option.selected = selectedTopics.includes(option.value);
  });
  $("cfgDifficulty").value = "all";
  $("cfgNegative").checked = false;
  $("cfgRandomize").checked = true;
  buildCountRadios();
  updateAvailableInfo();
  $("setupError").hidden = true;
  showView("setup");
}
function populateTopicSelect() {
  const select = $("cfgTopic");
  if (!select || select.dataset.built === "1") return;
  select.replaceChildren(
    Object.assign(document.createElement("option"), { value: "all", textContent: "All topics" }),
    ...TOPICS.map(t => Object.assign(document.createElement("option"), { value: t, textContent: t }))
  );
  select.dataset.built = "1";
  updateSetupCounts();
}
function buildCountRadios() {
  const counts = [5, 10, 15, 20];
  const wrap = $("countRadios");
  wrap.replaceChildren(...counts.map((c, i) => {
    const label = document.createElement("label");
    const radio = document.createElement("input");
    radio.type = "radio"; radio.name = "cfgCount"; radio.value = String(c);
    if (i === 0) radio.checked = true;
    label.append(radio, document.createTextNode(" " + c));
    return label;
  }));
}
function selectedCount() {
  const r = document.querySelector('input[name="cfgCount"]:checked');
  return r ? parseInt(r.value, 10) : 5;
}
function poolFor() {
  const topics = selectedTopics();
  const diff = $("cfgDifficulty").value;
  return QUESTIONS.filter(q =>
    (topics.includes("all") || topics.includes(q.topic)) &&
    (diff === "all" || q.difficulty === diff)
  );
}
function selectedTopics() {
  return [...$("cfgTopic").selectedOptions].map(option => option.value);
}
function normalizeTopicSelection() {
  const select = $("cfgTopic");
  const all = select.querySelector('option[value="all"]');
  const topics = [...select.selectedOptions].filter(option => option.value !== "all");
  if (topics.length > 0) all.selected = false;
  if (topics.length === 0) all.selected = true;
}
function updateSetupCounts() {
  const topicSelect = $("cfgTopic");
  const difficultySelect = $("cfgDifficulty");
  if (!topicSelect || !difficultySelect) return;
  const selected = selectedTopics();
  const activeTopics = selected.includes("all") || selected.length === 0 ? TOPICS : selected;
  const selectedDifficulty = difficultySelect.value;
  [...topicSelect.options].forEach(option => {
    if (option.value === "all") {
      const count = QUESTIONS.filter(q => selectedDifficulty === "all" || q.difficulty === selectedDifficulty).length;
      option.textContent = `All topics (${count})`;
      return;
    }
    const count = QUESTIONS.filter(q => q.topic === option.value &&
      (selectedDifficulty === "all" || q.difficulty === selectedDifficulty)).length;
    option.textContent = `${option.value} (${count})`;
  });
  [...difficultySelect.options].forEach(option => {
    const count = QUESTIONS.filter(q => activeTopics.includes(q.topic) &&
      (option.value === "all" || q.difficulty === option.value)).length;
    option.textContent = option.value === "all" ? `All levels (${count})` : `${option.value} (${count})`;
  });
}
function updateAvailableInfo() {
  const n = poolFor().length;
  const topics = selectedTopics();
  const topicLabel = topics.includes("all") || topics.length === 0 ? "All topics" :
    `${topics.length} topics selected`;
  const diff = $("cfgDifficulty").value === "all" ? "all levels" : $("cfgDifficulty").value;
  $("availableInfo").textContent = `${topicLabel} · ${diff} → ${n} question(s) available.`;
  updateSetupCounts();
}
document.addEventListener("change", (e) => {
  if (e.target.closest("#setupForm") && (e.target.id === "cfgTopic" || e.target.id === "cfgDifficulty")) {
    if (e.target.id === "cfgTopic") normalizeTopicSelection();
    updateAvailableInfo();
  }
});
listen("setupForm", "submit", (e) => {
  e.preventDefault();
  const pool = poolFor();
  const want = selectedCount();
  const err = $("setupError");
  if (pool.length === 0) {
    err.textContent = "No questions match this topic and difficulty combination. Try a different selection.";
    err.hidden = false;
    return;
  }
  if (pool.length < want) {
    err.textContent = "Only " + pool.length + " question(s) are available for this selection — please choose " +
      pool.length + " or fewer, or widen the topic/difficulty filters.";
    err.hidden = false;
    return;
  }
  err.hidden = true;
  startSession({
    topics: selectedTopics().includes("all") || selectedTopics().length === 0 ? ["all"] : selectedTopics(),
    difficulty: $("cfgDifficulty").value,
    count: want,
    mode: $("cfgMode").value,
    randomize: $("cfgRandomize").checked,
    negative: $("cfgNegative").checked
  });
});

/* ---------------- session lifecycle ---------------- */
function startSession(config) {
  let pool = QUESTIONS.filter(q =>
    (config.topics.includes("all") || config.topics.includes(q.topic)) &&
    (config.difficulty === "all" || q.difficulty === config.difficulty)
  ).slice(0, config.count);
  if (config.randomize) pool = shuffle(pool);

  session = {
    config,
    questions: pool,
    answers: new Array(pool.length).fill(null),
    cleared: new Array(pool.length).fill(false),
    visited: new Array(pool.length).fill(false),
    marked: new Array(pool.length).fill(false),
    current: 0,
    startedAt: Date.now(),
    deadline: config.mode === "timed" ? Date.now() + pool.length * 60 * 1000 : null,
    finished: false
  };
  persistActiveSession();
  beginQuizUI();
}
function persistActiveSession() {
  if (!session || session.finished) { state.activeSession = null; saveProgress(); return; }
  state.activeSession = {
    config: session.config,
    questionIds: session.questions.map(q => q.id),
    answers: session.answers,
    cleared: session.cleared,
    visited: session.visited,
    marked: session.marked,
    currentIndex: session.current,
    startedAt: session.startedAt,
    deadline: session.deadline
  };
  saveProgress();
}
function resumeSession() {
  const s = state.activeSession;
  if (!s || !validActiveSession(s)) { toast("No recoverable session found."); return; }
  const qs = s.questionIds.map(qById).filter(Boolean);
  if (qs.length !== s.questionIds.length) {
    // bank changed since save — discard rather than risk invalid indices
    state.activeSession = null; saveProgress();
    toast("Saved session referenced missing questions and was discarded.");
    return;
  }
  // timed deadline is preserved exactly, so refreshing cannot reset the timer
  if (s.deadline !== null && Date.now() >= s.deadline) {
    session = { config: s.config, questions: qs, answers: s.answers, cleared: Array.isArray(s.cleared) ? s.cleared : new Array(qs.length).fill(false), visited: Array.isArray(s.visited) ? s.visited : new Array(qs.length).fill(false), marked: s.marked, current: s.currentIndex, startedAt: s.startedAt, deadline: s.deadline, finished: false };
    beginQuizUI();
    submitTest(false); // time already expired during the break
    return;
  }
  session = { config: s.config, questions: qs, answers: s.answers.slice(), cleared: Array.isArray(s.cleared) ? s.cleared.slice() : new Array(qs.length).fill(false), visited: Array.isArray(s.visited) ? s.visited.slice() : new Array(qs.length).fill(false), marked: s.marked.slice(), current: s.currentIndex, startedAt: s.startedAt, deadline: s.deadline, finished: false };
  beginQuizUI();
  toast("Session restored.");
}

/* ---------------- quiz UI ---------------- */
function beginQuizUI() {
  showView("quiz");
  renderQuestion();
  renderPalette();
  const timed = session.deadline !== null;
  $("timerBox").hidden = !timed;
  if (timed) startTimer(); else stopTimer();
}
function startTimer() {
  stopTimer();
  updateTimer();
  timerId = setInterval(updateTimer, 500);
}
function stopTimer() {
  if (timerId !== null) { clearInterval(timerId); timerId = null; }
}
function updateTimer() {
  if (!session || session.finished || session.deadline === null) { stopTimer(); return; }
  const remaining = session.deadline - Date.now();
  const box = $("timerBox");
  $("timerText").textContent = fmtTime(remaining);
  box.classList.toggle("urgent", remaining <= 60 * 1000);
  if (remaining <= 0) {
    stopTimer();
    toast("Time is up — submitting automatically.");
    submitTest(false); // deadline-based, so refreshes can't reset the clock
  }
}

function renderQuestion() {
  const i = session.current;
  const q = session.questions[i];
  $("qNum").textContent = String(i + 1);
  $("qTotal").textContent = String(session.questions.length);
  $("qDifficulty").textContent = q.difficulty;
  $("qTopic").textContent = q.topic;
  $("quizMeta").textContent = (session.config.mode === "timed" ? "Timed test" : "Practice") +
    (session.config.negative ? " · negative marking on" : "");

  $("qPrompt").textContent = q.prompt;
  $("qCode").textContent = q.code;

  // options: accessible radio group built via DOM (no innerHTML for content)
  const wrap = $("options");
  wrap.replaceChildren(...q.options.map((opt, oi) => {
    const label = document.createElement("label");
    label.className = "option";
    const input = document.createElement("input");
    input.type = "radio"; input.name = "answer"; input.value = String(oi);
    if (session.answers[i] === oi) { input.checked = true; label.classList.add("selected"); }
    input.addEventListener("change", () => selectAnswer(oi));
    const key = document.createElement("span");
    key.className = "key";
    key.textContent = String.fromCharCode(65 + oi);
    const text = document.createElement("span");
    text.textContent = opt;
    label.append(input, key, text);
    return label;
  }));

  // buttons state
  $("prevBtn").disabled = i === 0;
  $("nextBtn").textContent = i === session.questions.length - 1 ? "Last question" : "Next →";
  const markBtn = $("markBtn");
  markBtn.setAttribute("aria-pressed", String(session.marked[i]));
  markBtn.textContent = session.marked[i] ? "★ Marked for review" : "☆ Mark for review";
  const bmBtn = $("bookmarkBtn");
  const isBm = state.bookmarks.includes(q.id);
  bmBtn.setAttribute("aria-pressed", String(isBm));
  bmBtn.textContent = isBm ? "★ Bookmarked" : "Bookmark";

  updateProgress();
}
function updateProgress() {
  const answered = session.answers.filter(a => a !== null).length;
  const p = pct(answered, session.questions.length);
  $("progressFill").style.width = p + "%";
  $("progressBar").setAttribute("aria-valuenow", String(p));
  $("progressBar").setAttribute("aria-label", answered + " of " + session.questions.length + " questions answered");
}
function renderPalette() {
  const pal = $("palette");
  pal.replaceChildren(...session.questions.map((q, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = String(i + 1);
    b.setAttribute("aria-label", "Go to question " + (i + 1) +
      (session.answers[i] !== null ? " (answered)" : "") +
      (session.marked[i] ? " (marked for review)" : ""));
    if (session.answers[i] !== null) b.classList.add("answered");
    if (session.cleared[i] || (session.visited[i] && session.answers[i] === null)) b.classList.add("unanswered");
    if (session.marked[i]) b.classList.add("marked");
    if (i === session.current) b.classList.add("current");
    b.addEventListener("click", () => navigateQuestion(i));
    return b;
  }));
}

/* ---------------- interactions ---------------- */
function selectAnswer(oi) {
  session.answers[session.current] = oi;
  session.cleared[session.current] = false;
  renderQuestion();
  renderPalette();
  persistActiveSession();
}
function clearAnswer() {
  if (session.answers[session.current] === null) return;
  session.answers[session.current] = null;
  session.cleared[session.current] = true;
  renderQuestion();
  renderPalette();
  persistActiveSession();
  toast("Answer cleared.");
}
function navigateQuestion(i) {
  session.visited[session.current] = true;
  session.current = Math.max(0, Math.min(session.questions.length - 1, i));
  renderQuestion();
  renderPalette();
  persistActiveSession();
}
function toggleMark() {
  const i = session.current;
  session.marked[i] = !session.marked[i];
  renderQuestion();
  renderPalette();
  persistActiveSession();
}
function toggleBookmarkCurrent() {
  const qid = session.questions[session.current].id;
  const idx = state.bookmarks.indexOf(qid);
  if (idx >= 0) state.bookmarks.splice(idx, 1); else state.bookmarks.push(qid);
  saveProgress();
  renderQuestion();
  toast(state.bookmarks.includes(qid) ? "Bookmarked." : "Bookmark removed.");
}

listen("prevBtn", "click", () => navigateQuestion(session.current - 1));
listen("nextBtn", "click", () => navigateQuestion(session.current + 1));
listen("clearBtn", "click", clearAnswer);
listen("markBtn", "click", toggleMark);
listen("bookmarkBtn", "click", toggleBookmarkCurrent);

/* ---------------- submission ---------------- */
listen("submitBtn", "click", () => {
  const unanswered = session.answers.filter(a => a === null).length;
  $("submitDialogInfo").textContent = unanswered === 0
    ? "All questions are answered. Submit now?"
    : unanswered + " question(s) are still unanswered. Unanswered questions score zero. Submit now?";
  $("submitDialog").showModal();
});
listen("cancelSubmitBtn", "click", () => $("submitDialog").close());
listen("confirmSubmitBtn", "click", () => {
  $("submitDialog").close();
  submitTest(true);
});

function submitTest(manual) {
  if (!session || session.finished) return; // guard: submission handled exactly once
  session.finished = true;
  stopTimer();
  const timeTaken = Date.now() - session.startedAt;
  const results = computeResults(session.questions, session.answers, session.config.negative);
  lastResults = { ...results, questions: session.questions.slice(), answers: session.answers.slice(), mode: session.config.mode, timeTaken, negative: session.config.negative };
  saveAttempt(lastResults);
  state.activeSession = null;
  saveProgress();
  renderResults();
  showView("results");
  if (manual) toast("Test submitted.");
}

/* Pure scoring function — also used by the test harness. */
function computeResults(questions, answers, negative) {
  let correct = 0, wrong = 0, unanswered = 0;
  const questionResults = questions.map((q, i) => {
    const sel = (answers && answers[i] !== undefined) ? answers[i] : null;
    if (sel === null) { unanswered++; return { qid: q.id, selected: null }; }
    if (sel === q.answerIndex) correct++;
    else wrong++;
    return { qid: q.id, selected: sel };
  });
  const attempted = correct + wrong;
  let score = correct;
  if (negative) score = correct - wrong * 0.25;
  return {
    total: questions.length,
    correct, wrong, unanswered,
    score: Math.round(score * 100) / 100,
    maxScore: questions.length,
    scorePct: pct(Math.max(0, score), questions.length),
    attemptedAccuracy: pct(correct, attempted), // 0 when nothing attempted — no division by zero
    attempted,
    questionResults
  };
}
window.PseudoPrep = { computeResults }; // exposed for tests.html

function saveAttempt(results) {
  state.attempts.push({
    id: "a" + Date.now(),
    date: Date.now(),
    mode: lastResults.mode,
    timeTaken: lastResults.timeTaken,
    correct: results.correct,
    wrong: results.wrong,
    unanswered: results.unanswered,
    total: results.total,
    attemptedAccuracy: results.attemptedAccuracy,
    questionResults: results.questionResults
  });
}

/* ---------------- results ---------------- */
function renderResults() {
  const r = lastResults;
  const cards = [
    { num: r.score + " / " + r.total, lbl: "Score" + (r.negative ? " (−0.25/wrong)" : "") },
    { num: String(r.correct), lbl: "Correct" },
    { num: String(r.wrong), lbl: "Incorrect" },
    { num: String(r.unanswered), lbl: "Unanswered" },
    { num: r.attemptedAccuracy + "%", lbl: "Accuracy of attempted" },
    { num: r.scorePct + "%", lbl: "Score % of whole test" },
    { num: fmtTime(r.timeTaken), lbl: "Time taken" }
  ];
  $("resultsSummary").replaceChildren(...cards.map(c => {
    const d = document.createElement("div");
    d.className = "card";
    const n = document.createElement("div"); n.className = "num"; n.textContent = c.num;
    const l = document.createElement("div"); l.className = "lbl"; l.textContent = c.lbl;
    d.append(n, l);
    return d;
  }));

  // topic & difficulty breakdowns
  const byTopic = {}, byDiff = {};
  r.questions.forEach((q, i) => {
    const sel = r.answers[i];
    for (const [map, key] of [[byTopic, q.topic], [byDiff, q.difficulty]]) {
      const e = map[key] || (map[key] = { a: 0, c: 0 });
      if (sel !== null) { e.a++; if (sel === q.answerIndex) e.c++; }
    }
  });
  const fillPerf = (el, map) => {
    const items = Object.entries(map).map(([k, v]) => {
      const li = document.createElement("li");
      const nm = document.createElement("span"); nm.textContent = k;
      const val = document.createElement("span");
      val.textContent = v.a ? v.c + "/" + v.a + " (" + pct(v.c, v.a) + "%)" : "not attempted";
      li.append(nm, val);
      return li;
    });
    el.replaceChildren(...(items.length ? items : [Object.assign(document.createElement("li"), { textContent: "No data" })]));
  };
  fillPerf($("topicPerf"), byTopic);
  fillPerf($("diffPerf"), byDiff);

  // question review
  $("resultsReview").replaceChildren(...r.questions.map((q, i) => reviewCard(q, r.answers[i], i)));
  $("retryIncorrectBtn").hidden = !(r.wrong > 0 || r.unanswered > 0);
}
function reviewCard(q, selected, questionIndex) {
  const card = document.createElement("div");
  card.className = "card review-item";
  const badge = document.createElement("span");
  if (selected === null) { badge.className = "badge skip"; badge.textContent = "Skipped"; card.classList.add("flag-skipped"); }
  else if (selected === q.answerIndex) { badge.className = "badge ok"; badge.textContent = "Correct"; card.classList.add("flag-correct"); }
  else { badge.className = "badge no"; badge.textContent = "Incorrect"; card.classList.add("flag-incorrect"); }
  const head = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = "Q" + (questionIndex + 1) + ". " + q.prompt;
  head.append(badge, document.createTextNode(" "), strong);

  const pre = document.createElement("pre");
  pre.className = "code"; pre.textContent = q.code;

  const opts = document.createElement("div");
  opts.className = "review-options";
  q.options.forEach((opt, oi) => {
    const d = document.createElement("div");
    d.className = "option";
    if (oi === q.answerIndex) d.classList.add("opt-correct");
    else if (oi === selected) d.classList.add("opt-wrong");
    const key = document.createElement("span");
    key.className = "key"; key.textContent = String.fromCharCode(65 + oi);
    const txt = document.createElement("span"); txt.textContent = opt;
    d.append(key, txt);
    opts.append(d);
  });

  const your = document.createElement("p");
  your.className = "muted";
  your.textContent = "Your answer: " + (selected === null ? "not answered" :
    String.fromCharCode(65 + selected) + ". " + q.options[selected]);
  const expl = document.createElement("p");
  expl.className = "explanation";
  expl.textContent = "Explanation: " + q.explanation;

  card.append(head, pre, opts, your, expl);
  return card;
}
listen("retryIncorrectBtn", "click", () => {
  if (!lastResults) return;
  const wrongIds = lastResults.questionResults
    .filter(r => r.selected === null || r.selected !== qById(r.qid).answerIndex)
    .map(r => r.qid);
  startRetry(wrongIds);
});
function startRetry(ids) {
  const qs = ids.map(qById).filter(Boolean);
  if (!qs.length) { toast("Nothing to retry."); return; }
  session = {
    config: { topic: "all", difficulty: "all", count: qs.length, mode: "practice", randomize: false, negative: false, retry: true },
    questions: qs,
    answers: new Array(qs.length).fill(null),
    cleared: new Array(qs.length).fill(false),
    visited: new Array(qs.length).fill(false),
    marked: new Array(qs.length).fill(false),
    current: 0,
    startedAt: Date.now(),
    deadline: null,
    finished: false
  };
  persistActiveSession();
  beginQuizUI();
}

/* ---------------- review mode ---------------- */
function renderReview() {
  const topicsSel = $("rvTopic");
  if (topicsSel.options.length === 0 || topicsSel.dataset.built !== "1") {
    topicsSel.replaceChildren(
      Object.assign(document.createElement("option"), { value: "all", textContent: "All topics" }),
      ...TOPICS.map(t => Object.assign(document.createElement("option"), { value: t, textContent: t }))
    );
    topicsSel.dataset.built = "1";
  }
  applyReviewFilters();
}
function applyReviewFilters() {
  const topic = $("rvTopic").value;
  const diff = $("rvDifficulty").value;
  const cat = $("rvCategory").value;
  const incorrectIds = new Set();
  for (const a of state.attempts) {
    for (const r of a.questionResults) {
      const q = qById(r.qid);
      if (q && r.selected !== null && r.selected !== q.answerIndex) incorrectIds.add(r.qid);
    }
  }
  const list = QUESTIONS.filter(q =>
    (topic === "all" || q.topic === topic) &&
    (diff === "all" || q.difficulty === diff) &&
    (cat === "all" ||
      (cat === "incorrect" && incorrectIds.has(q.id)) ||
      (cat === "bookmarked" && state.bookmarks.includes(q.id)) ||
      (cat === "mastered" && state.mastered.includes(q.id)) ||
      (cat === "unmastered" && !state.mastered.includes(q.id)))
  );
  $("reviewCount").textContent = list.length + " question(s) shown.";
  $("reviewList").replaceChildren(...list.map(q => reviewEditorCard(q, incorrectIds.has(q.id))));
}
function reviewEditorCard(q, wasIncorrect) {
  const card = document.createElement("div");
  card.className = "card review-item";
  const head = document.createElement("p");
  if (wasIncorrect) { const b = document.createElement("span"); b.className = "badge no"; b.textContent = "Incorrect before"; head.append(b, document.createTextNode(" ")); }
  const strong = document.createElement("strong"); strong.textContent = q.prompt;
  head.append(strong);
  const meta = document.createElement("p");
  meta.className = "muted"; meta.textContent = q.topic + " · " + q.difficulty;

  const pre = document.createElement("pre");
  pre.className = "code"; pre.textContent = q.code;

  const opts = document.createElement("div");
  opts.className = "review-options";
  q.options.forEach((opt, oi) => {
    const d = document.createElement("div");
    d.className = "option";
    if (oi === q.answerIndex) d.classList.add("opt-correct");
    d.append(Object.assign(document.createElement("span"), { className: "key", textContent: String.fromCharCode(65 + oi) }),
             Object.assign(document.createElement("span"), { textContent: opt }));
    opts.append(d);
  });

  const expl = document.createElement("p");
  expl.className = "explanation";
  expl.textContent = "Explanation: " + q.explanation;

  const row = document.createElement("div");
  row.className = "row";
  const bm = document.createElement("button");
  bm.className = "btn ghost small";
  bm.setAttribute("aria-pressed", String(state.bookmarks.includes(q.id)));
  bm.textContent = state.bookmarks.includes(q.id) ? "★ Bookmarked" : "Bookmark";
  bm.addEventListener("click", () => {
    const i = state.bookmarks.indexOf(q.id);
    if (i >= 0) state.bookmarks.splice(i, 1); else state.bookmarks.push(q.id);
    saveProgress(); applyReviewFilters();
  });
  const mst = document.createElement("button");
  mst.className = "btn ghost small";
  mst.setAttribute("aria-pressed", String(state.mastered.includes(q.id)));
  mst.textContent = state.mastered.includes(q.id) ? "✓ Mastered" : "Mark as mastered";
  mst.addEventListener("click", () => {
    const i = state.mastered.indexOf(q.id);
    if (i >= 0) state.mastered.splice(i, 1); else state.mastered.push(q.id);
    saveProgress(); applyReviewFilters();
    toast(state.mastered.includes(q.id) ? "Marked as mastered." : "Removed from mastered.");
  });
  const tryBtn = document.createElement("button");
  tryBtn.className = "btn ghost small";
  tryBtn.textContent = "Practise this question";
  tryBtn.addEventListener("click", () => startRetry([q.id]));
  row.append(bm, mst, tryBtn);

  card.append(head, meta, pre, opts, expl, row);
  return card;
}
listen("reviewFilters", "change", applyReviewFilters);
listen("practiseIncorrectBtn", "click", () => {
  const incorrectIds = [];
  for (const a of state.attempts) {
    for (const r of a.questionResults) {
      const q = qById(r.qid);
      if (q && r.selected !== null && r.selected !== q.answerIndex && !incorrectIds.includes(r.qid)) incorrectIds.push(r.qid);
    }
  }
  if (!incorrectIds.length) { toast("No previously incorrect questions yet."); return; }
  startRetry(incorrectIds);
});

/* ---------------- reset ---------------- */
listen("resetBtn", "click", () => $("resetDialog").showModal());
listen("cancelResetBtn", "click", () => $("resetDialog").close());
listen("confirmResetBtn", "click", () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  state.prefs = { theme: state.prefs.theme }; // keep theme
  state.attempts = []; state.bookmarks = []; state.mastered = [];
  state.activeSession = null; session = null; lastResults = null;
  saveProgress();
  $("resetDialog").close();
  showView("home");
  toast("All progress deleted.");
});

/* ---------------- hero heading effect ---------------- */
function setupHeroJumble() {
  const word = document.querySelector(".hero h2 span");
  if (!word || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const original = word.textContent;
  const glyphs = "!<>/=+*?#01";
  let timer = null;
  let run = 0;

  word.addEventListener("mouseenter", () => {
    clearInterval(timer);
    const currentRun = ++run;
    let step = 0;
    const totalSteps = original.length + 5;

    timer = setInterval(() => {
      if (currentRun !== run) {
        clearInterval(timer);
        return;
      }
      word.textContent = original.split("").map((letter, index) => {
        if (letter === " " || index < step - 3) return letter;
        return glyphs[Math.floor(Math.random() * glyphs.length)];
      }).join("");
      step += 1;
      if (step > totalSteps) {
        clearInterval(timer);
        word.textContent = original;
      }
    }, 42);
  });

  word.addEventListener("mouseleave", () => {
    ++run;
    clearInterval(timer);
    word.textContent = original;
  });
}

/* ---------------- global wiring ---------------- */
document.addEventListener("click", (e) => {
  const nav = e.target.closest("[data-nav]");
  if (nav) { showView(nav.dataset.nav); return; }
  const act = e.target.closest("[data-action]");
  if (!act) return;
  switch (act.dataset.action) {
    case "go-setup": openSetup({ mode: act.dataset.mode || "practice", topic: "all" }); break;
    case "continue-session": resumeSession(); break;
    case "discard-session":
      state.activeSession = null; saveProgress();
      renderHome(); toast("Saved session discarded.");
      break;
    case "reset-progress": $("resetDialog").showModal(); break;
  }
});
/* init */
if ($("app")) {
  populateTopicSelect();
  setupHeroJumble();
  showView("home");
}