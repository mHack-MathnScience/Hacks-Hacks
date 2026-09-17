const VULGAR: Record<string, string> = {
  "1/2": "½",
  "1/3": "⅓",
  "2/3": "⅔",
  "1/4": "¼",
  "3/4": "¾",
  "1/5": "⅕",
  "2/5": "⅖",
  "3/5": "⅗",
  "4/5": "⅘",
  "1/6": "⅙",
  "5/6": "⅚",
  "1/8": "⅛",
  "3/8": "⅜",
  "5/8": "⅝",
  "7/8": "⅞",
};

const UNVULGAR: Record<string, string> = Object.fromEntries(
  Object.entries(VULGAR).map(([k, v]) => [v, k]),
);

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a || 1;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export function simplify(n: number, d: number): { n: number; d: number } {
  if (d === 0) throw new Error("division by zero");
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

function formatSimple(n: number, d: number): string {
  return VULGAR[`${n}/${d}`] ?? `${n}/${d}`;
}

export function formatFrac(n: number, d: number, mixed = true): string {
  const s = simplify(n, d);
  n = s.n;
  d = s.d;
  if (d === 1) return String(n);
  const sign = n < 0 ? "-" : "";
  n = Math.abs(n);
  if (mixed && n > d) {
    const w = Math.floor(n / d);
    const r = n % d;
    if (r === 0) return sign + String(w);
    return `${sign}${w} ${formatSimple(r, d)}`;
  }
  return sign + formatSimple(n, d);
}

export function formatFracAscii(n: number, d: number, mixed = true): string {
  const s = simplify(n, d);
  n = s.n;
  d = s.d;
  if (d === 1) return String(n);
  const sign = n < 0 ? "-" : "";
  n = Math.abs(n);
  if (mixed && n > d) {
    const w = Math.floor(n / d);
    const r = n % d;
    if (r === 0) return sign + String(w);
    return `${sign}${w} ${r}/${d}`;
  }
  return `${sign}${n}/${d}`;
}

export function stripVulgar(text: string): string {
  let out = text;
  for (const [glyph, ascii] of Object.entries(UNVULGAR)) {
    out = out.split(glyph).join(ascii);
  }
  return out;
}

export type ParsedFrac = { n: number; d: number };

export function parseFrac(raw: string): ParsedFrac | null {
  let s = stripVulgar(raw).trim().replace(/,/g, "");
  s = s.replace(/\$/g, "").replace(/\s+/g, " ");
  if (!s) return null;

  const mixed = s.match(/^(-)?(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const sign = mixed[1] ? -1 : 1;
    const w = Number(mixed[2]);
    const n = Number(mixed[3]);
    const d = Number(mixed[4]);
    if (!d) return null;
    return simplify(sign * (w * d + n), d);
  }

  const frac = s.match(/^(-)?(\d+)\s*\/\s*(\d+)$/);
  if (frac) {
    const sign = frac[1] ? -1 : 1;
    return simplify(sign * Number(frac[2]), Number(frac[3]));
  }

  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const num = Number(s);
    if (!Number.isFinite(num)) return null;
    if (Number.isInteger(num)) return { n: num, d: 1 };
    const places = (s.split(".")[1] ?? "").length;
    const den = 10 ** places;
    return simplify(Math.round(num * den), den);
  }

  return null;
}

export function fracsEqual(a: string, b: string): boolean {
  const pa = parseFrac(a);
  const pb = parseFrac(b);
  if (pa && pb) return pa.n * pb.d === pb.n * pa.d;
  return stripVulgar(a).trim() === stripVulgar(b).trim();
}
