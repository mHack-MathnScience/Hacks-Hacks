import { pick, randInt, shuffle } from "@/lib/math/rng";
import { input, maybeInput, mc, nearbyInts, pickName } from "./build";
import type { Question } from "./types";

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function gen54A(): Question {
  const n = randInt(2, 97);
  const prime = isPrime(n);
  const factors: number[] = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) factors.push(i);
  const mode = pick(["label", "which"] as const);
  if (mode === "label") {
    return mc(
      "5.4A",
      `Is ${n} prime or composite?`,
      prime ? "prime" : "composite",
      prime ? ["composite", "neither", "even"] : ["prime", "neither", "odd"],
      prime
        ? `${n} has exactly two factors, 1 and ${n}, so it is prime.`
        : `${n} has more than two factors (${factors.slice(0, 6).join(", ")}${factors.length > 6 ? ", …" : ""}), so it is composite.`,
    );
  }
  const pool = shuffle(Array.from({ length: 40 }, (_, i) => i + 11));
  const primes = pool.filter(isPrime).slice(0, 4);
  const comps = pool.filter((x) => !isPrime(x) && x !== 1).slice(0, 4);
  if (pick([true, false])) {
    const correct = String(primes[0]);
    return mc(
      "5.4A",
      "Which number is prime?",
      correct,
      comps.map(String),
      `${correct} has only two factors: 1 and ${correct}.`,
    );
  }
  const correct = String(comps[0]);
  return mc(
    "5.4A",
    "Which number is composite?",
    correct,
    primes.map(String),
    `${correct} has more than two factors, so it is composite.`,
  );
}

function gen54B(): Question {
  const name = pickName();
  const kind = pick(["boxes", "rows", "tickets"] as const);
  let a = randInt(3, 9);
  let b = randInt(12, 36);
  let c = randInt(8, 40);
  if (kind === "boxes") {
    const ans = a * b - c;
    if (ans <= 0) c = randInt(4, 12);
    const value = a * b - c;
    const letter = pick(["n", "p", "s"]);
    const eq = `${a} × ${b} − ${c} = ${letter}`;
    const mode = pick(["value", "equation"] as const);
    const stem = `${name} packed ${a} boxes with ${b} bottles in each box, then gave away ${c} bottles. How many bottles are left?`;
    if (mode === "equation") {
      return mc(
        "5.4B",
        `${stem} Which equation can be used to find the number of bottles left, ${letter}?`,
        eq,
        [`${a} + ${b} − ${c} = ${letter}`, `${a} × ${b} + ${c} = ${letter}`, `${letter} = ${a} × ${c} − ${b}`, `${a} × (${b} − ${c}) = ${letter}`],
        `First multiply the boxes, then subtract what was given away: ${eq}.`,
      );
    }
    return mc("5.4B", stem, String(value), nearbyInts(value).map(String), `${eq}, so ${letter} = ${value}.`);
  }
  if (kind === "rows") {
    const rows = randInt(6, 14);
    const seats = randInt(8, 18);
    const empty = randInt(5, 20);
    const value = rows * seats - empty;
    const letter = "s";
    const stem = `A theater has ${rows} rows with ${seats} seats in each row. ${empty} seats are empty. How many seats are filled?`;
    return mc(
      "5.4B",
      `${stem} Which equation represents the problem?`,
      `${rows} × ${seats} − ${empty} = ${letter}`,
      [
        `${rows} + ${seats} − ${empty} = ${letter}`,
        `${rows} × ${seats} + ${empty} = ${letter}`,
        `${letter} = ${rows} × ${empty} − ${seats}`,
      ],
      `Filled seats = all seats minus empty seats: ${rows} × ${seats} − ${empty} = ${value}.`,
    );
  }
  const packs = randInt(4, 9);
  const each = randInt(5, 12);
  const extra = randInt(2, 8);
  const value = packs * each + extra;
  return mc(
    "5.4B",
    `${name} bought ${packs} packs of ${each} tickets and then ${extra} more single tickets. How many tickets does ${name} have?`,
    String(value),
    nearbyInts(value, [packs * each, packs + each + extra]).map(String),
    `t = ${packs} × ${each} + ${extra} = ${value}.`,
  );
}

