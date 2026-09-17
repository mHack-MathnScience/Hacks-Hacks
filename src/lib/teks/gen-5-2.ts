import { pick, randInt, shuffle } from "@/lib/math/rng";
import { fmtDec, input, maybeInput, mc, pickName } from "./build";
import type { Question } from "./types";

function randomThousandths(): { n: number; digits: number[]; text: string } {
  const ones = randInt(1, 48);
  const tenths = randInt(0, 9);
  const hundredths = randInt(0, 9);
  let thousandths = randInt(0, 9);
  if (tenths === 0 && hundredths === 0 && thousandths === 0) thousandths = randInt(1, 9);
  const n = ones + tenths / 10 + hundredths / 100 + thousandths / 1000;
  const text = n.toFixed(3);
  return { n, digits: [ones, tenths, hundredths, thousandths], text };
}

/** Decimal through thousandths with no repeated digits, so "the digit 5" is unambiguous. */
function uniqueDigitThousandths(): { n: number; digits: number[]; text: string } {
  const bag = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let tens = 0;
  let unused = bag;

  if (Math.random() < 0.5) {
    const tensPool = unused.filter((d) => d >= 1 && d <= 4);
    tens = tensPool.length ? pick(tensPool) : 1;
    unused = unused.filter((d) => d !== tens);
  }

  const units = tens === 0 ? pick(unused.filter((d) => d !== 0)) : unused[0]!;
  unused = unused.filter((d) => d !== units);

  const t = unused[0]!;
  const h = unused[1]!;
  const th = unused[2]!;
  const ones = tens * 10 + units;
  const n = ones + t / 10 + h / 100 + th / 1000;
  const text = n.toFixed(3);
  return { n, digits: [ones, t, h, th], text };
}

function digitAppearsOnce(text: string, digit: number): boolean {
  return [...text].filter((ch) => ch === String(digit)).length === 1;
}

function expandedNotation(ones: number, t: number, h: number, th: number): string {
  const parts: string[] = [];
  const tens = Math.floor(ones / 10);
  const units = ones % 10;
  if (tens) parts.push(`${tens} × 10`);
  if (units) parts.push(`${units} × 1`);
  if (t) parts.push(`${t} × 0.1`);
  if (h) parts.push(`${h} × 0.01`);
  if (th) parts.push(`${th} × 0.001`);
  if (parts.length === 0) return "0";
  return parts.join(" + ");
}

function gen52A(): Question {
  const mode = pick(["value", "expanded", "place"] as const);

  if (mode === "place" || mode === "value") {
    const { digits, text } = uniqueDigitThousandths();
    const [, t, h, th] = digits;
    const options = [
      { digit: t, place: "tenths", value: t / 10, label: fmtDec(t / 10) },
      { digit: h, place: "hundredths", value: h / 100, label: fmtDec(h / 100, 2) },
      { digit: th, place: "thousandths", value: th / 1000, label: (th / 1000).toFixed(3) },
    ].filter((x) => x.digit !== 0);
    const which = pick(options);
    if (!digitAppearsOnce(text, which.digit)) return gen52A();

    if (mode === "place") {
      return mc(
        "5.2A",
        `In ${text}, the digit ${which.digit} is in which place?`,
        which.place,
        shuffle(["ones", "tenths", "hundredths", "thousandths", "tens"]).filter((p) => p !== which.place),
        `Look just to the right of the decimal point: tenths, then hundredths, then thousandths. The digit ${which.digit} is in the ${which.place} place.`,
      );
    }

    const wrong = [
      String(which.digit),
      fmtDec(which.digit / 10),
      fmtDec(which.digit / 100, 2),
      (which.digit / 1000).toFixed(3),
      fmtDec(which.digit * 10),
    ];
    return mc(
      "5.2A",
      `What is the value of the digit ${which.digit} in ${text}?`,
      which.label,
      wrong,
      `The digit ${which.digit} is in the ${which.place} place, so its value is ${which.label}.`,
    );
  }

  const { digits, text } = randomThousandths();
  const [ones, t, h, th] = digits;
  const correct = expandedNotation(ones, t, h, th);
  const wrong = [
    expandedNotation(ones, th, h, t),
    expandedNotation(ones, h, t, th),
    `${ones} + ${t} + ${h} + ${th}`,
    `${t} × 1 + ${h} × 0.1 + ${th} × 0.01`,
  ];
  return mc(
    "5.2A",
    `Which shows ${text} in expanded notation?`,
    correct,
    wrong,
    `Write each digit times its place value: ones, tenths (0.1), hundredths (0.01), and thousandths (0.001).`,
  );
}

