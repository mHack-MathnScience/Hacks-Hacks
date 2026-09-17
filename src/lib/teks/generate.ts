import { pick } from "@/lib/math/rng";
import { poolForKey } from "./catalog";
import { generators52 } from "./gen-5-2";
import { generators53 } from "./gen-5-3";
import { generators54 } from "./gen-5-4";
import { generatorsData } from "./gen-5-data";
import { generatorsGeo } from "./gen-5-geo";
import { mc } from "./build";
import type { Question } from "./types";

const generators: Record<string, () => Question> = {
  ...generators52,
  ...generators53,
  ...generators54,
  ...generatorsGeo,
  ...generatorsData,
};

function fallback(teks: string): Question {
  return mc(
    teks,
    "This station is warming up a fresh question. Try another item.",
    "Continue",
    ["Stop", "Skip the TEKS", "Leave"],
    "New questions generate each time you practice.",
  );
}

export function generateQuestion(poolKey: string): Question {
  const pool = poolForKey(poolKey);
  const teks = pool.length ? pick(pool) : poolKey;
  const gen = generators[teks];
  if (!gen) return fallback(teks);

  for (let i = 0; i < 10; i++) {
    try {
      const q = gen();
      if (q.kind === "mc") {
        const choices = q.choices ?? [];
        const ids = new Set(choices.map((c) => c.id));
        const texts = new Set(choices.map((c) => c.text));
        if (choices.length < 2 || texts.size !== choices.length) continue;
        if (!ids.has(q.correct)) continue;
      } else if (!q.correct) {
        continue;
      }
      return q;
    } catch {
      // regenerate
    }
  }
  return fallback(teks);
}

export function generateSet(poolKey: string, n: number): Question[] {
  const out: Question[] = [];
  const stems = new Set<string>();
  let guard = 0;
  while (out.length < n && guard++ < n * 12) {
    const q = generateQuestion(poolKey);
    const key = q.expression ? `${q.teks}:${q.expression}` : `${q.teks}:${q.stem}`;
    if (stems.has(key)) continue;
    stems.add(key);
    out.push(q);
  }
  while (out.length < n) out.push(generateQuestion(poolKey));
  return out;
}

export { generators };
