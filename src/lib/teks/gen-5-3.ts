import { formatFrac, formatFracAscii, lcm, simplify } from "@/lib/math/fractions";
import { pick, randInt } from "@/lib/math/rng";
import { fmtDec, input, maybeInput, mc, moneyLabel, nearbyInts, pickName, roundTo } from "./build";
import type { Question } from "./types";

function gen53A(): Question {
  const name = pickName();
  const kind = pick(["add", "sub", "mul", "div"] as const);
  if (kind === "add") {
    const a = randInt(28, 89) * 10 + randInt(1, 9);
    const b = randInt(28, 89) * 10 + randInt(1, 9);
    const ra = Math.round(a / 10) * 10;
    const rb = Math.round(b / 10) * 10;
    const correct = String(ra + rb);
    return mc(
      "5.3A",
      `${name} estimates ${a} + ${b} by rounding each number to the nearest ten. What is the estimate?`,
      correct,
      [String(a + b), String(ra + b), String(a + rb), String(Math.round((a + b) / 10) * 10)],
      `${a} rounds to ${ra} and ${b} rounds to ${rb}, so the estimate is ${ra} + ${rb} = ${correct}.`,
    );
  }
  if (kind === "sub") {
    const a = randInt(50, 96) * 10 + randInt(1, 9);
    const b = randInt(12, 40) * 10 + randInt(1, 9);
    const ra = Math.round(a / 10) * 10;
    const rb = Math.round(b / 10) * 10;
    const correct = String(ra - rb);
    return mc(
      "5.3A",
      `Estimate ${a} − ${b} by rounding each number to the nearest ten.`,
      correct,
      [String(a - b), String(ra - b), String(Math.abs(rb - ra)), String(ra + rb)],
      `${a} → ${ra}, ${b} → ${rb}. ${ra} − ${rb} = ${correct}.`,
    );
  }
  if (kind === "mul") {
    const a = randInt(18, 84);
    const b = randInt(6, 19);
    const ra = Math.round(a / 10) * 10 || 10;
    const rb = b < 12 ? 10 : Math.round(b / 10) * 10;
    const correct = String(ra * rb);
    return mc(
      "5.3A",
      `${name} needs about ${a} × ${b}. Which is the best estimate using rounding?`,
      correct,
      [String(a * b), String(ra * b), String(a * rb), String(ra * rb + 50)],
      `Round to compatible numbers: ${a} ≈ ${ra} and ${b} ≈ ${rb}, so ${ra} × ${rb} = ${correct}.`,
    );
  }
  const d = randInt(6, 19);
  const q = randInt(18, 80);
  const dividend = d * q + randInt(1, d - 1);
  const rd = Math.round(d / 10) * 10 || 10;
  const rdiv = Math.round(dividend / 10) * 10;
  const correct = String(Math.round(rdiv / rd));
  return mc(
    "5.3A",
    `Estimate ${dividend} ÷ ${d} by rounding to compatible numbers.`,
    correct,
    [String(q), String(Math.floor(dividend / d)), String(rd), String(Math.round(dividend / 10))],
    `A compatible estimate is about ${rdiv} ÷ ${rd} = ${correct}.`,
  );
}

function gen53B(): Question {
  const a = randInt(102, 986);
  const b = randInt(12, 48);
  const product = a * b;
  const name = pickName();
  const stem = pick([
    `Find the product.`,
    `${name} packed ${a} boxes with ${b} pencils in each box. How many pencils is that in all?`,
    `A school ordered ${b} cases of water. Each case holds ${a} bottles. How many bottles were ordered?`,
  ]);
  const explanation = `${a} × ${b} = ${product.toLocaleString("en-US")}.`;
  const wrong = nearbyInts(product, [a + b, a * (b + 1), a * (b - 1), (a + 1) * b]).map(String);
  if (maybeInput()) {
    return input("5.3B", stem, String(product), explanation, {
      expression: `${a} × ${b}`,
      accept: [String(product), product.toLocaleString("en-US")],
      hint: "Whole number",
    });
  }
  return mc("5.3B", stem, String(product), wrong, explanation, { expression: `${a} × ${b}` });
}

