import { pick, randInt, shuffle } from "@/lib/math/rng";
import { input, maybeInput, mc, nearbyInts, pickName } from "./build";
import type { Question } from "./types";

function gen55A(): Question {
  const items: Array<{ stem: string; correct: string; wrong: string[]; explanation: string; figure?: string }> = [
    {
      stem: "Which statement is always true?",
      correct: "Every square is a rectangle.",
      wrong: [
        "Every rectangle is a square.",
        "Every rhombus is a square.",
        "Every parallelogram is a rhombus.",
      ],
      explanation: "A square has four right angles, so it is a special rectangle. Not every rectangle has equal sides, so not every rectangle is a square.",
    },
    {
      stem: "Which statement is always true?",
      correct: "Every square is a rhombus.",
      wrong: ["Every rhombus is a square.", "Every rectangle is a rhombus.", "Every trapezoid is a square."],
      explanation: "A square has four equal sides, so it is a rhombus. A rhombus needs right angles to be a square.",
    },
    {
      stem: "Which figure is a parallelogram with four right angles?",
      correct: "rectangle",
      wrong: ["rhombus", "trapezoid", "right triangle"],
      explanation: "A rectangle is a parallelogram with four right angles. A square is a special rectangle, but “rectangle” is the name of that set.",
      figure: "rectangle",
    },
    {
      stem: "Which figure is a quadrilateral with exactly one pair of parallel sides?",
      correct: "trapezoid",
      wrong: ["parallelogram", "rhombus", "rectangle"],
      explanation: "In Grade 5 Texas math, a trapezoid has exactly one pair of parallel sides. Parallelograms have two pairs.",
      figure: "trapezoid",
    },
    {
      stem: "A rhombus that also has four right angles is best named a —",
      correct: "square",
      wrong: ["rectangle only", "trapezoid", "kite"],
      explanation: "Equal sides (rhombus) plus right angles means the figure is a square — a subset of both rhombi and rectangles.",
      figure: "square",
    },
    {
      stem: "Which statement is true about all parallelograms?",
      correct: "Both pairs of opposite sides are parallel.",
      wrong: [
        "All sides are the same length.",
        "All angles are right angles.",
        "There is exactly one pair of parallel sides.",
      ],
      explanation: "The defining property of a parallelogram is two pairs of parallel sides. Equal sides or right angles make special parallelograms.",
      figure: "parallelogram",
    },
    {
      stem: "A triangle with sides 5 cm, 5 cm, and 8 cm is —",
      correct: "isosceles",
      wrong: ["equilateral", "scalene", "a quadrilateral"],
      explanation: "Exactly two sides equal means isosceles. Equilateral needs all three equal; scalene needs none equal.",
      figure: "isosceles",
    },
    {
      stem: "Which figure belongs to every set listed: quadrilateral, parallelogram, rectangle, and rhombus?",
      correct: "square",
      wrong: ["rhombus that is not a square", "rectangle that is not a square", "trapezoid"],
      explanation: "A square sits at the bottom of the hierarchy: it is a rhombus, a rectangle, a parallelogram, and a quadrilateral.",
      figure: "square",
    },
    {
      stem: "Which shape is not a parallelogram?",
      correct: "trapezoid",
      wrong: ["square", "rectangle", "rhombus"],
      explanation: "Squares, rectangles, and rhombi all have two pairs of parallel sides. A trapezoid has only one pair.",
      figure: "trapezoid",
    },
    {
      stem: "A rectangle that is also a rhombus must be a —",
      correct: "square",
      wrong: ["trapezoid", "scalene triangle", "regular pentagon"],
      explanation: "Four right angles and four equal sides is the definition of a square.",
    },
  ];
  const item = pick(items);
  return mc("5.5A", item.stem, item.correct, item.wrong, item.explanation, {
    visual: item.figure ? { kind: "shape", figure: item.figure } : undefined,
  });
}

