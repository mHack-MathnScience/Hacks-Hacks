import { useMemo, useState } from "react";
import { Stage } from "@/components/science/lab-frame";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COLS = 6;
const ROWS = 4;
const N = COLS * ROWS;

type PartId = "battery" | "wire" | "corner" | "switch" | "light" | "fan" | "buzzer";
type Dir = "n" | "e" | "s" | "w";
type Tool = PartId | "remove" | null;

type Cell = { part: PartId; rot: 0 | 1 | 2 | 3; closed: boolean };

const PARTS: Array<{ id: PartId; label: string }> = [
  { id: "battery", label: "Battery" },
  { id: "wire", label: "Wire" },
  { id: "corner", label: "Corner" },
  { id: "switch", label: "Switch" },
  { id: "light", label: "Light" },
  { id: "fan", label: "Fan" },
  { id: "buzzer", label: "Buzzer" },
];

const DIRS: Dir[] = ["n", "e", "s", "w"];

function opposite(d: Dir): Dir {
  if (d === "n") return "s";
  if (d === "s") return "n";
  if (d === "e") return "w";
  return "e";
}

function step(r: number, c: number, d: Dir) {
  if (d === "n") return { r: r - 1, c };
  if (d === "s") return { r: r + 1, c };
  if (d === "w") return { r, c: c - 1 };
  return { r, c: c + 1 };
}

function idx(r: number, c: number) {
  return r * COLS + c;
}

function portsOf(cell: Cell): Dir[] {
  if (cell.part === "corner") {
    const seq: Dir[][] = [
      ["n", "e"],
      ["e", "s"],
      ["s", "w"],
      ["w", "n"],
    ];
    return seq[cell.rot];
  }
  return cell.rot % 2 === 0 ? ["w", "e"] : ["n", "s"];
}

function conducts(cell: Cell | null): cell is Cell {
  if (!cell) return false;
  if (cell.part === "switch") return cell.closed;
  return true;
}

function neighborThrough(grid: Array<Cell | null>, r: number, c: number, d: Dir) {
  const cell = grid[idx(r, c)];
  if (!conducts(cell) || !portsOf(cell).includes(d)) return null;
  const n = step(r, c, d);
  if (n.r < 0 || n.r >= ROWS || n.c < 0 || n.c >= COLS) return null;
  const other = grid[idx(n.r, n.c)];
  if (!conducts(other) || !portsOf(other).includes(opposite(d))) return null;
  return n;
}

function analyze(grid: Array<Cell | null>) {
  const batteries: number[] = [];
  const loads: number[] = [];
  for (let i = 0; i < grid.length; i++) {
    const p = grid[i]?.part;
    if (p === "battery") batteries.push(i);
    if (p === "light" || p === "fan" || p === "buzzer") loads.push(i);
  }
  if (!batteries.length) {
    return { powered: new Set<number>(), status: "Add a battery — that is the source." };
  }
  const b = batteries[0];
  const br = Math.floor(b / COLS);
  const bc = b % COLS;
  const bcell = grid[b]!;
  const terms: number[] = [];
  for (const d of portsOf(bcell)) {
    const n = neighborThrough(grid, br, bc, d);
    if (n) terms.push(idx(n.r, n.c));
  }
  if (terms.length < 2) {
    return { powered: new Set<number>(), status: "Both ends of the battery need to touch a path." };
  }

  const adj = new Map<number, number[]>();
  const add = (a: number, b2: number) => {
    const list = adj.get(a) ?? [];
    list.push(b2);
    adj.set(a, list);
  };
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = idx(r, c);
      const cell = grid[i];
      if (!conducts(cell) || cell.part === "battery") continue;
      for (const d of DIRS) {
        const n = neighborThrough(grid, r, c, d);
        if (!n) continue;
        const j = idx(n.r, n.c);
        if (grid[j]?.part === "battery") continue;
        add(i, j);
      }
    }
  }

  const seen = new Set<number>();
  const stack = [terms[0]];
  while (stack.length) {
    const i = stack.pop()!;
    if (seen.has(i)) continue;
    seen.add(i);
    for (const j of adj.get(i) ?? []) stack.push(j);
  }
  if (!seen.has(terms[1])) {
    return {
      powered: new Set<number>(),
      status: "Open path. Rotate wires so they touch, or close the switch.",
    };
  }
  const powered = new Set<number>();
  for (const li of loads) {
    if (seen.has(li)) powered.add(li);
  }
  if (!powered.size) {
    return { powered, status: "The path is closed, but there is no load on it. Add a light, fan, or buzzer." };
  }
  const names = [...powered].map((i) => grid[i]!.part);
  const bits: string[] = [];
  if (names.includes("light")) bits.push("the light is on");
  if (names.includes("fan")) bits.push("the fan is spinning");
  if (names.includes("buzzer")) bits.push("the buzzer sounds");
  return { powered, status: `Complete path — ${bits.join(", ")}.` };
}