function gen53C(): Question {
  const d = randInt(12, 28);
  const q = randInt(15, 85);
  const rem = pick([0, 0, 0, randInt(1, d - 1)]);
  const dividend = d * q + rem;
  const name = pickName();
  if (rem === 0) {
    const stem = pick([
      `Find the quotient.`,
      `${name} shares ${dividend.toLocaleString("en-US")} stickers equally among ${d} friends. How many stickers does each friend get?`,
    ]);
    const explanation = `${dividend} ÷ ${d} = ${q}.`;
    if (maybeInput()) {
      return input("5.3C", stem, String(q), explanation, {
        expression: `${dividend} ÷ ${d}`,
        hint: "Whole number",
      });
    }
    return mc("5.3C", stem, String(q), nearbyInts(q).map(String), explanation, {
      expression: `${dividend} ÷ ${d}`,
    });
  }
  const stem = `${name} has ${dividend.toLocaleString("en-US")} erasers to put in packs of ${d}. How many full packs can be made, and how many erasers are left over?`;
  const correct = `${q} packs, ${rem} left over`;
  const wrong = [
    `${q} packs, 0 left over`,
    `${q + 1} packs, ${rem} left over`,
    `${rem} packs, ${q} left over`,
    `${q} packs, ${d - rem} left over`,
  ];
  return mc("5.3C", stem, correct, wrong, `${dividend} ÷ ${d} = ${q} R${rem}. That is ${q} full packs with ${rem} left over.`);
}

function gen53D(): Question {
  const cols = randInt(2, 9);
  const rows = randInt(2, 9);
  const product = (cols * rows) / 100;
  const productText = product.toFixed(2);
  const a = (cols / 10).toFixed(1);
  const b = (rows / 10).toFixed(1);
  const mode = pick(["product", "factors"] as const);
  if (mode === "product") {
    return mc(
      "5.3D",
      `A 10-by-10 grid has ${cols} columns and ${rows} rows shaded. The overlap represents the product ${a} × ${b}. What is the product?`,
      productText,
      [(cols * rows / 10).toFixed(1), `${cols}.${rows}`, (cols / 10 + rows / 10).toFixed(1), (cols * rows).toFixed(2)],
      `Each small square is 0.01. The overlap is ${cols} × ${rows} = ${cols * rows} hundredths, which is ${productText}.`,
      { visual: { kind: "grid10", cols, rows } },
    );
  }
  const correct = `${a} × ${b}`;
  return mc(
    "5.3D",
    `The model shows tenths along each side of a 10-by-10 hundredths grid. Which multiplication does the shaded overlap represent?`,
    correct,
    [`${a} + ${b}`, `${cols} × ${rows}`, `${a} × ${rows}`, `0.${cols}${rows} × 0.1`],
    `${cols} tenths is ${a} and ${rows} tenths is ${b}, so the model shows ${correct}.`,
    { visual: { kind: "grid10", cols, rows } },
  );
}

function gen53E(): Question {
  const name = pickName();
  const moneyQ = pick([true, false]);
  if (moneyQ) {
    const price = randInt(125, 995);
    const qty = randInt(2, 9);
    const total = price * qty;
    const correct = moneyLabel(total);
    const stem = pick([
      `${name} buys ${qty} notebooks that cost ${moneyLabel(price)} each. How much does ${name} spend?`,
      `A pack of markers costs ${moneyLabel(price)}. What is the cost of ${qty} packs?`,
    ]);
    const wrong = [moneyLabel(price + qty), moneyLabel(price * (qty - 1)), moneyLabel(total + 100), moneyLabel(Math.round(total / 10))];
    return mc("5.3E", stem, correct, wrong, `${qty} × ${moneyLabel(price)} = ${correct}.`);
  }
  const aTenths = randInt(12, 98);
  const bTenths = randInt(12, 98);
  const a = aTenths / 10;
  const b = bTenths / 10;
  const product = (aTenths * bTenths) / 100;
  const correct = fmtDec(roundTo(product, 2));
  const at = fmtDec(a, 1);
  const bt = fmtDec(b, 1);
  const explanation = `Think ${aTenths} × ${bTenths} = ${aTenths * bTenths}, then place the decimal two places from the right: ${fmtDec(roundTo(product, 2), 2)}.`;
  if (maybeInput()) {
    return input("5.3E", `Find the product.`, correct, explanation, {
      expression: `${at} × ${bt}`,
      accept: [product.toFixed(2), fmtDec(roundTo(product, 2))],
      hint: "Decimal, to the hundredths if needed",
    });
  }
  return mc(
    "5.3E",
    `Find the product.`,
    product.toFixed(2),
    [
      (a + b).toFixed(2),
      ((aTenths * bTenths) / 10).toFixed(1),
      ((aTenths * bTenths) / 1000).toFixed(3),
      (a * Math.floor(b)).toFixed(2),
    ],
    explanation,
    { expression: `${at} × ${bt}` },
  );
}

