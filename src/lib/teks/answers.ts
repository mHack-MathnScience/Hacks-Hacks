import { fracsEqual, parseFrac, stripVulgar } from "@/lib/math/fractions";

function normalizeText(raw: string): string {
  return stripVulgar(raw)
    .trim()
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .replace(/×/g, "x")
    .replace(/·/g, "x")
    .replace(/÷/g, "/")
    .toLowerCase();
}

export function answersMatch(given: string, correct: string, accept: string[] = []): boolean {
  const candidates = [correct, ...accept];
  const g = given.trim();
  if (!g) return false;

  for (const c of candidates) {
    if (normalizeText(g) === normalizeText(c)) return true;
    if (fracsEqual(g, c)) return true;

    const pg = parseFrac(g);
    const pc = parseFrac(c);
    if (pg && pc && pg.n * pc.d === pc.n * pg.d) return true;

    const ng = Number(normalizeText(g));
    const nc = Number(normalizeText(c));
    if (Number.isFinite(ng) && Number.isFinite(nc) && Math.abs(ng - nc) < 1e-8) return true;
  }

  return false;
}

export function choiceIsCorrect(question: { kind: string; correct: string }, choiceId: string): boolean {
  return question.correct === choiceId;
}
