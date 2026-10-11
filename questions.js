/* ============================================================
   PseudoPrep question bank — ORIGINAL practice questions.
   Answer convention: answerIndex is the 0-based index into
   `options` that marks the single correct answer.
   Topics/difficulty feed filters on the dashboard and setup.
   ============================================================ */
"use strict";

const TOPICS = [
  "Variables & Assignment",
  "Arithmetic & Precedence",
  "Division, Modulo & Types",
  "Logical & Relational",
  "Conditionals",
  "Loops",
  "Nested Loops",
  "Break & Continue",
  "Counters & Accumulators",
  "Digit Manipulation",
  "Arrays",
  "Strings",
  "Functions & Parameters",
  "Recursion",
  "Bitwise Operators",
  "Searching & Sorting",
  "Stacks & Queues",
  "Mixed Placement-Level"
];

const QUESTIONS = [
  {
    id: "var-001", topic: "Variables & Assignment", difficulty: "Beginner",
    prompt: "What is the final value of a?",
    code: "a = 5\nb = a + 2\na = a + b\nPRINT a",
    options: ["7", "10", "12", "14"], answerIndex: 2,
    explanation: "a = 5, then b = 5 + 2 = 7. Finally a = 5 + 7 = 12.",
    tags: ["assignment", "dry-run"], estimatedSeconds: 30
  },
  {
    id: "var-002", topic: "Variables & Assignment", difficulty: "Beginner",
    prompt: "What is printed?",
    code: "x = 10\nx += 5\nx -= 3\nx *= 2\nPRINT x",
    options: ["22", "20", "24", "26"], answerIndex: 2,
    explanation: "10 + 5 = 15; 15 − 3 = 12; 12 × 2 = 24.",
    tags: ["compound-assignment"], estimatedSeconds: 30
  },
  {
    id: "arith-001", topic: "Arithmetic & Precedence", difficulty: "Beginner",
    prompt: "What is printed? (Integer division is used.)",
    code: "result = 4 + 3 * 2 - 10 / 5\nPRINT result",
    options: ["6", "8", "10", "2"], answerIndex: 1,
    explanation: "Precedence: 3 * 2 = 6 and 10 / 5 = 2 first, then 4 + 6 − 2 = 8.",
    tags: ["precedence"], estimatedSeconds: 30
  },
  {
    id: "arith-002", topic: "Arithmetic & Precedence", difficulty: "Intermediate",
    prompt: "What is the value of a?",
    code: "a = 17 MOD 5 + 2 * 3\nPRINT a",
    options: ["10", "12", "8", "7"], answerIndex: 2,
    explanation: "MOD and * bind tighter than +: 17 MOD 5 = 2, 2 * 3 = 6, so a = 2 + 6 = 8.",
    tags: ["precedence", "modulo"], estimatedSeconds: 40
  },
  {
    id: "mod-001", topic: "Division, Modulo & Types", difficulty: "Beginner",
    prompt: "What is printed?",
    code: "a = 7 / 2\nb = 7 MOD 2\nPRINT a + b",
    options: ["3.5", "4", "5", "3"], answerIndex: 1,
    explanation: "Integer division truncates: 7 / 2 = 3. 7 MOD 2 = 1. Output 3 + 1 = 4.",
    tags: ["integer-division", "modulo"], estimatedSeconds: 30
  },
  {
    id: "mod-002", topic: "Division, Modulo & Types", difficulty: "Intermediate",
    prompt: "What is printed?",
    code: "x = 9 / 2\ny = x * 2\nPRINT y",
    options: ["9", "4.5", "8", "4"], answerIndex: 2,
    explanation: "9 / 2 is integer division → x = 4 (not 4.5). Then y = 4 * 2 = 8.",
    tags: ["integer-division", "type-trap"], estimatedSeconds: 40
  },
  {
    id: "logic-001", topic: "Logical & Relational", difficulty: "Beginner",
    prompt: "What is printed?",
    code: "a = TRUE\nb = FALSE\nresult = a AND (NOT b)\nPRINT result",
    options: ["TRUE", "FALSE", "1", "ERROR"], answerIndex: 0,
    explanation: "NOT b = TRUE; TRUE AND TRUE = TRUE.",
    tags: ["boolean"], estimatedSeconds: 25
  },
  {
    id: "logic-002", topic: "Logical & Relational", difficulty: "Intermediate",
    prompt: "What is printed? (OR short-circuits.)",
    code: "x = 5\nFUNCTION bump()\n    x = x + 10\n    RETURN TRUE\nEND FUNCTION\nresult = (x > 100) OR bump()\nPRINT x",
    options: ["5", "15", "25", "ERROR"], answerIndex: 1,
    explanation: "(x > 100) is FALSE, so the OR must evaluate the right side: bump() runs, adding 10 → x = 15.",
    tags: ["short-circuit", "functions"], estimatedSeconds: 60
  },
  {
    id: "logic-003", topic: "Logical & Relational", difficulty: "Beginner",
    prompt: "What is printed?",
    code: "a = 5\nb = 10\nresult = (a < b) AND (b MOD 2 == 0)\nPRINT result",
    options: ["FALSE", "TRUE", "0", "1"], answerIndex: 1,
    explanation: "5 < 10 is TRUE and 10 MOD 2 = 0 is TRUE, so the AND is TRUE.",
    tags: ["boolean", "relational"], estimatedSeconds: 30
  },
  {
    id: "cond-001", topic: "Conditionals", difficulty: "Beginner",
    prompt: "What is printed?",
    code: "n = 12\nIF n MOD 2 == 0 THEN\n    PRINT \"EVEN\"\nELSE\n    PRINT \"ODD\"\nEND IF",
    options: ["ODD", "EVEN", "NOTHING", "ERROR"], answerIndex: 1,
    explanation: "12 MOD 2 = 0, so the IF branch runs and prints EVEN.",
    tags: ["if-else", "modulo"], estimatedSeconds: 25
  },
  {
    id: "cond-002", topic: "Conditionals", difficulty: "Beginner",
    prompt: "What is printed?",
    code: "marks = 72\nIF marks >= 90 THEN\n    PRINT \"A\"\nELSE IF marks >= 70 THEN\n    PRINT \"B\"\nELSE\n    PRINT \"C\"\nEND IF",
    options: ["A", "C", "B", "ERROR"], answerIndex: 2,
    explanation: "72 >= 90 is false, but 72 >= 70 is true, so B is printed and the chain stops.",
    tags: ["else-if"], estimatedSeconds: 30
  },
  {
    id: "cond-003", topic: "Conditionals", difficulty: "Intermediate",
    prompt: "What is printed? (Only the first matching branch runs.)",
    code: "x = 85\nIF x >= 50 THEN\n    PRINT \"PASS\"\nELSE IF x >= 80 THEN\n    PRINT \"DISTINCTION\"\nEND IF",
    options: ["PASS", "DISTINCTION", "PASS then DISTINCTION", "no output"], answerIndex: 0,
    explanation: "The first true branch wins. 85 >= 50 is true, so only PASS prints. The 80-check is never reached — branch order matters.",
    tags: ["branch-order"], estimatedSeconds: 45
  },
  {
    id: "loop-001", topic: "Loops", difficulty: "Beginner",
    prompt: "What is printed? (FOR bounds are inclusive.)",
    code: "s = 0\nFOR i = 1 TO 4\n    s = s + i\nEND FOR\nPRINT s",
    options: ["6", "4", "10", "24"], answerIndex: 2,
    explanation: "Sum of 1 + 2 + 3 + 4 = 10.",
    tags: ["for", "accumulator"], estimatedSeconds: 30
  },
  {
    id: "loop-002", topic: "Loops", difficulty: "Beginner",
    prompt: "What is the final value of x?",
    code: "x = 1\nWHILE x <= 8\n    x = x * 2\nEND WHILE\nPRINT x",
    options: ["8", "32", "12", "16"], answerIndex: 3,
    explanation: "x takes 1 → 2 → 4 → 8 → 16. When x = 16 the condition 16 <= 8 fails, so 16 is printed.",
    tags: ["while", "dry-run"], estimatedSeconds: 35
  },
  {
    id: "loop-003", topic: "Loops", difficulty: "Intermediate",
    prompt: "What is printed? (DO…WHILE checks the condition after each pass.)",
    code: "n = 3\nsum = 0\nDO\n    sum = sum + n\n    n = n + 3\nWHILE n <= 10\nPRINT sum",
    options: ["12", "9", "18", "27"], answerIndex: 2,
    explanation: "Passes: n=3 (sum 3, n→6), n=6 (sum 9, n→9), n=9 (sum 18, n→12). 12 > 10 stops. Output 18.",
    tags: ["do-while", "dry-run"], estimatedSeconds: 55
  },
  {
    id: "nest-001", topic: "Nested Loops", difficulty: "Intermediate",
    prompt: "How many times is the inner body executed?",
    code: "count = 0\nFOR i = 1 TO 3\n    FOR j = i TO 3\n        count = count + 1\n    END FOR\nEND FOR\nPRINT count",
    options: ["9", "6", "5", "3"], answerIndex: 1,
    explanation: "i=1 runs j=1..3 (3 times), i=2 runs 2 times, i=3 runs 1 time → 6.",
    tags: ["nested", "counting"], estimatedSeconds: 50
  },
  {
    id: "nest-002", topic: "Nested Loops", difficulty: "Advanced",
    prompt: "What is printed?",
    code: "total = 0\nFOR i = 1 TO 3\n    FOR j = 1 TO i\n        total = total + i * j\n    END FOR\nEND FOR\nPRINT total",
    options: ["18", "21", "25", "36"], answerIndex: 2,
    explanation: "i=1: 1×1 = 1. i=2: 2×1 + 2×2 = 6. i=3: 3×1 + 3×2 + 3×3 = 18. Total 1 + 6 + 18 = 25.",
    tags: ["nested", "accumulation"], estimatedSeconds: 70
  },
  {
    id: "brk-001", topic: "Break & Continue", difficulty: "Intermediate",
    prompt: "What is printed?",
    code: "s = 0\nFOR i = 1 TO 10\n    IF i MOD 2 == 0 THEN CONTINUE\n    IF i > 6 THEN BREAK\n    s = s + i\nEND FOR\nPRINT s",
    options: ["9", "16", "25", "6"], answerIndex: 0,
    explanation: "Even i are skipped by CONTINUE. Odd i: 1, 3, 5 are added (s = 9). When i = 7, i > 6 triggers BREAK before adding.",
    tags: ["break", "continue"], estimatedSeconds: 60
  },
  {
    id: "brk-002", topic: "Break & Continue", difficulty: "Intermediate",
    prompt: "What is printed?",
    code: "i = 0\nWHILE i < 5\n    i = i + 1\n    IF i == 3 THEN BREAK\nEND WHILE\nPRINT i",
    options: ["5", "4", "2", "3"], answerIndex: 3,
    explanation: "i becomes 1, 2, 3. At i = 3 the BREAK exits immediately, so i = 3 is printed.",
    tags: ["break", "while"], estimatedSeconds: 40
  },
  {
    id: "acc-001", topic: "Counters & Accumulators", difficulty: "Beginner",
    prompt: "What is printed?",
    code: "count = 0\nsum = 0\nFOR i = 2 TO 6\n    IF i MOD 2 == 0 THEN\n        count = count + 1\n        sum = sum + i\n    END IF\nEND FOR\nPRINT count + sum",
    options: ["12", "3", "9", "15"], answerIndex: 3,
    explanation: "Even i in 2..6: 2, 4, 6 → count = 3, sum = 12. Output 3 + 12 = 15.",
    tags: ["counter", "accumulator"], estimatedSeconds: 45
  },
  {
    id: "dig-001", topic: "Digit Manipulation", difficulty: "Beginner",
    prompt: "What is printed?",
    code: "n = 274\nd = 0\nWHILE n > 0\n    d = d + n MOD 10\n    n = n / 10\nEND WHILE\nPRINT d",
    options: ["13", "4", "31", "274"], answerIndex: 0,
    explanation: "Digits 4 + 7 + 2 = 13 (integer division strips the last digit each pass).",
    tags: ["digits", "while"], estimatedSeconds: 45
  },
  {
    id: "dig-002", topic: "Digit Manipulation", difficulty: "Intermediate",
    prompt: "What is printed?",
    code: "n = 123\nr = 0\nWHILE n > 0\n    r = r * 10 + n MOD 10\n    n = n / 10\nEND WHILE\nPRINT r",
    options: ["123", "321", "32", "3210"], answerIndex: 1,
    explanation: "r = 3 → 32 → 321. This is the classic digit-reversal pattern.",
    tags: ["digits", "reverse"], estimatedSeconds: 55
  },
  {
    id: "dig-003", topic: "Digit Manipulation", difficulty: "Advanced",
    prompt: "How many times is the digit 5 counted?",
    code: "n = 505\nfives = 0\nWHILE n > 0\n    IF n MOD 10 == 5 THEN fives = fives + 1\n    n = n / 10\nEND WHILE\nPRINT fives",
    options: ["0", "1", "3", "2"], answerIndex: 3,
    explanation: "505 MOD 10 = 5 (count 1), then n = 50; 50 MOD 10 = 0 (no); then n = 5: 5 MOD 10 = 5 (count 2). Output 2.",
    tags: ["digits", "counting"], estimatedSeconds: 60
  },
  {
    id: "arr-001", topic: "Arrays", difficulty: "Beginner",
    prompt: "What is printed? (Arrays are 0-indexed.)",
    code: "A = [3, 7, 1, 9]\nm = A[0]\nFOR i = 1 TO 3\n    IF A[i] > m THEN m = A[i]\nEND FOR\nPRINT m",
    options: ["3", "9", "7", "1"], answerIndex: 1,
    explanation: "Classic max-finding loop: m ends at the largest element, 9.",
    tags: ["max", "arrays"], estimatedSeconds: 35
  },
  {
    id: "arr-002", topic: "Arrays", difficulty: "Intermediate",
    prompt: "What is printed?",
    code: "A = [4, 8, 2, 6]\nt = 0\nFOR i = 0 TO 3\n    t = t + A[i]\nEND FOR\navg = t / 4\nPRINT avg",
    options: ["20", "4.5", "6", "5"], answerIndex: 3,
    explanation: "t = 4 + 8 + 2 + 6 = 20. Integer division 20 / 4 = 5.",
    tags: ["average", "integer-division"], estimatedSeconds: 45
  },
  {
    id: "arr-003", topic: "Arrays", difficulty: "Intermediate",
    prompt: "What is printed?",
    code: "A = [10, 20, 30, 40, 50]\ni = 1\nj = 3\nA[i] = A[j] - A[i]\nPRINT A[i] + A[4]",
    options: ["70", "60", "50", "80"], answerIndex: 0,
    explanation: "A[1] = 40 − 20 = 20. Then A[1] + A[4] = 20 + 50 = 70.",
    tags: ["indexing"], estimatedSeconds: 45
  },
  {
    id: "str-001", topic: "Strings", difficulty: "Beginner",
    prompt: "How many times is the counter incremented?",
    code: "s = \"CODE\"\ncount = 0\nFOR i = 0 TO length(s)-1\n    IF s[i] == \"E\" OR s[i] == \"O\" THEN count = count + 1\nEND FOR\nPRINT count",
    options: ["2", "1", "0", "4"], answerIndex: 0,
    explanation: "s[1] = 'O' and s[3] = 'E' match, so count = 2.",
    tags: ["strings", "counting"], estimatedSeconds: 35
  },
  {
    id: "str-002", topic: "Strings", difficulty: "Intermediate",
    prompt: "What is printed?",
    code: "s = \"HELLO\"\nt = \"\"\nFOR i = length(s)-1 TO 0 STEP -1\n    t = t + s[i]\nEND FOR\nPRINT t",
    options: ["HELLO", "OLLEH", "HOLLE", "ELLOH"], answerIndex: 1,
    explanation: "The loop runs backwards appending characters: O, L, L, E, H → \"OLLEH\".",
    tags: ["strings", "reverse"], estimatedSeconds: 45
  },
  {
    id: "str-003", topic: "Strings", difficulty: "Advanced",
    prompt: "What is printed?",
    code: "s = \"PROGRAM\"\nseen = \"\"\nresult = \"\"\nFOR i = 0 TO length(s)-1\n    c = s[i]\n    dup = FALSE\n    FOR j = 0 TO length(seen)-1\n        IF seen[j] == c THEN dup = TRUE\n    END FOR\n    IF NOT dup THEN result = result + c\n    seen = seen + c\nEND FOR\nPRINT result",
    options: ["PROGRAM", "PROGAM", "PROGMA", "PRGRAM"], answerIndex: 1,
    explanation: "Each character is appended only on first occurrence: P, R, O, G; second R is skipped; then A, M → \"PROGAM\".",
    tags: ["strings", "dedupe"], estimatedSeconds: 90
  },
  {
    id: "fun-001", topic: "Functions & Parameters", difficulty: "Beginner",
    prompt: "What is printed?",
    code: "FUNCTION double(n)\n    RETURN n * 2\nEND FUNCTION\nx = double(3) + double(4)\nPRINT x",
    options: ["12", "7", "24", "14"], answerIndex: 3,
    explanation: "double(3) = 6 and double(4) = 8; 6 + 8 = 14.",
    tags: ["functions"], estimatedSeconds: 30
  },
  {
    id: "fun-002", topic: "Functions & Parameters", difficulty: "Intermediate",
    prompt: "What is printed? (Arguments are passed by value.)",
    code: "FUNCTION change(n)\n    n = n + 10\nEND FUNCTION\na = 5\nchange(a)\nPRINT a",
    options: ["15", "10", "5", "ERROR"], answerIndex: 2,
    explanation: "Parameters are copies. change modifies its local copy n, not a. a stays 5.",
    tags: ["pass-by-value"], estimatedSeconds: 45
  },
  {
    id: "fun-003", topic: "Functions & Parameters", difficulty: "Intermediate",
    prompt: "What is printed?",
    code: "FUNCTION f(x)\n    IF x MOD 2 == 0 THEN\n        RETURN x / 2\n    ELSE\n        RETURN x * 3 + 1\n    END IF\nEND FUNCTION\nPRINT f(f(6))",
    options: ["3", "6", "10", "9"], answerIndex: 2,
    explanation: "f(6) = 6 / 2 = 3 (even branch). Then f(3) = 3 * 3 + 1 = 10 (odd branch).",
    tags: ["functions", "composition"], estimatedSeconds: 50
  },
  {
    id: "rec-001", topic: "Recursion", difficulty: "Beginner",
    prompt: "What is printed?",
    code: "FUNCTION fact(n)\n    IF n <= 1 THEN RETURN 1\n    RETURN n * fact(n - 1)\nEND FUNCTION\nPRINT fact(4)",
    options: ["4", "10", "16", "24"], answerIndex: 3,
    explanation: "fact(4) = 4 × fact(3) = 4 × 3 × fact(2) = 4 × 3 × 2 × fact(1) = 24.",
    tags: ["recursion", "factorial"], estimatedSeconds: 45
  },
  {
    id: "rec-002", topic: "Recursion", difficulty: "Intermediate",
    prompt: "What is printed?",
    code: "FUNCTION g(n)\n    IF n <= 0 THEN RETURN 0\n    RETURN n + g(n - 2)\nEND FUNCTION\nPRINT g(7)",
    options: ["12", "7", "16", "10"], answerIndex: 2,
    explanation: "g(7) = 7 + 5 + 3 + 1 + g(−1). Base case returns 0, so total = 16.",
    tags: ["recursion"], estimatedSeconds: 55
  },
  {
    id: "rec-003", topic: "Recursion", difficulty: "Advanced",
    prompt: "What is printed?",
    code: "FUNCTION h(a, b)\n    IF b == 0 THEN RETURN a\n    RETURN h(b, a MOD b)\nEND FUNCTION\nPRINT h(12, 18)",
    options: ["6", "12", "18", "2"], answerIndex: 0,
    explanation: "h(12,18) → h(18, 12 MOD 18 = 12) → h(12, 18 MOD 12 = 6) → h(6, 12 MOD 6 = 0) → base case returns 6. This computes GCD.",
    tags: ["recursion", "gcd"], estimatedSeconds: 80
  },
  {
    id: "bit-001", topic: "Bitwise Operators", difficulty: "Intermediate",
    prompt: "What is printed? (& = bitwise AND, | = bitwise OR.)",
    code: "x = 12\ny = x & 10\nz = x | 3\nPRINT y + z",
    options: ["8", "15", "25", "23"], answerIndex: 3,
    explanation: "12 = 1100, 10 = 1010 → AND = 1000 = 8. 12 | 3 = 1100 | 0011 = 1111 = 15. Output 8 + 15 = 23.",
    tags: ["bitwise"], estimatedSeconds: 60
  },
  {
    id: "bit-002", topic: "Bitwise Operators", difficulty: "Intermediate",
    prompt: "What is printed? (>> shifts right, << shifts left.)",
    code: "n = 8\nr = n >> 2\ns = 5 << 2\nPRINT r + s",
    options: ["22", "20", "10", "12"], answerIndex: 0,
    explanation: "8 >> 2 = 2 (divide by 4). 5 << 2 = 20 (multiply by 4). Output 22.",
    tags: ["shifts"], estimatedSeconds: 50
  },
  {
    id: "bit-003", topic: "Bitwise Operators", difficulty: "Advanced",
    prompt: "What is printed? (This is the XOR swap idiom.)",
    code: "a = 10\nb = 12\na = a ^ b\nb = a ^ b\na = a ^ b\nPRINT a + b",
    options: ["22", "20", "24", "10"], answerIndex: 0,
    explanation: "Three XOR steps swap the values without a temp: a = 12, b = 10. Output 12 + 10 = 22.",
    tags: ["xor", "swap"], estimatedSeconds: 70
  },
  {
    id: "srch-001", topic: "Searching & Sorting", difficulty: "Intermediate",
    prompt: "What index is printed? (0-based; integer division for mid.)",
    code: "A = [1, 3, 5, 7, 9, 11]\nlow = 0\nhigh = 5\ntarget = 7\nWHILE low <= high\n    mid = (low + high) / 2\n    IF A[mid] == target THEN\n        PRINT mid\n        BREAK\n    ELSE IF A[mid] < target THEN\n        low = mid + 1\n    ELSE\n        high = mid - 1\n    END IF\nEND WHILE",
    options: ["4", "3", "2", "-1"], answerIndex: 1,
    explanation: "mid=2: A[2]=5 < 7 → low=3. mid=(3+5)/2=4: A[4]=9 > 7 → high=3. mid=3: A[3]=7 → prints 3.",
    tags: ["binary-search"], estimatedSeconds: 80
  },
  {
    id: "srch-002", topic: "Searching & Sorting", difficulty: "Advanced",
    prompt: "What is printed? (pos keeps updating, no BREAK.)",
    code: "A = [4, 2, 7, 2, 9, 2]\ntarget = 2\npos = -1\nFOR i = 0 TO 5\n    IF A[i] == target THEN pos = i\nEND FOR\nPRINT pos",
    options: ["1", "3", "5", "-1"], answerIndex: 2,
    explanation: "pos is overwritten at every match (indices 1, 3, 5). Without BREAK, the final value is the LAST occurrence: 5.",
    tags: ["linear-search", "no-break-trap"], estimatedSeconds: 55
  },
  {
    id: "srt-001", topic: "Searching & Sorting", difficulty: "Intermediate",
    prompt: "What is printed after ONE bubble pass?",
    code: "A = [5, 1, 4, 2]\nFOR i = 0 TO 2\n    IF A[i] > A[i+1] THEN\n        temp = A[i]\n        A[i] = A[i+1]\n        A[i+1] = temp\n    END IF\nEND FOR\nPRINT A",
    options: ["1 2 4 5", "1 4 2 5", "5 1 4 2", "1 4 5 2"], answerIndex: 1,
    explanation: "5>1 swap → [1,5,4,2]; 5>4 swap → [1,4,5,2]; 5>2 swap → [1,4,2,5]. One pass only 'bubbles' the 5 to the end.",
    tags: ["bubble-sort", "single-pass"], estimatedSeconds: 70
  },
  {
    id: "srt-002", topic: "Searching & Sorting", difficulty: "Beginner",
    prompt: "What is printed after the full nested loops run?",
    code: "A = [3, 1, 2]\nFOR i = 0 TO 1\n    FOR j = 0 TO 1\n        IF A[j] > A[j+1] THEN\n            temp = A[j]\n            A[j] = A[j+1]\n            A[j+1] = temp\n        END IF\n    END FOR\nEND FOR\nPRINT A",
    options: ["3 1 2", "1 3 2", "1 2 3", "2 1 3"], answerIndex: 2,
    explanation: "Pass 1: 3>1 swap → [1,3,2]; 3>2 swap → [1,2,3]. Pass 2: no swaps. Output 1 2 3.",
    tags: ["bubble-sort"], estimatedSeconds: 60
  },
  {
    id: "sq-001", topic: "Stacks & Queues", difficulty: "Beginner",
    prompt: "What is printed? (PUSH/POP act on the top.)",
    code: "S = empty\nPUSH(S, 3)\nPUSH(S, 7)\nPOP(S)\nPUSH(S, 1)\nPUSH(S, 9)\nPRINT TOP(S) + SIZE(S)",
    options: ["12", "9", "10", "3"], answerIndex: 0,
    explanation: "Stack evolves: [3] → [3,7] → pop → [3] → [3,1] → [3,1,9]. TOP = 9, SIZE = 3, output 12.",
    tags: ["stack"], estimatedSeconds: 45
  },
  {
    id: "sq-002", topic: "Stacks & Queues", difficulty: "Intermediate",
    prompt: "What is printed? (ENQUEUE at rear, DEQUEUE from front.)",
    code: "Q = empty\nENQUEUE(Q, 2)\nENQUEUE(Q, 4)\nDEQUEUE(Q)\nENQUEUE(Q, 6)\nPRINT FRONT(Q) + SIZE(Q)",
    options: ["10", "6", "12", "4"], answerIndex: 1,
    explanation: "Q: [2] → [2,4] → dequeue removes 2 → [4] → [4,6]. FRONT = 4, SIZE = 2, output 6.",
    tags: ["queue"], estimatedSeconds: 45
  },
  {
    id: "mix-001", topic: "Mixed Placement-Level", difficulty: "Advanced",
    prompt: "What is printed? (This builds a Fibonacci-style recurrence.)",
    code: "ways = 1\nprev = 1\nFOR i = 2 TO 5\n    temp = ways + prev\n    prev = ways\n    ways = temp\nEND FOR\nPRINT ways",
    options: ["5", "13", "8", "6"], answerIndex: 2,
    explanation: "Iterations produce ways = 2, 3, 5, 8 — the Fibonacci recurrence (climbing-stairs count for 5 steps).",
    tags: ["fibonacci", "dp-style"], estimatedSeconds: 80
  },
  {
    id: "mix-002", topic: "Mixed Placement-Level", difficulty: "Intermediate",
    prompt: "What is printed? (Loop stops at length(s)-2.)",
    code: "count = 0\ns = \"AABBA\"\nFOR i = 0 TO length(s)-2\n    IF s[i] == s[i+1] THEN count = count + 1\nEND FOR\nPRINT count",
    options: ["3", "2", "1", "4"], answerIndex: 1,
    explanation: "Adjacent pairs: AA ✓, AB ✗, BB ✓, BA ✗ → count = 2. Note the loop bound excludes the final lone character.",
    tags: ["strings", "adjacent-pairs"], estimatedSeconds: 55
  },
  {
    id: "mix-003", topic: "Mixed Placement-Level", difficulty: "Intermediate",
    prompt: "What is printed? (Only i == j contributes.)",
    code: "grid = [[1, 2], [3, 4]]\nt = 0\nFOR i = 0 TO 1\n    FOR j = 0 TO 1\n        IF i == j THEN t = t + grid[i][j]\n    END FOR\nEND FOR\nPRINT t",
    options: ["5", "10", "3", "7"], answerIndex: 0,
    explanation: "The condition selects the main diagonal: grid[0][0] + grid[1][1] = 1 + 4 = 5.",
    tags: ["2d-array", "diagonal"], estimatedSeconds: 50
  },
  {
    id: "mix-004", topic: "Mixed Placement-Level", difficulty: "Advanced",
    prompt: "What is printed? (Integer division j = j / 2 halves j.)",
    code: "result = 0\nFOR i = 1 TO 5\n    j = i\n    WHILE j > 0\n        IF j MOD 2 == 1 THEN\n            result = result + 1\n        END IF\n        j = j / 2\n    END WHILE\nEND FOR\nPRINT result",
    options: ["5", "7", "6", "8"], answerIndex: 1,
    explanation: "The inner loop counts set bits: 1→1, 2→1, 3→2, 4→1, 5→2. Total 1+1+2+1+2 = 7.",
    tags: ["bit-count", "nested"], estimatedSeconds: 90
  },
  {
    id: "mix-005", topic: "Mixed Placement-Level", difficulty: "Intermediate",
    prompt: "What is printed? (FOR i = 1 TO 10.)",
    code: "s = 0\nFOR i = 1 TO 10\n    IF i MOD 3 == 0 THEN\n        s = s - i\n    ELSE IF i MOD 3 == 1 THEN\n        s = s + i\n    END IF\nEND FOR\nPRINT s",
    options: ["10", "-4", "4", "6"], answerIndex: 2,
    explanation: "Add when i ≡ 1 (mod 3): +1 +4 +7 +10 = 22. Subtract when i ≡ 0: −3 −6 −9 = −18. 22 − 18 = 4. (i ≡ 2 values do nothing.)",
    tags: ["modulo", "accumulator"], estimatedSeconds: 70
  },
  {
    id: "mix-006", topic: "Mixed Placement-Level", difficulty: "Advanced",
    prompt: "What is printed? (j runs from i TO 2.)",
    code: "A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nt = 0\nFOR i = 0 TO 2\n    FOR j = i TO 2\n        t = t + A[i][j]\n    END FOR\nEND FOR\nPRINT t",
    options: ["26", "45", "15", "30"], answerIndex: 0,
    explanation: "Row 0: 1+2+3 = 6. Row 1: j=1..2 → 5+6 = 11. Row 2: 9. Total 26 — the strict upper-triangle-plus-diagonal sum.",
    tags: ["2d-array", "triangle"], estimatedSeconds: 75
  }
];