function gen53F(): Question {
  const group = pick([2, 3, 4, 5]);
  const groups = randInt(3, 8);
  const totalTenths = group * groups;
  const total = (totalTenths / 10).toFixed(1);
  const g = (group / 10).toFixed(1);
  const mode = pick(["how-many", "expression"] as const);
  if (mode === "how-many") {
    return mc(
      "5.3F",
      `A bar shows ${total}. It is split into equal pieces of ${g}. How many pieces are there?`,
      String(groups),
      [String(group), String(totalTenths), String(groups + 1), fmtDec(totalTenths / 10)],
      `${total} ÷ ${g} = ${groups}, because ${groups} groups of ${g} make ${total}.`,
      { visual: { kind: "tenth-bar", totalTenths, groupTenths: group } },
    );
  }
  return mc(
    "5.3F",
    `The bar is ${total} long and is grouped by ${g}. Which expression does the model represent?`,
    `${total} ÷ ${g}`,
    [`${total} × ${g}`, `${total} − ${g}`, `${g} ÷ ${total}`, `${groups} ÷ ${g}`],
    `You are finding how many groups of ${g} fit into ${total}, which is ${total} ÷ ${g} = ${groups}.`,
    { visual: { kind: "tenth-bar", totalTenths, groupTenths: group } },
  );
}

function gen53G(): Question {
  const d = pick([2, 3, 4, 5, 6, 8, 10, 12]);
  const qHundredths = randInt(25, 850);
  const dividendHundredths = d * qHundredths;
  if (dividendHundredths > 9999) return gen53G();
  const dividend = dividendHundredths / 100;
  const q = qHundredths / 100;
  const dt = fmtDec(dividend);
  const qt = fmtDec(q);
  const name = pickName();
  const stem = pick([
    `Find the quotient.`,
    `${name} splits ${dt} liters of juice equally into ${d} pitchers. How much is in each pitcher?`,
  ]);
  const explanation = `${dt} ÷ ${d} = ${qt}. Divide as whole numbers, then place the decimal.`;
  if (maybeInput()) {
    return input("5.3G", stem, qt, explanation, {
      expression: `${dt} ÷ ${d}`,
      accept: [q.toFixed(2), qt],
      hint: "Decimal",
    });
  }
  return mc(
    "5.3G",
    stem,
    q.toFixed(2).replace(/0$/, "").replace(/\.$/, "") === qt ? qt : q.toFixed(2),
    [fmtDec(dividend * d), fmtDec(q * 10), fmtDec(dividend - d), fmtDec(q + 1)],
    explanation,
    { expression: `${dt} ÷ ${d}` },
  );
}

const DENS = [2, 3, 4, 5, 6, 8, 10, 12];

function unlikePair(): { n1: number; d1: number; n2: number; d2: number } {
  const d1 = pick(DENS);
  const d2 = pick(DENS.filter((d) => d !== d1));
  const n1 = randInt(1, d1 - 1);
  const n2 = randInt(1, d2 - 1);
  return { n1, d1, n2, d2 };
}

