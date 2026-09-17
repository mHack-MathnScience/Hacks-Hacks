import type { ReactNode } from "react";
import type { Visual } from "@/lib/teks/types";
import { cn } from "@/lib/utils";

export function QuestionVisual({ visual }: { visual: Visual }) {
  switch (visual.kind) {
    case "grid10":
      return <Grid10 cols={visual.cols} rows={visual.rows} />;
    case "tenth-bar":
      return <TenthBar totalTenths={visual.totalTenths} groupTenths={visual.groupTenths} />;
    case "fraction-bars":
      return <FractionBars bars={visual.bars} />;
    case "number-line":
      return <NumberLine visual={visual} />;
    case "prism":
      return <Prism l={visual.l} w={visual.w} h={visual.h} />;
    case "cubes":
      return <Cubes l={visual.l} w={visual.w} h={visual.h} />;
    case "coordinate":
      return <Coordinate visual={visual} />;
    case "bar":
      return <BarChart visual={visual} />;
    case "dots":
      return <DotPlot visual={visual} />;
    case "stemleaf":
      return <StemLeaf visual={visual} />;
    case "scatter":
      return <Scatter visual={visual} />;
    case "table":
      return <DataTable visual={visual} />;
    case "shape":
      return <Shape figure={visual.figure} />;
    default:
      return null;
  }
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-line bg-paper/60 p-3 sm:p-4", className)}>
      {children}
    </div>
  );
}

function Grid10({ cols, rows }: { cols: number; rows: number }) {
  const cells = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const inCol = c < cols;
      const inRow = r < rows;
      const overlap = inCol && inRow;
      cells.push(
        <div
          key={`${r}-${c}`}
          className={cn(
            "aspect-square border border-line",
            overlap ? "bg-forest/55" : inCol ? "bg-forest/20" : inRow ? "bg-ink/10" : "bg-surface",
          )}
        />,
      );
    }
  }
  return (
    <Panel>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">10-by-10 hundredths grid</p>
      <div className="mx-auto grid max-w-64 grid-cols-10 overflow-hidden rounded-sm border border-line-strong">
        {cells}
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        {cols} tenths × {rows} tenths
      </p>
    </Panel>
  );
}

function TenthBar({ totalTenths, groupTenths }: { totalTenths: number; groupTenths: number }) {
  const cells = Array.from({ length: totalTenths }, (_, i) => {
    const group = Math.floor(i / groupTenths);
    return (
      <div
        key={i}
        className={cn(
          "h-10 flex-1 border-r border-line last:border-r-0",
          group % 2 === 0 ? "bg-forest/35" : "bg-forest/15",
        )}
      />
    );
  });
  return (
    <Panel>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Decimal bar (tenths)</p>
      <div className="flex overflow-hidden rounded-sm border border-line-strong">{cells}</div>
      <p className="mt-2 text-center text-xs text-muted">
        {(totalTenths / 10).toFixed(1)} grouped by {(groupTenths / 10).toFixed(1)}
      </p>
    </Panel>
  );
}

function FractionBars({ bars }: { bars: Array<{ label: string; num: number; den: number }> }) {
  return (
    <Panel className="space-y-3">
      {bars.map((b) => (
        <div key={`${b.label}-${b.den}`}>
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>{b.label}</span>
            <span>
              {b.num}/{b.den}
            </span>
          </div>
          <div className="flex h-7 overflow-hidden rounded-sm border border-line-strong">
            {Array.from({ length: b.den }, (_, i) => (
              <div
                key={i}
                className={cn("h-full flex-1 border-r border-line last:border-r-0", i < b.num ? "bg-forest/45" : "bg-surface")}
              />
            ))}
          </div>
        </div>
      ))}
    </Panel>
  );
}