function gen56A(): Question {
  const l = randInt(2, 5);
  const w = randInt(2, 4);
  const h = randInt(2, 4);
  const v = l * w * h;
  const name = pickName();
  return mc(
    "5.6A",
    `${name} packed a ${l} by ${w} by ${h} box with 1-unit cubes, with no gaps or overlaps. How many unit cubes fill the box?`,
    String(v),
    nearbyInts(v, [l * w, l + w + h, 2 * (l * w + w * h + l * h)]).map(String),
    `Each unit cube has volume 1 cubic unit. It takes ${l} × ${w} × ${h} = ${v} unit cubes to fill the prism.`,
    { visual: { kind: "cubes", l, w, h } },
  );
}

function gen56B(): Question {
  const l = randInt(3, 6);
  const w = randInt(2, 5);
  const h = randInt(2, 5);
  const layer = l * w;
  const v = layer * h;
  const mode = pick(["layers", "volume"] as const);
  if (mode === "layers") {
    return mc(
      "5.6B",
      `A rectangular prism has ${h} layers. Each layer is a ${l} by ${w} array of unit cubes. What is the volume?`,
      `${v} cubic units`,
      [`${layer} cubic units`, `${h} cubic units`, `${l * h} cubic units`, `${l + w + h} cubic units`],
      `Volume = cubes in one layer × number of layers = ${layer} × ${h} = ${v} cubic units.`,
      { visual: { kind: "cubes", l, w, h } },
    );
  }
  return mc(
    "5.6B",
    `One layer of a prism holds ${layer} unit cubes. The prism is ${h} layers tall. How many unit cubes fill the prism?`,
    String(v),
    nearbyInts(v, [layer, h, layer + h]).map(String),
    `${layer} × ${h} = ${v}.`,
    { visual: { kind: "cubes", l, w, h } },
  );
}

type Conv = { from: string; to: string; factor: number; extra?: string };

const CONVS: Conv[] = [
  { from: "feet", to: "inches", factor: 12 },
  { from: "yards", to: "feet", factor: 3 },
  { from: "yards", to: "inches", factor: 36 },
  { from: "pounds", to: "ounces", factor: 16 },
  { from: "gallons", to: "quarts", factor: 4 },
  { from: "gallons", to: "pints", factor: 8 },
  { from: "quarts", to: "pints", factor: 2 },
  { from: "pints", to: "cups", factor: 2 },
  { from: "meters", to: "centimeters", factor: 100 },
  { from: "kilometers", to: "meters", factor: 1000 },
  { from: "meters", to: "millimeters", factor: 1000 },
  { from: "liters", to: "milliliters", factor: 1000 },
  { from: "kilograms", to: "grams", factor: 1000 },
  { from: "hours", to: "minutes", factor: 60 },
  { from: "minutes", to: "seconds", factor: 60 },
];

function gen57A(): Question {
  const conv = pick(CONVS);
  const n = pick([2, 3, 4, 5, 6, 8, 10, 12]);
  const result = n * conv.factor;
  const name = pickName();
  const stem = pick([
    `${n} ${conv.from} is how many ${conv.to}?`,
    `${name} has ${n} ${conv.from} of ribbon. How many ${conv.to} is that?`,
  ]);
  const explanation = `1 ${conv.from.replace(/s$/, "")} = ${conv.factor} ${conv.to}, so ${n} × ${conv.factor} = ${result} ${conv.to}.`;
  if (maybeInput()) {
    return input("5.7A", stem, String(result), explanation, { hint: `A number of ${conv.to}` });
  }
  return mc(
    "5.7A",
    stem,
    `${result} ${conv.to}`,
    [
      `${n + conv.factor} ${conv.to}`,
      `${Math.round(n * conv.factor) / 10} ${conv.to}`,
      `${n * (conv.factor + 2)} ${conv.to}`,
      `${conv.factor} ${conv.to}`,
    ],
    explanation,
  );
}