function gen53H(): Question {
  const { n1, d1, n2, d2 } = unlikePair();
  const add = pick([true, false]);
  const a = n1 / d1;
  const b = n2 / d2;
  const lcd = lcm(d1, d2);
  let nn1 = n1 * (lcd / d1);
  let nn2 = n2 * (lcd / d2);
  let op: "+" | "−" = "+";
  if (!add && a < b) {
    op = "−";
    [nn1, nn2] = [nn2, nn1];
  } else if (!add) {
    op = "−";
  }
  const leftN = op === "+" ? n1 : a >= b ? n1 : n2;
  const leftD = op === "+" ? d1 : a >= b ? d1 : d2;
  const rightN = op === "+" ? n2 : a >= b ? n2 : n1;
  const rightD = op === "+" ? d2 : a >= b ? d2 : d1;
  const resN = op === "+" ? nn1 + nn2 : Math.abs(nn1 - nn2);
  const simp = simplify(resN, lcd);
  const correct = formatFrac(simp.n, simp.d);
  const ascii = formatFracAscii(simp.n, simp.d);
  const unsimp = formatFracAscii(resN, lcd, false);
  const stem = `Find the difference`.replace("difference", op === "+" ? "sum" : "difference");
  const expression = `${formatFrac(leftN, leftD, false)} ${op} ${formatFrac(rightN, rightD, false)}`;
  const wrong = [
    formatFrac(leftN + rightN, leftD + rightD),
    formatFrac(leftN + rightN, lcd),
    formatFrac(Math.abs(leftN - rightN), Math.abs(leftD - rightD) || lcd),
    formatFrac(resN, leftD),
  ];
  const explanation = `Use a common denominator of ${lcd}: ${formatFrac(nn1, lcd, false)} ${op} ${formatFrac(nn2, lcd, false)} = ${formatFrac(resN, lcd, false)}${unsimp !== ascii ? `, which simplifies to ${correct}` : ""}.`;
  if (maybeInput()) {
    return input("5.3H", `Find the ${op === "+" ? "sum" : "difference"}.`, correct, explanation, {
      expression,
      accept: [ascii, unsimp, formatFrac(simp.n, simp.d, false), formatFracAscii(simp.n, simp.d, false)],
      hint: "Fraction, mixed number OK",
      visual: {
        kind: "fraction-bars",
        bars: [
          { label: formatFrac(leftN, leftD, false), num: leftN, den: leftD },
          { label: formatFrac(rightN, rightD, false), num: rightN, den: rightD },
        ],
      },
    });
  }
  return mc("5.3H", stem, correct, wrong, explanation, {
    expression,
    visual: {
      kind: "fraction-bars",
      bars: [
        { label: formatFrac(leftN, leftD, false), num: leftN, den: leftD },
        { label: formatFrac(rightN, rightD, false), num: rightN, den: rightD },
      ],
    },
  });
}

function gen53I(): Question {
  const d = pick([2, 3, 4, 5, 6, 8]);
  const n = randInt(1, d - 1);
  const w = randInt(2, 9);
  const prod = simplify(w * n, d);
  const correct = formatFrac(prod.n, prod.d);
  const name = pickName();
  const stem = pick([
    `Find the product.`,
    `${name} ran ${formatFrac(n, d, false)} mile on each of ${w} days. How far did ${name} run in all?`,
  ]);
  const explanation = `${w} × ${formatFrac(n, d, false)} = ${formatFrac(w * n, d, false)} = ${correct}.`;
  const wrong = [
    formatFrac(w + n, d),
    formatFrac(w * n, d * w),
    formatFrac(n, d * w),
    String(w * n),
  ];
  return mc("5.3I", stem, correct, wrong, explanation, {
    expression: `${w} × ${formatFrac(n, d, false)}`,
  });
}

function gen53J(): Question {
  const wholeFirst = pick([true, false]);
  const d = pick([2, 3, 4, 5, 6, 8]);
  const w = randInt(2, 8);
  if (wholeFirst) {
    const correct = `${w} ÷ ${formatFrac(1, d, false)}`;
    return mc(
      "5.3J",
      `A model shows ${w} wholes, each split into ${d} equal parts. The question is, “How many ${formatFrac(1, d, false)} pieces are in ${w} wholes?” Which expression matches the model?`,
      correct,
      [
        `${formatFrac(1, d, false)} ÷ ${w}`,
        `${w} × ${d}`,
        `${w} − ${formatFrac(1, d, false)}`,
        `${formatFrac(1, d, false)} × ${w}`,
      ],
      `“How many unit fractions of ${formatFrac(1, d, false)} fit into ${w}?” is ${correct} = ${w * d}.`,
    );
  }
  const correct = `${formatFrac(1, d, false)} ÷ ${w}`;
  return mc(
    "5.3J",
    `A model shows one ${formatFrac(1, d, false)} piece split into ${w} equal parts. Which expression does the model represent?`,
    correct,
    [
      `${w} ÷ ${formatFrac(1, d, false)}`,
      `${formatFrac(1, d, false)} × ${w}`,
      `${w} × ${d}`,
      `${formatFrac(1, d * w, false)} × ${w}`,
    ],
    `Splitting a unit fraction into ${w} equal parts is ${correct} = ${formatFrac(1, d * w, false)}.`,
  );
}