function NumberLine({ visual }: { visual: Extract<Visual, { kind: "number-line" }> }) {
  const ticks: number[] = [];
  for (let t = visual.min; t <= visual.max + 1e-9; t += visual.tick) ticks.push(Number(t.toFixed(3)));
  const pct = ((visual.mark - visual.min) / (visual.max - visual.min)) * 100;
  return (
    <Panel>
      <div className="relative mx-2 mt-6 mb-2 h-12">
        <div className="absolute top-6 right-0 left-0 h-px bg-ink" />
        {ticks.map((t) => {
          const p = ((t - visual.min) / (visual.max - visual.min)) * 100;
          return (
            <div key={t} className="absolute top-5" style={{ left: `${p}%` }}>
              <div className="h-3 w-px bg-ink" />
              <div className="-translate-x-1/2 pt-1 font-mono text-[10px] text-muted">{t}</div>
            </div>
          );
        })}
        <div className="absolute top-0" style={{ left: `${pct}%` }}>
          <div className="-translate-x-1/2 text-xs font-medium text-forest">{visual.label}</div>
          <div className="mx-auto mt-0.5 size-2.5 rounded-full bg-forest" />
        </div>
      </div>
    </Panel>
  );
}

function Prism({ l, w, h }: { l: number; w: number; h: number }) {
  return (
    <Panel className="flex flex-col items-center">
      <svg viewBox="0 0 220 160" className="h-36 w-full max-w-xs text-ink" aria-hidden>
        <polygon points="70,30 160,30 190,55 160,90 70,90 100,55" fill="var(--color-surface)" stroke="currentColor" strokeWidth="1.4" />
        <polygon points="160,30 190,55 190,115 160,90" fill="var(--color-forest-soft)" stroke="currentColor" strokeWidth="1.4" />
        <polygon points="70,90 160,90 190,115 100,115" fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.4" />
        <polygon points="70,30 160,30 160,90 70,90" fill="var(--color-surface)" stroke="currentColor" strokeWidth="1.4" />
        <text x="115" y="64" textAnchor="middle" fontSize="12" fill="currentColor">
          {l}
        </text>
        <text x="178" y="80" textAnchor="middle" fontSize="12" fill="currentColor">
          {w}
        </text>
        <text x="52" y="66" textAnchor="middle" fontSize="12" fill="currentColor">
          {h}
        </text>
      </svg>
      <p className="text-xs text-muted">
        {l} × {w} × {h}
      </p>
    </Panel>
  );
}

