/* validate-bank.js — PseudoPrep bank linter.
   Load AFTER questions.js / batch files, then run:  validateBankEnhanced()
   Conventions assumed: integer division truncates toward zero; MOD takes the
   dividend's sign; C-style precedence (shifts bind tighter than + -).        */
"use strict";

const ARTIFACTS = /recheck|hold on|wait,|invalid|ambiguous|correction|depends on implementation/i;
const SKIP_KEYWORDS = /\b(FOR|WHILE|DO|IF|ELSE|BREAK|CONTINUE|FUNCTION|END|RETURN|PUSH|POP|ENQUEUE|DEQUEUE|SWAP)\b/;

/* ---- safe arithmetic evaluator (recursive descent, no eval) ---- */
function tokenizeArith(s) {
  const out = [];
  const re = /\s*(<<|>>|MOD|%|[-+*/()&|^]|\d+(?:\.\d+)?|[A-Za-z_]\w*)/y;
  let i = 0;
  while (i < s.length) {
    re.lastIndex = i;
    const m = re.exec(s);
    if (!m || m[0] === "") return null;          // unexpected char → not pure arithmetic
    out.push(m[1]); i = re.lastIndex;
  }
  return out;
}

function evalArith(src, env) {
  const toks = tokenizeArith(src);
  if (!toks) return { ok: false };
  // If the expression contains a decimal literal, use real division throughout.
  const hasDot = /\d\.\d/.test(src);
  let p = 0;
  const peek = () => toks[p];
  const eat = () => toks[p++];
  function primary() {
    const t = eat();
    if (t === "(") { const v = expr(); if (peek() !== ")") throw 0; eat(); return v; }
    if (t === "-") return -primary();
    if (/^\d/.test(t)) return parseFloat(t);
    if (/^[A-Za-z_]/.test(t)) {
      if (env && Object.prototype.hasOwnProperty.call(env, t)) return env[t];
      throw 0;                                    // unknown identifier → unverifiable
    }
    throw 0;
  }
  function mul() {
    let v = primary();
    while (peek() === "*" || peek() === "/" || peek() === "MOD" || peek() === "%") {
      const op = eat(); const r = primary();
      if (op === "*") v = v * r;
      else if (hasDot) v = v / r;                 // real division when decimals present
      else { const q = Math.trunc(v / r); v = (op === "/") ? q : (v - q * r); }
    }
    return v;
  }
  function shift() { let v = mul(); while (peek() === "<<" || peek() === ">>") { const op = eat(); const r = mul(); v = (op === "<<") ? (v << r) : (v >> r); } return v; }
  function add()  { let v = shift(); while (peek() === "+" || peek() === "-") { const op = eat(); const r = shift(); v = (op === "+") ? v + r : v - r; } return v; }
  function andE() { let v = add();  while (peek() === "&") { eat(); v = v & add(); } return v; }
  function xorE() { let v = andE(); while (peek() === "^") { eat(); v = v ^ andE(); } return v; }
  function orE()  { let v = xorE(); while (peek() === "|") { eat(); v = v | orE(); } return v; }
  function expr() { return orE(); }
  try { const v = expr(); if (p !== toks.length) return { ok: false }; return { ok: true, value: v }; }
  catch (e) { return { ok: false }; }
}

function checkStraightLine(q) {
  if (SKIP_KEYWORDS.test(q.code)) return null;   // loops/branches → not statically verifiable
  const lines = q.code.split("\n").map(l => l.trim()).filter(Boolean);
  const prints = lines.filter(l => /^PRINT\b/.test(l));
  if (prints.length !== 1) return null;
  const env = {};
  for (const l of lines) {
    if (/^PRINT\b/.test(l)) continue;
    const m = l.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (!m) return null;
    const r = evalArith(m[2], env);
    if (!r.ok) return null;
    env[m[1]] = r.value;
  }
  const r = evalArith(prints[0].replace(/^PRINT\s+/, ""), env);
  if (!r.ok) return null;
  const expected = parseFloat(q.options[q.answerIndex]);
  if (isNaN(expected)) return null;              // non-numeric key → out of scope
  return { computed: r.value, expected };
}

const norm = s => String(s).toLowerCase().replace(/[^a-z0-9.]+/g, " ").replace(/\s+/g, " ").trim();

function validateBankEnhanced() {
  const bank = Array.from(new Map(
    []
      .concat(typeof QUESTIONS !== "undefined" ? QUESTIONS : [])
      .concat(typeof QUESTIONS_BATCH2 !== "undefined" ? QUESTIONS_BATCH2 : [])
      .map(q => [q.id, q])
  ).values());
  const topics = (typeof TOPICS !== "undefined") ? TOPICS : [];
  const fail = [], warn = [], verified = [];
  const ids = new Set();
  const topicIdx = {};

  for (const q of bank) {
    const tag = q.id || "(no id)";
    if (!q.id) fail.push(tag + ": missing id");
    else if (ids.has(q.id)) fail.push(tag + ": duplicate id");
    ids.add(q.id);
    if (!Array.isArray(q.options) || q.options.length < 2) fail.push(tag + ": options invalid");
    else if (new Set(q.options.map(o => String(o).trim().toLowerCase())).size !== q.options.length) {
      fail.push(tag + ": duplicate options");
    }
    if (!["Beginner", "Intermediate", "Advanced"].includes(q.difficulty)) fail.push(tag + ": bad difficulty");
    if (!(q.answerIndex >= 0 && q.answerIndex < (q.options || []).length)) fail.push(tag + ": answerIndex out of range");
    if (topics.length && !topics.includes(q.topic)) warn.push(tag + ": topic not in TOPICS: " + q.topic);
    if (typeof q.explanation !== "string" || q.explanation.length < 10) warn.push(tag + ": explanation too short");

    if (ARTIFACTS.test(q.explanation || ""))
      warn.push(tag + ": explanation contains drafting-artifact text — rewrite it");

    // every key should be restated somewhere in the explanation
    if (q.options && q.explanation && !norm(q.explanation).includes(norm(q.options[q.answerIndex])))
      warn.push(tag + `: key "${q.options[q.answerIndex]}" is not restated in the explanation — end it with "→ <key>"`);

    // deterministic arithmetic cross-check (straight-line questions only)
    const chk = checkStraightLine(q);
    if (chk) {
      if (chk.computed !== chk.expected)
        fail.push(tag + `: ARITHMETIC MISMATCH — code evaluates to ${chk.computed}, key says "${q.options[q.answerIndex]}"`);
      else verified.push(tag);
    }

    if (q.topic) {
      const t = topicIdx[q.topic] || (topicIdx[q.topic] = [0, 0, 0, 0, 0]);
      t[q.answerIndex]++;
    }
  }

  for (const [t, c] of Object.entries(topicIdx)) {
    const total = c.reduce((a, b) => a + b, 0);
    const share = Math.max(...c) / total;
    if (share > 0.5)
      warn.push(`topic "${t}": key bias — ${Math.round(share * 100)}% of answers share one index`);
  }

  console.log(`Validated ${bank.length} questions. Auto-verified arithmetic: ${verified.length}`);
  if (verified.length) console.log("  verified:", verified.join(", "));
  if (warn.length) console.warn("WARNINGS:", warn);
  if (fail.length) console.error("FAILURES:", fail);
  else console.log("No failures. ✔");
  return { fail, warn, verified };
}