function gen54C(): Question {
  const multiplicative = pick([true, false]);
  const a = multiplicative ? randInt(2, 9) : randInt(2, 12);
  const x = randInt(3, 9);
  const y = multiplicative ? a * x : x + a;
  const rule = multiplicative ? `y = ${a}x` : `y = x + ${a}`;
  const mode = pick(["find-y", "pair", "table"] as const);
  if (mode === "find-y") {
    return mc(
      "5.4C",
      `A pattern follows the rule ${rule}. What is y when x = ${x}?`,
      String(y),
      nearbyInts(y, [a + x, a * x + (multiplicative ? a : 0), x]).map(String),
      `Substitute ${x} for x: ${multiplicative ? `${a} × ${x}` : `${x} + ${a}`} = ${y}.`,
    );
  }
  if (mode === "pair") {
    const correct = `(${x}, ${y})`;
    const wrong = [`(${y}, ${x})`, `(${x}, ${multiplicative ? x + a : a * x})`, `(${x + 1}, ${y})`, `(0, ${a})`];
    return mc(
      "5.4C",
      `Which ordered pair is on the graph of the rule ${rule}?`,
      correct,
      wrong,
      `When x = ${x}, y = ${y}, so the point is ${correct}. In the first quadrant, x is first.`,
    );
  }
  const xs = [1, 2, 3, 4];
  const ys = xs.map((n) => (multiplicative ? a * n : n + a));
  const missingX = pick([2, 3, 4]);
  const missingY = multiplicative ? a * missingX : missingX + a;
  const rows = xs.map((n) => [String(n), n === missingX ? "?" : String(multiplicative ? a * n : n + a)]);
  return mc(
    "5.4C",
    `The table follows the rule ${rule}. What number completes the table for x = ${missingX}?`,
    String(missingY),
    nearbyInts(missingY).map(String),
    `${rule} gives y = ${missingY} when x = ${missingX}.`,
    { visual: { kind: "table", caption: `Rule: ${rule}`, headers: ["x", "y"], rows } },
  );
}

function gen54D(): Question {
  const multiplicative = pick([true, false]);
  const a = multiplicative ? randInt(2, 8) : randInt(3, 15);
  const xs = [1, 2, 3, 4];
  const ys = xs.map((n) => (multiplicative ? a * n : n + a));
  const label = multiplicative ? "multiplicative" : "additive";
  const other = multiplicative ? "additive" : "multiplicative";
  const rows = xs.map((n, i) => [String(n), String(ys[i])]);
  return mc(
    "5.4D",
    "The table shows a numerical pattern. Is the pattern additive or multiplicative?",
    label,
    [other, "neither", "both"],
    multiplicative
      ? `Each y-value is x multiplied by ${a} (y = ${a}x), so the pattern is multiplicative.`
      : `Each y-value is x plus ${a} (y = x + ${a}), so the pattern is additive.`,
    { visual: { kind: "table", headers: ["x", "y"], rows } },
  );
}

function gen54E(): Question {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(2, 9);
  const kind = pick(["paren", "bracket", "meaning"] as const);
  if (kind === "meaning") {
    return mc(
      "5.4E",
      `In the expression ${a} × (${b} + ${c}), what do the parentheses tell you to do first?`,
      `Add ${b} and ${c}`,
      [`Multiply ${a} and ${b}`, `Add ${a} and ${b}`, `Multiply ${b} and ${c}`],
      `Parentheses are a grouping symbol. Do the work inside them first: ${b} + ${c} = ${b + c}, then multiply by ${a}.`,
    );
  }
  if (kind === "bracket") {
    return mc(
      "5.4E",
      `What is the first step in simplifying ${a} + [${b} × (${c} + ${randInt(2, 6)})]?`,
      "Add inside the parentheses",
      ["Add inside the brackets", "Multiply before the brackets", "Add left to right"],
      `Innermost grouping first: parentheses, then brackets. Parentheses nest inside the brackets here.`,
    );
  }
  const expr = `${a} + ${b} × ${c}`;
  const grouped = `(${a} + ${b}) × ${c}`;
  return mc(
    "5.4E",
    `Which expression means “add ${a} and ${b}, then multiply by ${c}”?`,
    grouped,
    [expr, `${a} + (${b} × ${c})`, `${a} × ${b} + ${c}`],
    `Parentheses group the addition so it happens first: ${grouped} = ${a + b} × ${c} = ${(a + b) * c}.`,
  );
}

function gen54F(): Question {
  type Template = { expr: string; value: number; traps: number[] };
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(2, 8);
  const d = randInt(2, 6);
  const templates: Template[] = [
    {
      expr: `${a} + ${b} × ${c}`,
      value: a + b * c,
      traps: [(a + b) * c, a + b + c, a * b * c],
    },
    {
      expr: `(${a} + ${b}) × ${c}`,
      value: (a + b) * c,
      traps: [a + b * c, a + b + c, a * b * c],
    },
    {
      expr: `${a} × (${b} + ${c})`,
      value: a * (b + c),
      traps: [a * b + c, a + b + c, a * b * c],
    },
    {
      expr: `${a} + [${b} × (${c} + ${d})]`,
      value: a + b * (c + d),
      traps: [(a + b) * (c + d), a + b * c + d, a + b + c + d],
    },
    {
      expr: `(${a} + ${b} × ${c}) × ${d}`,
      value: (a + b * c) * d,
      traps: [(a + b) * c * d, a + b * c * d, a + b + c + d],
    },
  ];
  // division template with even split
  const div = pick([2, 4, 5]);
  const inner = div * randInt(3, 9);
  templates.push({
    expr: `${inner} ÷ ${div} + ${a} × ${b}`,
    value: inner / div + a * b,
    traps: [inner / (div + a) * b, (inner / div + a) * b, inner / div + a + b],
  });
  const t = pick(templates);
  const explanation = `Follow order of operations: grouping symbols, then multiply and divide left to right, then add and subtract. ${t.expr} = ${t.value}.`;
  if (maybeInput()) {
    return input("5.4F", "Simplify the expression.", String(t.value), explanation, {
      expression: t.expr,
      hint: "Whole number",
    });
  }
  return mc("5.4F", "Simplify the expression.", String(t.value), t.traps.map(String), explanation, {
    expression: t.expr,
  });
}