function gen53K(): Question {
  const kind = pick(["dec-add", "dec-sub", "frac"] as const);
  if (kind === "frac") return gen53HFrom("5.3K");
  const a = randInt(125, 9800);
  const b = randInt(108, 4500);
  if (kind === "dec-add") {
    const sum = a + b;
    const at = (a / 100).toFixed(2);
    const bt = (b / 100).toFixed(2);
    const correct = (sum / 100).toFixed(2);
    const name = pickName();
    const stem = pick([
      `Find the sum.`,
      `${name} hiked ${at} miles on Saturday and ${bt} miles on Sunday. How many miles in all?`,
    ]);
    return mc("5.3K", stem, correct, [(a / 100 + b / 10).toFixed(2), ((a + b) / 10).toFixed(1), (Math.abs(a - b) / 100).toFixed(2)], `${at} + ${bt} = ${correct}.`, {
      expression: `${at} + ${bt}`,
    });
  }
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  const at = (hi / 100).toFixed(2);
  const bt = (lo / 100).toFixed(2);
  const correct = ((hi - lo) / 100).toFixed(2);
  return mc(
    "5.3K",
    `Find the difference.`,
    correct,
    [((hi + lo) / 100).toFixed(2), ((hi - lo) / 10).toFixed(1), (lo / 100).toFixed(2)],
    `${at} − ${bt} = ${correct}.`,
    { expression: `${at} − ${bt}` },
  );
}

function gen53HFrom(teks: string): Question {
  const q = gen53H();
  return { ...q, teks };
}

function gen53L(): Question {
  const wholeFirst = pick([true, false]);
  const d = pick([2, 3, 4, 5, 6, 8, 10]);
  const w = randInt(2, 12);
  const name = pickName();
  if (wholeFirst) {
    const correct = String(w * d);
    const stem = pick([
      `Find the quotient.`,
      `${name} has ${w} yards of ribbon and cuts it into pieces ${formatFrac(1, d, false)} yard long. How many pieces are there?`,
    ]);
    const explanation = `${w} ÷ ${formatFrac(1, d, false)} = ${w} × ${d} = ${correct}.`;
    if (maybeInput()) {
      return input("5.3L", stem, correct, explanation, {
        expression: `${w} ÷ ${formatFrac(1, d, false)}`,
        hint: "Whole number",
      });
    }
    return mc("5.3L", stem, correct, [String(w + d), String(d), formatFrac(1, w * d), String(w)], explanation, {
      expression: `${w} ÷ ${formatFrac(1, d, false)}`,
    });
  }
  const simp = simplify(1, d * w);
  const correct = formatFrac(simp.n, simp.d, false);
  const explanation = `${formatFrac(1, d, false)} ÷ ${w} = ${formatFrac(1, d * w, false)}.`;
  return mc(
    "5.3L",
    `Find the quotient.`,
    correct,
    [String(w * d), formatFrac(w, d, false), formatFrac(1, d + w, false), String(w)],
    explanation,
    { expression: `${formatFrac(1, d, false)} ÷ ${w}` },
  );
}

export const generators53: Record<string, () => Question> = {
  "5.3A": gen53A,
  "5.3B": gen53B,
  "5.3C": gen53C,
  "5.3D": gen53D,
  "5.3E": gen53E,
  "5.3F": gen53F,
  "5.3G": gen53G,
  "5.3H": gen53H,
  "5.3I": gen53I,
  "5.3J": gen53J,
  "5.3K": gen53K,
  "5.3L": gen53L,
};