function CellGlyph({ cell, on }: { cell: Cell; on: boolean }) {
  const stroke = "var(--color-ink)";
  const live = on ? "var(--color-forest)" : "var(--color-line-strong)";
  const rot = cell.part === "corner" ? cell.rot * 90 : (cell.rot % 2) * 90;
  return (
    <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden>
      {cell.part === "battery" ? (
        <g transform={`rotate(${rot} 16 16)`}>
          <rect x="6" y="11" width="20" height="10" rx="2" fill="var(--color-forest)" />
          <text x="10" y="19" fontSize="8" fill="var(--color-bg)">
            +
          </text>
          <text x="20" y="19" fontSize="8" fill="var(--color-bg)">
            −
          </text>
        </g>
      ) : null}
      {cell.part === "wire" ? (
        <g transform={`rotate(${rot} 16 16)`}>
          <line x1="2" y1="16" x2="30" y2="16" stroke={live} strokeWidth="3" strokeLinecap="round" />
        </g>
      ) : null}
      {cell.part === "corner" ? (
        <g transform={`rotate(${rot} 16 16)`}>
          <path d="M16 2 V16 H30" fill="none" stroke={live} strokeWidth="3" strokeLinecap="round" />
        </g>
      ) : null}
      {cell.part === "switch" ? (
        <g transform={`rotate(${rot} 16 16)`}>
          <line x1="2" y1="16" x2="12" y2="16" stroke={live} strokeWidth="3" strokeLinecap="round" />
          <line x1="20" y1="16" x2="30" y2="16" stroke={live} strokeWidth="3" strokeLinecap="round" />
          <line
            x1="12"
            y1="16"
            x2="20"
            y2={cell.closed ? 16 : 8}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16" r="1.6" fill={stroke} />
        </g>
      ) : null}
      {cell.part === "light" ? (
        <g transform={`rotate(${rot} 16 16)`}>
          <line x1="2" y1="16" x2="10" y2="16" stroke={live} strokeWidth="3" />
          <line x1="22" y1="16" x2="30" y2="16" stroke={live} strokeWidth="3" />
          <circle cx="16" cy="16" r="7" fill={on ? "var(--color-chalk)" : "var(--color-paper)"} stroke={live} strokeWidth="2" />
          {on ? <circle cx="16" cy="16" r="3" fill="var(--color-forest)" /> : null}
        </g>
      ) : null}
      {cell.part === "fan" ? (
        <g>
          <g transform={`rotate(${rot} 16 16)`}>
            <line x1="2" y1="16" x2="10" y2="16" stroke={live} strokeWidth="3" />
            <line x1="22" y1="16" x2="30" y2="16" stroke={live} strokeWidth="3" />
          </g>
          <g
            className={on ? "fan-spin" : undefined}
            style={{ transformOrigin: "16px 16px" }}
          >
            <circle cx="16" cy="16" r="2.2" fill={live} />
            <path d="M16 16 L16 7 Q20 10 16 16 L25 16 Q22 20 16 16 L16 25 Q12 22 16 16 L7 16 Q10 12 16 16" fill={live} opacity="0.85" />
          </g>
        </g>
      ) : null}
      {cell.part === "buzzer" ? (
        <g>
          <g transform={`rotate(${rot} 16 16)`}>
            <line x1="2" y1="16" x2="10" y2="16" stroke={live} strokeWidth="3" />
            <line x1="22" y1="16" x2="30" y2="16" stroke={live} strokeWidth="3" />
          </g>
          <rect x="11" y="11" width="10" height="10" rx="2" fill={on ? "var(--color-forest)" : "var(--color-paper)"} stroke={live} strokeWidth="1.5" />
          {on ? (
            <path d="M22 12 Q26 16 22 20" fill="none" stroke="var(--color-forest)" strokeWidth="1.5" className="buzzer-ping" />
          ) : null}
        </g>
      ) : null}
    </svg>
  );
}