/* Validation: run once at load to catch schema errors early. */
(function validateBank() {
  const ids = new Set();
  const requiredDifficulties = new Set(["Beginner", "Intermediate", "Advanced"]);
  const topicCounts = new Map();
  const difficultyCounts = new Map();
  if (QUESTIONS.length !== 50) throw new Error("Question bank must contain exactly 50 questions.");
  for (const q of QUESTIONS) {
    if (!q.id || ids.has(q.id)) throw new Error("Duplicate or missing question id: " + q.id);
    ids.add(q.id);
    if (!Array.isArray(q.options) || q.options.length < 2) throw new Error("Bad options: " + q.id);
    if (typeof q.answerIndex !== "number" || q.answerIndex < 0 || q.answerIndex >= q.options.length) {
      throw new Error("answerIndex out of range: " + q.id);
    }
    if (!TOPICS.includes(q.topic)) throw new Error("Unknown topic: " + q.id);
    if (!requiredDifficulties.has(q.difficulty)) throw new Error("Unknown difficulty: " + q.id);
    if (q.options.some(option => typeof option !== "string" || option.trim() === "")) {
      throw new Error("Empty option: " + q.id);
    }
    if (new Set(q.options).size !== q.options.length) throw new Error("Duplicate option: " + q.id);
    if (typeof q.prompt !== "string" || q.prompt.trim() === "") throw new Error("Missing prompt: " + q.id);
    if (typeof q.code !== "string" || q.code.trim() === "") throw new Error("Missing code: " + q.id);
    if (typeof q.explanation !== "string" || q.explanation.trim().length < 10) {
      throw new Error("Missing explanation: " + q.id);
    }
    topicCounts.set(q.topic, (topicCounts.get(q.topic) || 0) + 1);
    difficultyCounts.set(q.difficulty, (difficultyCounts.get(q.difficulty) || 0) + 1);
  }
  if (topicCounts.size !== TOPICS.length) throw new Error("Question bank must cover all 18 topics.");
  for (const difficulty of requiredDifficulties) {
    if (!difficultyCounts.has(difficulty)) throw new Error("Question bank is missing " + difficulty + " questions.");
  }
})();