function gen54G(): Question {
  const l = randInt(2, 8);
  const w = randInt(2, 8);
  const h = randInt(2, 8);
  const cube = pick([true, false]);
  if (cube) {
    const s = randInt(2, 8);
    return mc(
      "5.4G",
      `A cube has side length ${s} units. Which formula gives its volume?`,
      `V = ${s} × ${s} × ${s}`,
      [`V = ${s} + ${s} + ${s}`, `V = 6 × ${s}`, `V = ${s} × ${s}`, `V = 2 × ${s} × ${s}`],
      `A cube is a rectangular prism with equal edges, so V = s × s × s = ${s ** 3} cubic units.`,
      { visual: { kind: "prism", l: s, w: s, h: s } },
    );
  }
  const B = l * w;
  const mode = pick(["formula", "B"] as const);
  if (mode === "B") {
    return mc(
      "5.4G",
      `A rectangular prism has a base ${l} units by ${w} units and height ${h} units. What is B, the area of the base, in V = B × h?`,
      String(B),
      [String(l * w * h), String(l + w), String(h), String(2 * (l + w))],
      `B is the area of the base: ${l} × ${w} = ${B}. Then V = ${B} × ${h} = ${B * h}.`,
      { visual: { kind: "prism", l, w, h } },
    );
  }
  return mc(
    "5.4G",
    `Which formula can be used to find the volume of a ${l} by ${w} by ${h} rectangular prism?`,
    `V = ${l} × ${w} × ${h}`,
    [`V = ${l} + ${w} + ${h}`, `V = 2(${l} × ${w} + ${w} × ${h} + ${l} × ${h})`, `V = ${l} × ${w}`],
    `Volume of a rectangular prism is V = l × w × h, or V = B × h.`,
    { visual: { kind: "prism", l, w, h } },
  );
}

function gen54H(): Question {
  const kind = pick(["peri", "area", "vol", "composite"] as const);
  const name = pickName();
  if (kind === "peri") {
    const l = randInt(8, 24);
    const w = randInt(4, 14);
    const p = 2 * (l + w);
    return mc(
      "5.4H",
      `${name} built a rectangular garden that is ${l} feet long and ${w} feet wide. What is the perimeter?`,
      `${p} ft`,
      [`${l * w} ft`, `${l + w} ft`, `${2 * l + w} ft`, `${p * 2} ft`],
      `Perimeter of a rectangle is 2 × (l + w) = 2 × (${l} + ${w}) = ${p} feet.`,
    );
  }
  if (kind === "area") {
    const l = randInt(8, 22);
    const w = randInt(4, 12);
    return mc(
      "5.4H",
      `A rectangular mural is ${l} feet long and ${w} feet wide. What is its area?`,
      `${l * w} sq ft`,
      [`${2 * (l + w)} sq ft`, `${l + w} sq ft`, `${l * w * 2} sq ft`],
      `Area = length × width = ${l} × ${w} = ${l * w} square feet.`,
    );
  }
  if (kind === "vol") {
    const l = randInt(3, 10);
    const w = randInt(3, 8);
    const h = randInt(2, 7);
    const v = l * w * h;
    return mc(
      "5.4H",
      `A packing box measures ${l} in by ${w} in by ${h} in. What is its volume?`,
      `${v} cu in`,
      [`${l * w} cu in`, `${2 * (l * w + w * h + l * h)} cu in`, `${l + w + h} cu in`],
      `V = l × w × h = ${l} × ${w} × ${h} = ${v} cubic inches.`,
      { visual: { kind: "prism", l, w, h } },
    );
  }
  const a = randInt(8, 14);
  const b = randInt(3, 6);
  const c = randInt(4, 8);
  // L-shape: large rectangle a by (b+c) minus a missing? Simpler: two rectangles.
  const area = a * b + c * b;
  return mc(
    "5.4H",
    `An L-shaped patio is made of a ${a} ft by ${b} ft rectangle joined to a ${c} ft by ${b} ft rectangle along the ${b} ft side. What is the area of the patio?`,
    `${area} sq ft`,
    [`${a * b} sq ft`, `${(a + c) * (b + b)} sq ft`, `${a * b * c} sq ft`, `${2 * (a + b + c)} sq ft`],
    `Add the two rectangles: ${a} × ${b} + ${c} × ${b} = ${a * b} + ${c * b} = ${area} square feet.`,
  );
}

export const generators54: Record<string, () => Question> = {
  "5.4A": gen54A,
  "5.4B": gen54B,
  "5.4C": gen54C,
  "5.4D": gen54D,
  "5.4E": gen54E,
  "5.4F": gen54F,
  "5.4G": gen54G,
  "5.4H": gen54H,
};