function Cubes({ l, w, h }: { l: number; w: number; h: number }) {
  const showGrid = l * w <= 24 && h <= 6;
  return (
    <Panel>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        {h} layers of {l} × {w}
      </p>
      {showGrid ? (
        <div className="flex flex-col items-center gap-1">
          {Array.from({ length: Math.min(h, 5) }, (_, layer) => (
            <div key={layer} className="grid gap-px" style={{ gridTemplateColumns: `repeat(${l}, 1.1rem)` }}>
              {Array.from({ length: l * w }, (_, i) => (
                <div key={i} className="size-[1.1rem] rounded-[2px] border border-forest/40 bg-forest/25" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="font-display text-2xl text-forest">
          {l} × {w} × {h}
        </p>
      )}
      <p className="mt-2 text-center text-xs text-muted">
        {l * w} unit cubes in each layer × {h} layers
      </p>
    </Panel>
  );
}

function Coordinate({ visual }: { visual: Extract<Visual, { kind: "coordinate" }> }) {
  const size = 10;
  const pad = 28;
  const box = 240;
  const inner = box - pad * 1.2;
  const scale = inner / size;
  const toX = (x: number) => pad + x * scale;
  const toY = (y: number) => box - pad - y * scale;
  return (
    <Panel className="flex justify-center">
      <svg viewBox={`0 0 ${box} ${box}`} className="h-56 w-56 text-ink" role="img" aria-label="Coordinate plane">
        {Array.from({ length: size + 1 }, (_, i) => (
          <g key={i}>
            <line x1={toX(i)} y1={toY(0)} x2={toX(i)} y2={toY(size)} stroke="currentColor" strokeOpacity="0.12" />
            <line x1={toX(0)} y1={toY(i)} x2={toX(size)} y2={toY(i)} stroke="currentColor" strokeOpacity="0.12" />
            {i > 0 && (
              <>
                <text x={toX(i)} y={toY(0) + 14} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.55">
                  {i}
                </text>
                <text x={toX(0) - 10} y={toY(i) + 3} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.55">
                  {i}
                </text>
              </>
            )}
          </g>
        ))}
        <line x1={toX(0)} y1={toY(0)} x2={toX(size)} y2={toY(0)} stroke="currentColor" strokeWidth="1.5" />
        <line x1={toX(0)} y1={toY(0)} x2={toX(0)} y2={toY(size)} stroke="currentColor" strokeWidth="1.5" />
        <text x={toX(size) + 8} y={toY(0) + 4} fontSize="11" fill="currentColor">
          x
        </text>
        <text x={toX(0) - 4} y={toY(size) - 8} fontSize="11" fill="currentColor" textAnchor="middle">
          y
        </text>
        {visual.points.map((p) => (
          <g key={`${p.x}-${p.y}`}>
            <circle cx={toX(p.x)} cy={toY(p.y)} r={5} fill="var(--color-forest)" />
            {p.label && (
              <text x={toX(p.x) + 8} y={toY(p.y) - 8} fontSize="11" fill="currentColor">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </Panel>
  );
}

function BarChart({ visual }: { visual: Extract<Visual, { kind: "bar" }> }) {
  const max = Math.max(...visual.bars.map((b) => b.value), 1);
  const yMax = Math.ceil(max / 5) * 5 || 5;
  return (
    <Panel>
      <p className="mb-3 font-display text-sm">{visual.title}</p>
      <div className="space-y-2">
        {visual.bars.map((b) => (
          <div key={b.label} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-2">
            <div className="truncate text-xs text-ink-soft capitalize">{b.label}</div>
            <div className="h-4 rounded-sm bg-paper">
              <div className="h-4 rounded-sm bg-forest/70" style={{ width: `${(b.value / yMax) * 100}%` }} />
            </div>
            <div className="text-right font-mono text-xs tabular-nums">{b.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">{visual.unit}</p>
    </Panel>
  );
}

function DotPlot({ visual }: { visual: Extract<Visual, { kind: "dots" }> }) {
  const min = Math.min(...visual.values, 0);
  const max = Math.max(...visual.values, 1);
  const lo = Math.min(min, 0);
  const hi = max;
  const counts = new Map<number, number>();
  for (const v of visual.values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const ticks = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  return (
    <Panel>
      <p className="mb-2 font-display text-sm">{visual.title}</p>
      <div className="flex items-end gap-1 overflow-x-auto pb-1">
        {ticks.map((t) => {
          const n = counts.get(t) ?? 0;
          return (
            <div key={t} className="flex min-w-7 flex-1 flex-col items-center justify-end">
              <div className="flex flex-col-reverse gap-0.5 pb-1">
                {Array.from({ length: n }, (_, i) => (
                  <div key={i} className="size-2.5 rounded-full bg-forest" />
                ))}
              </div>
              <div className="h-px w-full bg-ink/30" />
              <div className="pt-1 font-mono text-[10px] text-muted">{t}</div>
            </div>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-muted">{visual.unit}</p>
    </Panel>
  );
}

function StemLeaf({ visual }: { visual: Extract<Visual, { kind: "stemleaf" }> }) {
  const map = new Map<number, number[]>();
  for (const n of visual.data) {
    const stem = Math.floor(n / 10);
    const leaf = n % 10;
    const arr = map.get(stem) ?? [];
    arr.push(leaf);
    map.set(stem, arr);
  }
  const stems = [...map.keys()].sort((a, b) => a - b);
  return (
    <Panel>
      <p className="mb-2 font-display text-sm">{visual.title}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="pr-4 font-medium">Stem</th>
            <th className="font-medium">Leaf</th>
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums">
          {stems.map((s) => (
            <tr key={s} className="border-t border-line">
              <td className="py-1 pr-4">{s}</td>
              <td className="py-1">{(map.get(s) ?? []).sort((a, b) => a - b).join(" ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted">Key: 2 | 4 means 24 {visual.unit}</p>
    </Panel>
  );
}

function Scatter({ visual }: { visual: Extract<Visual, { kind: "scatter" }> }) {
  const box = 240;
  const pad = 28;
  const inner = box - pad * 1.4;
  const toX = (x: number) => pad + (x / 10) * inner;
  const toY = (y: number) => box - pad - (y / 10) * inner;
  return (
    <Panel className="flex flex-col items-center">
      <p className="mb-1 self-start font-display text-sm">{visual.title}</p>
      <svg viewBox={`0 0 ${box} ${box}`} className="h-52 w-52 text-ink" role="img" aria-label="Scatterplot">
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <line x1={toX(i)} y1={toY(0)} x2={toX(i)} y2={toY(10)} stroke="currentColor" strokeOpacity="0.1" />
            <line x1={toX(0)} y1={toY(i)} x2={toX(10)} y2={toY(i)} stroke="currentColor" strokeOpacity="0.1" />
          </g>
        ))}
        <line x1={toX(0)} y1={toY(0)} x2={toX(10)} y2={toY(0)} stroke="currentColor" />
        <line x1={toX(0)} y1={toY(0)} x2={toX(0)} y2={toY(10)} stroke="currentColor" />
        {visual.points.map((p, i) => (
          <circle key={i} cx={toX(p.x)} cy={toY(p.y)} r={4} fill="var(--color-forest)" fillOpacity="0.85" />
        ))}
        <text x={box / 2} y={box - 6} textAnchor="middle" fontSize="10" fill="currentColor">
          {visual.xLabel}
        </text>
        <text x={12} y={16} fontSize="10" fill="currentColor">
          {visual.yLabel}
        </text>
      </svg>
    </Panel>
  );
}

function DataTable({ visual }: { visual: Extract<Visual, { kind: "table" }> }) {
  return (
    <Panel>
      {visual.caption && <p className="mb-2 font-display text-sm">{visual.caption}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {visual.headers.map((h) => (
                <th key={h} className="border-b border-line px-2 py-1.5 text-left text-xs font-medium text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visual.rows.map((row, i) => (
              <tr key={i} className="border-b border-line/70">
                {row.map((cell, j) => (
                  <td key={j} className="px-2 py-1.5 font-mono tabular-nums">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Shape({ figure }: { figure: string }) {
  const common = { fill: "var(--color-forest-soft)", stroke: "var(--color-forest)", strokeWidth: 2 };
  return (
    <Panel className="flex flex-col items-center">
      <svg viewBox="0 0 120 90" className="h-24 w-32" aria-hidden>
        {figure === "square" && <rect x="30" y="15" width="60" height="60" {...common} />}
        {figure === "rectangle" && <rect x="18" y="28" width="84" height="40" {...common} />}
        {figure === "rhombus" && <polygon points="60,12 108,45 60,78 12,45" {...common} />}
        {figure === "parallelogram" && <polygon points="28,22 108,22 92,72 12,72" {...common} />}
        {figure === "trapezoid" && <polygon points="32,24 88,24 108,72 12,72" {...common} />}
        {figure === "isosceles" && <polygon points="60,14 104,76 16,76" {...common} />}
        {!["square", "rectangle", "rhombus", "parallelogram", "trapezoid", "isosceles"].includes(figure) && (
          <polygon points="60,14 104,76 16,76" {...common} />
        )}
      </svg>
      <p className="text-xs capitalize text-muted">{figure}</p>
    </Panel>
  );
}
