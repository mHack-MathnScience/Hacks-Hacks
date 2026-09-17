export function randInt(min: number, max: number): number {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

export function pick<T>(items: readonly T[]): T {
  if (items.length === 0) throw new Error("pick() from empty list");
  return items[Math.floor(Math.random() * items.length)]!;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

export function takeDistinct<T>(items: readonly T[], n: number, equals?: (a: T, b: T) => boolean): T[] {
  const out: T[] = [];
  for (const item of shuffle(items)) {
    const dup = equals ? out.some((x) => equals(x, item)) : out.includes(item);
    if (!dup) {
      out.push(item);
      if (out.length === n) break;
    }
  }
  return out;
}

export const NAMES = [
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
] as const;

export const PLACES = ["Austin", "El Paso", "Lubbock", "Waco", "Denton", "McAllen", "Amarillo", "Tyler"] as const;