export function BuildLab() {
  const [grid, setGrid] = useState<Array<Cell | null>>(() => Array(N).fill(null));
  const [tool, setTool] = useState<Tool>("battery");
  const [focus, setFocus] = useState<number | null>(null);
  const [rotated, setRotated] = useState(false);
  const [switchedOff, setSwitchedOff] = useState(false);
  const [switchedOn, setSwitchedOn] = useState(false);
  const result = useMemo(() => analyze(grid), [grid]);

  function place(i: number) {
    setFocus(i);
    const cur = grid[i];
    if (tool === "remove") {
      setGrid((prev) => {
        const next = [...prev];
        next[i] = null;
        return next;
      });
      return;
    }
    if (!cur && tool) {
      setGrid((prev) => {
        const next = [...prev];
        next[i] = { part: tool, rot: 0, closed: true };
        return next;
      });
      return;
    }
    if (cur && tool && tool !== cur.part) {
      setGrid((prev) => {
        const next = [...prev];
        next[i] = { part: tool, rot: 0, closed: true };
        return next;
      });
      return;
    }
    if (cur?.part === "switch") {
      const closed = !cur.closed;
      if (result.powered.size > 0 && !closed) setSwitchedOff(true);
      if (closed) setSwitchedOn(true);
      setGrid((prev) => {
        const next = [...prev];
        const cell = next[i];
        if (cell?.part === "switch") next[i] = { ...cell, closed };
        return next;
      });
      return;
    }
    if (cur && tool === cur.part) {
      setRotated(true);
      setGrid((prev) => {
        const next = [...prev];
        const cell = next[i];
        if (!cell) return prev;
        next[i] = { ...cell, rot: ((cell.rot + 1) % 4) as Cell["rot"] };
        return next;
      });
    }
  }

  function rotateFocus() {
    if (focus == null || !grid[focus]) return;
    setRotated(true);
    setGrid((prev) => {
      const next = [...prev];
      const cell = next[focus];
      if (!cell) return prev;
      next[focus] = { ...cell, rot: ((cell.rot + 1) % 4) as Cell["rot"] };
      return next;
    });
  }

  const hasLight = [...result.powered].some((i) => grid[i]?.part === "light");
  const hasFan = [...result.powered].some((i) => grid[i]?.part === "fan");
  const hasBuzz = [...result.powered].some((i) => grid[i]?.part === "buzzer");
  const hasSwitch = grid.some((c) => c?.part === "switch");

  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        Tap a part, then tap a square. Tap a used square with the same part to rotate it. Tap a switch to open or close
        the path.
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {PARTS.map((p) => (
          <Button key={p.id} size="sm" variant={tool === p.id ? "default" : "secondary"} onClick={() => setTool(p.id)}>
            {p.label}
          </Button>
        ))}
        <Button size="sm" variant={tool === "remove" ? "default" : "secondary"} onClick={() => setTool("remove")}>
          Remove
        </Button>
      </div>
      <Stage>
        <div className="grid grid-cols-6 gap-1 p-2 sm:p-3">
          {grid.map((cell, i) => (
            <button
              key={i}
              type="button"
              aria-label={cell ? `${cell.part}${cell.part === "switch" ? (cell.closed ? " closed" : " open") : ""}` : "empty square"}
              onClick={() => place(i)}
              className={cn(
                "aspect-square rounded-md border bg-surface p-0.5",
                cell ? "border-line-strong" : "border-dashed border-line",
                result.powered.has(i) && "border-forest bg-forest-soft",
              )}
            >
              {cell ? <CellGlyph cell={cell} on={result.powered.has(i)} /> : null}
            </button>
          ))}
        </div>
      </Stage>
      <p className="mt-3 text-sm text-ink-soft">{result.status}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={rotateFocus} disabled={focus == null || !grid[focus ?? -1]}>
          Rotate
        </Button>
        <Button variant="secondary" onClick={() => setGrid(Array(N).fill(null))}>
          Reset
        </Button>
      </div>
      <ul className="mt-5 space-y-1.5 text-sm">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">Challenges</p>
        <Challenge ok={hasLight} text="Connect a battery, wires, and a light so it turns on." />
        <Challenge ok={rotated} text="Rotate a wire or corner to complete a path." />
        <Challenge ok={hasFan} text="Power a fan so it spins." />
        <Challenge ok={hasBuzz} text="Power a buzzer so it makes sound." />
        <Challenge ok={hasSwitch && switchedOff && switchedOn} text="Put a switch in the path. Tap it off, then on." />
      </ul>
    </div>
  );
}

function Challenge({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className="flex gap-2">
      <span className={ok ? "text-good" : "text-faint"} aria-hidden>
        {ok ? "✓" : "○"}
      </span>
      <span className={ok ? "text-ink" : "text-muted"}>{text}</span>
    </li>
  );
}
