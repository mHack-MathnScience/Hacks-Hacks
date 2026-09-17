import { pick, shuffle, uid } from "@/lib/math/rng";
import type { Question, Visual } from "./types";

const LETTERS = ["A", "B", "C", "D"] as const;

export function mc(
  teks: string,
  stem: string,
  correct: string,
  wrong: string[],
  explanation: string,
  extra?: { visual?: Visual; expression?: string },
): Question {
  const seen = new Set([correct]);
  const distractors: string[] = [];
  for (const w of shuffle(wrong)) {
    if (!w || seen.has(w)) continue;
    seen.add(w);
    distractors.push(w);
    if (distractors.length === 3) break;
  }

  if (distractors.length === 0) {
    return input(teks, stem, correct, explanation, extra);
  }

  const options = shuffle([correct, ...distractors]);
  const choices = options.map((text, i) => ({ id: LETTERS[i]!, text }));
  const correctId = choices.find((c) => c.text === correct)!.id;

  return {
    id: uid(),
    teks,
    stem,
    kind: "mc",
    choices,
    correct: correctId,
    explanation,
    visual: extra?.visual,
    expression: extra?.expression,
  };
}

export function input(
  teks: string,
  stem: string,
  correct: string,
  explanation: string,
  extra?: { visual?: Visual; expression?: string; accept?: string[]; hint?: string },
): Question {
  return {
    id: uid(),
    teks,
    stem,
    kind: "input",
    correct,
    accept: extra?.accept,
    inputHint: extra?.hint ?? "Type your answer.",
    explanation,
    visual: extra?.visual,
    expression: extra?.expression,
  };
}

export function maybeInput(): boolean {
  return Math.random() < 0.35;
}

export function fmtDec(n: number, places?: number): string {
  if (places !== undefined) {
    const s = n.toFixed(places);
    return s;
  }
  const rounded = Math.round(n * 1000) / 1000;
  const asStr = String(rounded);
  if (!asStr.includes(".")) return asStr;
  return asStr.replace(/\.?0+$/, "");
}

export function money(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function moneyLabel(cents: number): string {
  return `$${money(cents)}`;
}

export function roundTo(n: number, places: number): number {
  const s = 10 ** places;
  return Math.round(n * s) / s;
}

export function nearbyInts(n: number, extras: number[] = []): number[] {
  const set = new Set<number>();
  for (const d of [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50, 100, ...extras]) {
    if (n - d > 0) set.add(n - d);
    set.add(n + d);
  }
  if (n > 1) set.add(n * 2);
  if (n % 2 === 0) set.add(n / 2);
  set.delete(n);
  return [...set];
}

export function pickName(): string {
  return pick([
    "Ava",
    "Mateo",
    "Priya",
    "Jordan",
    "Luis",
    "Harper",
    "Mei",
    "Caleb",
    "Amira",
    "Noah",
    "Sofia",
    "Eli",
    "Nia",
    "Diego",
    "Quinn",
  ]);
}