function gen58A(): Question {
  const items = [
    {
      stem: "The two number lines on a coordinate plane intersect at which point?",
      correct: "the origin (0, 0)",
      wrong: ["(1, 1)", "the point (1, 0)", "any point on the x-axis"],
      explanation: "The axes are perpendicular number lines that cross at the origin, (0, 0).",
    },
    {
      stem: "In the ordered pair (4, 7), what does the 4 tell you?",
      correct: "Move 4 units to the right of the origin (the x-coordinate).",
      wrong: [
        "Move 4 units up from the origin (the y-coordinate).",
        "The point is 4 units from (7, 0).",
        "There are 4 axes.",
      ],
      explanation: "An ordered pair is (x, y). The first number is the x-coordinate — distance right from the origin in Quadrant I.",
    },
    {
      stem: "Which statement describes the y-axis?",
      correct: "the vertical number line",
      wrong: ["the horizontal number line", "the origin", "any diagonal line"],
      explanation: "The x-axis is horizontal; the y-axis is vertical. They meet at (0, 0).",
    },
    {
      stem: "An ordered pair is written as —",
      correct: "(x, y)",
      wrong: ["(y, x)", "{x, y}", "x + y"],
      explanation: "The x-coordinate comes first, then the y-coordinate: (x, y).",
    },
  ];
  const item = pick(items);
  return mc("5.8A", item.stem, item.correct, item.wrong, item.explanation);
}

function gen58B(): Question {
  const x = randInt(1, 9);
  const y = randInt(1, 9);
  return mc(
    "5.8B",
    `What is the correct way to graph the ordered pair (${x}, ${y}) in the first quadrant?`,
    `Start at (0, 0), move ${x} units right, then ${y} units up.`,
    [
      `Start at (0, 0), move ${y} units right, then ${x} units up.`,
      `Start at (0, 0), move ${x} units up, then ${y} units right.`,
      `Start at (${x}, ${y}) and move to the origin.`,
    ],
    `x first (right ${x}), then y (up ${y}). The point is (${x}, ${y}).`,
    { visual: { kind: "coordinate", points: [{ x, y, label: `(${x}, ${y})` }], highlight: { x, y } } },
  );
}

function gen58C(): Question {
  const multiplicative = pick([true, false]);
  const a = multiplicative ? randInt(2, 6) : randInt(1, 8);
  const x = randInt(2, 8);
  const y = multiplicative ? a * x : x + a;
  const rule = multiplicative ? `y = ${a}x` : `y = x + ${a}`;
  const mode = pick(["from-rule", "from-table", "which-point"] as const);
  if (mode === "from-rule") {
    return mc(
      "5.8C",
      `A pattern follows ${rule}. Which ordered pair belongs on its graph in the first quadrant?`,
      `(${x}, ${y})`,
      [`(${y}, ${x})`, `(${x}, ${multiplicative ? x + a : a * x})`, `(${x}, ${a})`],
      `Plug in x = ${x}: y = ${y}, so the point is (${x}, ${y}). Remember (x, y), not (y, x).`,
      { visual: { kind: "coordinate", points: [{ x, y, label: `(${x}, ${y})` }] } },
    );
  }
  const xs = [1, 2, 3, 4];
  const rows = xs.map((n) => [String(n), String(multiplicative ? a * n : n + a)]);
  const pickX = pick([2, 3, 4]);
  const pickY = multiplicative ? a * pickX : pickX + a;
  return mc(
    "5.8C",
    `The input-output table follows ${rule}. Which ordered pair from the table can be graphed in the first quadrant?`,
    `(${pickX}, ${pickY})`,
    [`(${pickY}, ${pickX})`, `(${pickX}, ${pickX})`, `(0, ${a})`],
    `Each row is an ordered pair (x, y). For x = ${pickX}, y = ${pickY}.`,
    {
      visual: { kind: "table", caption: `Rule: ${rule}`, headers: ["x (input)", "y (output)"], rows },
    },
  );
}

export const generatorsGeo: Record<string, () => Question> = {
  "5.5A": gen55A,
  "5.6A": gen56A,
  "5.6B": gen56B,
  "5.7A": gen57A,
  "5.8A": gen58A,
  "5.8B": gen58B,
  "5.8C": gen58C,
};