function gen52B(): Question {
  const mode = pick(["compare", "order"] as const);

  const make = () => {
    const a = randInt(100, 9999);
    return a / 1000;
  };

  if (mode === "compare") {
    let a = make();
    let b = make();
    if (a === b) b = (randInt(100, 9999) + 1) / 1000;
    const at = a.toFixed(3);
    const bt = b.toFixed(3);
    const symbol = a > b ? ">" : "<";
    const correct = `${at} ${symbol} ${bt}`;
    const wrong = [`${at} ${symbol === ">" ? "<" : ">"} ${bt}`, `${at} = ${bt}`, `${bt} = ${at}`];
    if (maybeInput()) {
      return input(
        "5.2B",
        `Compare the decimals. Write a true statement using >, <, or =.`,
        correct,
        `Line up the place values. ${at} is ${a > b ? "greater than" : "less than"} ${bt}, so ${correct}.`,
        { expression: `${at}  ☐  ${bt}`, accept: [correct, `${bt} ${a > b ? "<" : ">"} ${at}`], hint: "Example: 4.250 > 4.205" },
      );
    }
    return mc(
      "5.2B",
      `Which comparison is true?`,
      correct,
      wrong,
      `Compare tenths, then hundredths, then thousandths. ${correct}.`,
    );
  }

  let nums = [make(), make(), make()];
  const uniq = new Set(nums.map((n) => n.toFixed(3)));
  if (uniq.size < 3) return gen52B();
  const greatest = pick([true, false]);
  const sorted = [...nums].sort((a, b) => (greatest ? b - a : a - b));
  const labels = sorted.map((n) => n.toFixed(3));
  const correct = labels.join(", ");
  const wrong = [
    [...labels].reverse().join(", "),
    shuffle(labels).join(", "),
    [labels[1], labels[0], labels[2]].join(", "),
  ];
  return mc(
    "5.2B",
    `Order these decimals from ${greatest ? "greatest to least" : "least to greatest"}: ${nums.map((n) => n.toFixed(3)).join(", ")}.`,
    correct,
    wrong,
    `Compare place by place, starting at the tenths. ${greatest ? "Greatest to least" : "Least to greatest"} is ${correct}.`,
  );
}

function gen52C(): Question {
  const thousandths = randInt(101, 9899);
  const n = thousandths / 1000;
  const text = n.toFixed(3);
  const toTenths = pick([true, false]);
  const places = toTenths ? 1 : 2;
  const rounded = Number(n.toFixed(places));
  const correct = rounded.toFixed(places);
  const lookDigit = toTenths
    ? Math.floor(thousandths / 10) % 10
    : thousandths % 10;
  const wrong = [
    n.toFixed(3),
    n.toFixed(2),
    n.toFixed(1),
    (Math.floor(n * (10 ** places)) / 10 ** places).toFixed(places),
    (Math.ceil(n * (10 ** places)) / 10 ** places).toFixed(places),
  ];
  const name = pickName();
  const stem = pick([
    `Round ${text} to the nearest ${toTenths ? "tenth" : "hundredth"}.`,
    `${name} measured ${text} meters. What is that length rounded to the nearest ${toTenths ? "tenth" : "hundredth"}?`,
  ]);
  const explanation = `Look at the digit to the right of the ${toTenths ? "tenths" : "hundredths"} place. That digit is ${lookDigit}, so we ${lookDigit >= 5 ? "round up" : "leave it"} to get ${correct}.`;
  if (maybeInput()) {
    return input("5.2C", stem, correct, explanation, {
      accept: [String(rounded), correct],
      hint: toTenths ? "Example: 4.7" : "Example: 4.72",
    });
  }
  return mc("5.2C", stem, correct, wrong, explanation);
}

export const generators52: Record<string, () => Question> = {
  "5.2A": gen52A,
  "5.2B": gen52B,
  "5.2C": gen52C,
};
