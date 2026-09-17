import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BuildLab } from "@/components/science/circuit-lab";
import { ChallengeList, Stage } from "@/components/science/lab-frame";
import { Button } from "@/components/ui/button";
import { useLabStore, type Trial } from "@/lib/science/lab-store";

const EMPTY_TRIALS: Trial[] = [];

export function LabSim({ id }: { id: string }) {
  switch (id) {
    case "equal":
      return <EqualLab />;
    case "ramp":
      return <RampLab />;
    case "rocket":
      return <RocketLab />;
    case "distance":
      return <DistanceLab />;
    case "canyon":
      return <CanyonLab />;
    case "valley":
      return <ValleyLab />;
    case "delta":
      return <DeltaLab />;
    case "dunes":
      return <DunesLab />;
    case "build":
      return <BuildLab />;
    case "lightup":
      return <LightupLab />;
    case "energy":
      return <EnergyLab />;
    case "conduct":
      return <ConductLab />;
    case "story":
      return <StoryLab />;
    case "process":
      return <ProcessLab />;
    case "order":
      return <OrderLab />;
    case "fuels":
      return <FuelsLab />;
    default:
      return null;
  }
}

function EqualLab() {
  const [left, setLeft] = useState(4);
  const [right, setRight] = useState(4);
  const [paused, setPaused] = useState(false);
  const [x, setX] = useState(50);
  const [v, setV] = useState(0);
  const [ch, setCh] = useState({ still: false, accelRight: false, slow: false });
  const leftRef = useRef(left);
  const rightRef = useRef(right);
  const pausedRef = useRef(paused);
  const vRef = useRef(v);
  const xRef = useRef(x);
  leftRef.current = left;
  rightRef.current = right;
  pausedRef.current = paused;
  vRef.current = v;
  xRef.current = x;

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!pausedRef.current) {
        const net = rightRef.current - leftRef.current;
        let nv = vRef.current + net * 18 * dt;
        let nx = xRef.current + nv * dt;
        if (nx < 8) {
          nx = 8;
          nv = 0;
        }
        if (nx > 92) {
          nx = 92;
          nv = 0;
        }
        const prevAbs = Math.abs(vRef.current);
        vRef.current = nv;
        xRef.current = nx;
        setV(nv);
        setX(nx);
        setCh((c) => {
          let still = c.still;
          let accelRight = c.accelRight;
          let slow = c.slow;
          if (net === 0 && leftRef.current >= 7 && Math.abs(nv) < 0.4) still = true;
          if (net > 0 && nv > 12) accelRight = true;
          const movingSign = Math.sign(vRef.current || nv);
          if (prevAbs > 18 && net !== 0 && Math.sign(net) !== movingSign && Math.abs(nv) < prevAbs) {
            slow = true;
          }
          if (still === c.still && accelRight === c.accelRight && slow === c.slow) return c;
          return { still, accelRight, slow };
        });
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  const net = right - left;
  const equal = net === 0;
  const speed = Math.abs(v) / 20;
  const energy = Math.min(100, (v * v) / 8);

  function reset() {
    setX(50);
    setV(0);
    vRef.current = 0;
    xRef.current = 50;
  }

  return (
    <div>
      <Stage>
        <svg viewBox="0 0 400 170" className="h-auto w-full">
          <rect x="0" y="128" width="400" height="42" fill="var(--color-line)" />
          <rect x="0" y="124" width="400" height="6" fill="var(--color-line-strong)" />
          <g transform={`translate(${(x / 100) * 320 + 12} 0)`}>
            <rect x="0" y="86" width="56" height="38" rx="4" fill="var(--color-forest)" />
            <text x="28" y="110" textAnchor="middle" fill="var(--color-bg)" fontSize="11">
              crate
            </text>
            <line x1="0" y1="105" x2={-8 - left * 5} y2="105" stroke="var(--color-bad)" strokeWidth="5" strokeLinecap="round" />
            <polygon points={`${-8 - left * 5},105 ${-left * 5},99 ${-left * 5},111`} fill="var(--color-bad)" />
            <line x1="56" y1="105" x2={64 + right * 5} y2="105" stroke="var(--color-forest)" strokeWidth="5" strokeLinecap="round" />
            <polygon points={`${64 + right * 5},105 ${56 + right * 5},99 ${56 + right * 5},111`} fill="var(--color-forest)" />
          </g>
        </svg>
      </Stage>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Push from the left: {left}
          <input
            type="range"
            min={0}
            max={10}
            value={left}
            onChange={(e) => setLeft(Number(e.target.value))}
            className="mt-1 w-full accent-forest"
          />
        </label>
        <label className="text-sm">
          Push from the right: {right}
          <input
            type="range"
            min={0}
            max={10}
            value={right}
            onChange={(e) => setRight(Number(e.target.value))}
            className="mt-1 w-full accent-forest"
          />
        </label>
      </div>
      <p className="mt-3 text-sm text-ink-soft">
        Net push: {net === 0 ? "0 (equal)" : `${net > 0 ? "right" : "left"} by ${Math.abs(net)}`}. Speed {speed.toFixed(1)}{" "}
        m/s.
      </p>
      <p className="mt-1 text-sm text-ink">
        {equal
          ? "Equal forces. The crate’s motion does not change."
          : "Unequal forces. Energy of motion changes toward the larger push."}
      </p>
      <div className="mt-2">
        <p className="text-xs tracking-wide text-muted uppercase">Energy of motion</p>
        <div className="mt-1 h-3 overflow-hidden rounded-full bg-paper">
          <div className="h-full bg-forest transition-[width] duration-150" style={{ width: `${energy}%` }} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={reset}>
          Reset crate
        </Button>
        <Button variant="secondary" onClick={() => setPaused((p) => !p)}>
          {paused ? "Play" : "Pause"}
        </Button>
      </div>
      <ChallengeList
        items={[
          { ok: ch.still, text: "Keep a still crate still using two strong pushes." },
          { ok: ch.accelRight, text: "Make the crate speed up to the right." },
          { ok: ch.slow, text: "Get the crate moving, then slow it with an opposite force." },
        ]}
      />
    </div>
  );
}

function RampLab() {
  const addTrial = useLabStore((s) => s.addTrial);
  const trials = useLabStore((s) => s.byLab.ramp?.trials) ?? EMPTY_TRIALS;
  const [change, setChange] = useState<"height" | "surface" | "mass">("height");
  const [height, setHeight] = useState(2);
  const [surface, setSurface] = useState<"ice" | "wood" | "carpet" | "sandpaper">("wood");
  const [mass, setMass] = useState<"light" | "medium" | "heavy">("medium");
  const [running, setRunning] = useState(false);
  const [car, setCar] = useState(0);
  const [dist, setDist] = useState<number | null>(null);

  const friction = { ice: 0.18, wood: 0.48, carpet: 0.78, sandpaper: 0.95 }[surface];
  const m = { light: 1, medium: 2, heavy: 3 }[mass];
  const predicted = Math.max(0.2, Math.round(((height * 2.4) / (friction * (0.55 + m * 0.22))) * 10) / 10);

  function run() {
    const d = Math.max(0.2, Math.round((predicted + (Math.random() - 0.5) * 0.4) * 10) / 10);
    setRunning(true);
    setDist(null);
    setCar(0);
    window.setTimeout(() => setCar(1), 40);
    window.setTimeout(() => {
      setDist(d);
      setRunning(false);
      addTrial("ramp", { height, surface, mass, changed: change, m: d });
    }, 850);
  }

  const maxBar = Math.max(1, ...trials.map((t) => Number(t.m) || 0));

  return (
    <div>
      <Stage>
        <svg viewBox="0 0 400 160" className="h-auto w-full">
          <polygon points={`18,138 18,${138 - height * 28} ${90 + height * 22},138`} fill="var(--color-line-strong)" />
          <rect x="18" y="138" width="364" height="8" fill="var(--color-line)" />
          <rect
            x={running || dist != null ? 24 + (dist ? Math.min(300, (dist / 6) * 260) : car * 70) : 24}
            y={dist != null || running ? 126 : 126 - height * 28}
            width="26"
            height="12"
            rx="2"
            fill="var(--color-forest)"
            style={{ transition: "x 0.8s ease-out, y 0.8s ease-out" }}
          />
          {dist != null ? (
            <text x="200" y="36" textAnchor="middle" fill="var(--color-ink)" fontSize="16">
              {dist.toFixed(1)} m past the ramp
            </text>
          ) : null}
        </svg>
      </Stage>
      <p className="mt-3 text-sm text-muted">I will change only one thing. Keep the other two the same. That is a fair test.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          Independent variable
          <select
            className="mt-1 w-full rounded-md border border-line bg-surface px-2 py-2"
            value={change}
            onChange={(e) => setChange(e.target.value as typeof change)}
          >
            <option value="height">Ramp height</option>
            <option value="surface">Floor surface</option>
            <option value="mass">Car mass</option>
          </select>
        </label>
        <label className="text-sm">
          Ramp height
          <select
            className="mt-1 w-full rounded-md border border-line bg-surface px-2 py-2 disabled:opacity-50"
            value={height}
            disabled={change !== "height"}
            onChange={(e) => setHeight(Number(e.target.value))}
          >
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>High</option>
          </select>
        </label>
        <label className="text-sm">
          Floor surface
          <select
            className="mt-1 w-full rounded-md border border-line bg-surface px-2 py-2 disabled:opacity-50"
            value={surface}
            disabled={change !== "surface"}
            onChange={(e) => setSurface(e.target.value as typeof surface)}
          >
            <option value="ice">Ice</option>
            <option value="wood">Wood floor</option>
            <option value="carpet">Carpet</option>
            <option value="sandpaper">Sandpaper</option>
          </select>
        </label>
        <label className="text-sm">
          Car mass
          <select
            className="mt-1 w-full rounded-md border border-line bg-surface px-2 py-2 disabled:opacity-50"
            value={mass}
            disabled={change !== "mass"}
            onChange={(e) => setMass(e.target.value as typeof mass)}
          >
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="heavy">Heavy</option>
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={run} disabled={running}>
          {running ? "Rolling…" : "Release the car"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setDist(null);
            setCar(0);
          }}
        >
          Reset
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted">Dependent variable: distance past the ramp (meters)</p>
      {trials.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="py-1">Trial</th>
                <th>Changed</th>
                <th>Height</th>
                <th>Surface</th>
                <th>Mass</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              {trials.map((t, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="py-1 tabular-nums">{i + 1}</td>
                  <td>{String(t.changed ?? "—")}</td>
                  <td>{String(t.height)}</td>
                  <td>{String(t.surface)}</td>
                  <td>{String(t.mass)}</td>
                  <td className="tabular-nums">{Number(t.m).toFixed(1)} m</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-end gap-1.5">
            {trials.map((t, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full max-w-8 rounded-t-sm bg-forest"
                  style={{ height: `${Math.max(6, (Number(t.m) / maxBar) * 72)}px` }}
                />
                <span className="text-xs text-faint">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">No trials yet. Release the car to record one.</p>
      )}
    </div>
  );
}

function RocketLab() {
  const addTrial = useLabStore((s) => s.addTrial);
  const trials = useLabStore((s) => s.byLab.rocket?.trials) ?? EMPTY_TRIALS;
  const [thrust, setThrust] = useState(6);
  const [cargo, setCargo] = useState(2);
  const [friction, setFriction] = useState(2);
  const [x, setX] = useState(28);
  const dist = Math.max(8, Math.round((thrust * 14) / (0.6 + cargo * 0.35 + friction * 0.4)));

  function launch() {
    setX(28);
    window.setTimeout(() => setX(28 + Math.min(330, dist * 2.2)), 30);
    addTrial("rocket", { thrust, cargo, friction, cm: dist });
  }

  return (
    <div>
      <Stage>
        <svg viewBox="0 0 400 120" className="h-auto w-full">
          <line x1="16" y1="64" x2="384" y2="64" stroke="var(--color-faint)" strokeWidth="3" />
          <g style={{ transform: `translateX(${x - 28}px)`, transition: "transform 0.85s ease-out" }}>
            <ellipse cx="28" cy="64" rx={16 + cargo} ry={12 + cargo * 0.4} fill="var(--color-forest)" />
            <path
              d={`M12 64 Q${0 - thrust} 52 6 64 Q${0 - thrust} 76 12 64`}
              fill="var(--color-bad)"
              opacity="0.7"
            />
          </g>
        </svg>
      </Stage>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          Thrust {thrust}
          <input type="range" min={1} max={10} value={thrust} onChange={(e) => setThrust(Number(e.target.value))} className="mt-1 w-full accent-forest" />
        </label>
        <label className="text-sm">
          Cargo {cargo}
          <input type="range" min={0} max={8} value={cargo} onChange={(e) => setCargo(Number(e.target.value))} className="mt-1 w-full accent-forest" />
        </label>
        <label className="text-sm">
          String friction {friction}
          <input type="range" min={0} max={8} value={friction} onChange={(e) => setFriction(Number(e.target.value))} className="mt-1 w-full accent-forest" />
        </label>
      </div>
      <Button className="mt-3" onClick={launch}>
        Launch
      </Button>
      <p className="mt-2 text-sm text-muted">About {dist} cm. More thrust, less cargo, less friction — a fair test changes only one.</p>
      {trials.length ? (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="py-1">Thrust</th>
              <th>Cargo</th>
              <th>Friction</th>
              <th>cm</th>
            </tr>
          </thead>
          <tbody>
            {trials.map((t, i) => (
              <tr key={i} className="border-t border-line">
                <td className="py-1">{String(t.thrust)}</td>
                <td>{String(t.cargo)}</td>
                <td>{String(t.friction)}</td>
                <td className="tabular-nums">{String(t.cm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}

function DistanceLab() {
  const [place, setPlace] = useState<"earth" | "space">("earth");
  const [mass, setMass] = useState<"both" | "light" | "heavy">("both");
  const [dropped, setDropped] = useState(false);
  const [floor, setFloor] = useState<"ice" | "sandpaper">("ice");
  const [pushed, setPushed] = useState(false);
  const [poles, setPoles] = useState<"same" | "opposite">("opposite");
  const earth = place === "earth";
  const dropY = !dropped ? 28 : earth ? 96 : 28;

  return (
    <div className="grid gap-4">
      <Stage>
        <p className="px-4 pt-3 text-xs tracking-wide text-muted uppercase">Gravity — no touching</p>
        <svg viewBox="0 0 400 130" className="h-auto w-full">
          {earth ? <rect x="0" y="114" width="400" height="16" fill="var(--color-line-strong)" /> : null}
          {(mass === "both" || mass === "light") && (
            <circle cx="150" cy={dropY} r="11" fill="var(--color-forest)" style={{ transition: "cy 0.7s ease-in" }} />
          )}
          {(mass === "both" || mass === "heavy") && (
            <circle cx="250" cy={dropY} r="16" fill="var(--color-forest-deep)" style={{ transition: "cy 0.7s ease-in" }} />
          )}
        </svg>
        <div className="flex flex-wrap gap-2 p-3">
          <Button size="sm" variant={place === "earth" ? "default" : "secondary"} onClick={() => setPlace("earth")}>
            Earth
          </Button>
          <Button size="sm" variant={place === "space" ? "default" : "secondary"} onClick={() => setPlace("space")}>
            Space
          </Button>
          <Button size="sm" variant={mass === "both" ? "default" : "secondary"} onClick={() => setMass("both")}>
            Light + heavy
          </Button>
          <Button size="sm" onClick={() => setDropped((d) => !d)}>
            {dropped ? "Reset drop" : "Drop"}
          </Button>
        </div>
        <p className="px-4 pb-3 text-sm text-muted">
          {earth
            ? dropped
              ? "They land together. Gravity pulls both down — mass does not change the pattern here."
              : "Drop on Earth. Watch the light and heavy balls."
            : "In space the balls stay. Gravity is much weaker far from Earth."}
        </p>
      </Stage>
      <Stage>
        <p className="px-4 pt-3 text-xs tracking-wide text-muted uppercase">Friction — needs a touch</p>
        <svg viewBox="0 0 400 80" className="h-auto w-full">
          <rect x="20" y="52" width="360" height="10" fill={floor === "ice" ? "var(--color-chalk)" : "var(--color-line-strong)"} />
          <rect
            x={pushed ? (floor === "ice" ? 300 : 150) : 40}
            y="38"
            width="28"
            height="14"
            fill="var(--color-forest)"
            style={{ transition: "x 0.8s ease-out" }}
          />
        </svg>
        <div className="flex flex-wrap gap-2 p-3">
          <Button size="sm" variant={floor === "ice" ? "default" : "secondary"} onClick={() => setFloor("ice")}>
            Ice
          </Button>
          <Button size="sm" variant={floor === "sandpaper" ? "default" : "secondary"} onClick={() => setFloor("sandpaper")}>
            Sandpaper
          </Button>
          <Button size="sm" onClick={() => setPushed((p) => !p)}>
            {pushed ? "Reset" : "Push"}
          </Button>
        </div>
      </Stage>
      <Stage>
        <p className="px-4 pt-3 text-xs tracking-wide text-muted uppercase">Magnetism — at a distance</p>
        <svg viewBox="0 0 400 90" className="h-auto w-full">
          <rect x="80" y="32" width="44" height="26" rx="3" fill="var(--color-bad)" />
          <rect
            x={poles === "opposite" ? 168 : 250}
            y="32"
            width="44"
            height="26"
            rx="3"
            fill="var(--color-forest)"
            style={{ transition: "x 0.45s ease" }}
          />
        </svg>
        <div className="flex gap-2 p-3">
          <Button size="sm" variant={poles === "opposite" ? "default" : "secondary"} onClick={() => setPoles("opposite")}>
            Attract
          </Button>
          <Button size="sm" variant={poles === "same" ? "default" : "secondary"} onClick={() => setPoles("same")}>
            Repel
          </Button>
        </div>
      </Stage>
    </div>
  );
}

function CanyonLab() {
  const [speed, setSpeed] = useState(3);
  const [play, setPlay] = useState(0);
  const depth = Math.round(8 + play * speed * 12);
  const usedFast = speed >= 6 && play > 0;
  return (
    <LandPlay
      label={`How fast the water is: ${speed === 1 ? "trickle" : speed >= 6 ? "fast river" : "river"}`}
      value={speed}
      onChange={setSpeed}
      onPlay={() => setPlay((p) => Math.min(8, p + 1))}
      caption={`Water erosion wears land down ${depth} m. Palo Duro Canyon was cut by the Prairie Dog Town Fork of the Red River.`}
    >
      <svg viewBox="0 0 400 170" className="h-auto w-full">
        <rect x="0" y="0" width="400" height="170" fill="var(--color-chalk)" />
        <path d={`M0,24 L200,${26 + Math.min(120, depth * 0.9)} L400,24 L400,170 L0,170 Z`} fill="var(--color-line-strong)" />
        <path
          d={`M188,${26 + Math.min(120, depth * 0.9)} Q200,${34 + Math.min(120, depth * 0.9)} 212,${26 + Math.min(120, depth * 0.9)}`}
          fill="none"
          stroke="var(--color-forest)"
          strokeWidth="5"
        />
        <text x="200" y="18" textAnchor="middle" fill="var(--color-muted)" fontSize="11">
          V-shaped canyon · {depth} m
        </text>
      </svg>
      <ChallengeList
        items={[
          { ok: depth >= 80, text: "Cut a canyon at least 80 m deep." },
          { ok: usedFast, text: "Use fast water — it should carve quicker than a trickle." },
        ]}
      />
    </LandPlay>
  );
}

function ValleyLab() {
  const [step, setStep] = useState(0);
  const u = step >= 1;
  const melted = step >= 2;
  return (
    <div>
      <Stage>
        <svg viewBox="0 0 400 170" className="h-auto w-full">
          <rect x="0" y="0" width="400" height="170" fill="var(--color-chalk)" />
          {u ? (
            <path d="M0,36 L70,36 Q200,150 330,36 L400,36 L400,170 L0,170 Z" fill="var(--color-line-strong)" />
          ) : (
            <path d="M0,36 L200,140 L400,36 L400,170 L0,170 Z" fill="var(--color-line-strong)" />
          )}
          {!melted && step >= 1 ? <ellipse cx="200" cy="96" rx="96" ry="30" fill="var(--color-bg)" opacity="0.9" /> : null}
        </svg>
      </Stage>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setStep(0)}>
          V-valley
        </Button>
        <Button onClick={() => setStep(1)}>Add glacier</Button>
        <Button variant="secondary" onClick={() => setStep(2)}>
          Melt the ice
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted">
        {step === 0
          ? "A river valley starts as a V."
          : step === 1
            ? "Ice scrapes the V into a wide U."
            : "The U can stay after the glacier is gone. The agent may be missing; the shape is the evidence."}
      </p>
    </div>
  );
}

function DeltaLab() {
  const [sediment, setSediment] = useState(4);
  const [play, setPlay] = useState(1);
  const spread = 18 + sediment * play * 7;
  return (
    <LandPlay
      label={`Sediment load ${sediment}`}
      value={sediment}
      onChange={setSediment}
      onPlay={() => setPlay((p) => Math.min(6, p + 1))}
      caption="The river slows at the sea and drops a triangle of new land."
    >
      <svg viewBox="0 0 400 170" className="h-auto w-full">
        <rect x="0" y="0" width="400" height="170" fill="var(--color-chalk)" />
        <rect x="0" y="0" width="176" height="170" fill="var(--color-paper)" />
        <polygon
          points={`176,85 176,${85 - spread / 2} ${176 + spread},${85} 176,${85 + spread / 2}`}
          fill="var(--color-line-strong)"
        />
        <rect x="0" y="81" width="176" height="8" fill="var(--color-forest)" />
      </svg>
    </LandPlay>
  );
}

function DunesLab() {
  const [wind, setWind] = useState(4);
  const [play, setPlay] = useState(0);
  const x = 70 + play * wind * 6;
  return (
    <LandPlay
      label={`Wind ${wind}`}
      value={wind}
      onChange={setWind}
      onPlay={() => setPlay((p) => Math.min(8, p + 1))}
      caption="Wind hops sand up the gentle slope and dumps it on the slip face. Monahans Sandhills."
    >
      <svg viewBox="0 0 400 160" className="h-auto w-full">
        <rect x="0" y="0" width="400" height="160" fill="var(--color-paper)" />
        <rect x="0" y="118" width="400" height="42" fill="var(--color-line)" />
        <polygon points={`${x},118 ${x + 88},118 ${x + 62},72`} fill="var(--color-line-strong)" />
        <line x1="24" y1="40" x2="80" y2="40" stroke="var(--color-muted)" strokeWidth="2" markerEnd="url(#arrow)" />
        <text x="24" y="32" fill="var(--color-muted)" fontSize="11">
          wind
        </text>
      </svg>
    </LandPlay>
  );
}

function LandPlay({
  label,
  value,
  onChange,
  onPlay,
  caption,
  children,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  onPlay: () => void;
  caption: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Stage>{children}</Stage>
      <label className="mt-3 block text-sm">
        {label}
        <input
          type="range"
          min={1}
          max={8}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-1 w-full accent-forest"
        />
      </label>
      <Button className="mt-3" onClick={onPlay}>
        Play time
      </Button>
      <p className="mt-2 text-sm text-muted">{caption}</p>
    </div>
  );
}

function LightupLab() {
  const [closed, setClosed] = useState(false);
  const [broken, setBroken] = useState(false);
  const on = closed && !broken;
  return (
    <div>
      <Stage>
        <svg viewBox="0 0 400 170" className="h-auto w-full">
          <rect x="36" y="72" width="40" height="24" rx="3" fill="var(--color-forest)" />
          <text x="56" y="88" textAnchor="middle" fill="var(--color-bg)" fontSize="9">
            + −
          </text>
          <circle cx="328" cy="84" r="20" fill={on ? "var(--color-chalk)" : "var(--color-line)"} stroke="var(--color-forest)" strokeWidth="3" />
          {on ? <circle cx="328" cy="84" r="8" fill="var(--color-forest)" /> : null}
          <path d="M76 84 H168" stroke="var(--color-ink)" strokeWidth="3" />
          <path d="M228 84 H308" stroke="var(--color-ink)" strokeWidth="3" />
          <path d={broken ? "M36 96 V138 H328 V104" : "M36 96 V138 H328 V84"} stroke="var(--color-ink)" strokeWidth="3" fill="none" />
          <rect x="168" y={closed ? 76 : 62} width="60" height="16" fill="var(--color-bad)" />
          <text x="198" y="48" textAnchor="middle" fill="var(--color-muted)" fontSize="11">
            {closed ? "closed switch" : "open switch"}
          </text>
        </svg>
      </Stage>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => setClosed((c) => !c)}>{closed ? "Open switch" : "Close it"}</Button>
        <Button variant="secondary" onClick={() => setBroken((b) => !b)}>
          {broken ? "Fix the wire" : "Break a wire"}
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted">
        {on ? "Closed path. Electrical energy reaches the load — the bulb lights." : "Open switch or broken wire — no complete path."}
      </p>
    </div>
  );
}

function EnergyLab() {
  const loads = [
    { id: "bulb", label: "Bulb", out: "light" },
    { id: "fan", label: "Fan", out: "motion" },
    { id: "buzzer", label: "Buzzer", out: "sound" },
    { id: "coil", label: "Coil", out: "thermal energy" },
  ] as const;
  const [load, setLoad] = useState<(typeof loads)[number]>(loads[0]);
  const [on, setOn] = useState(true);
  return (
    <div>
      <Stage>
        <svg viewBox="0 0 400 170" className="h-auto w-full">
          <rect x="28" y="72" width="44" height="26" rx="3" fill="var(--color-forest)" />
          <text x="50" y="89" textAnchor="middle" fill="var(--color-bg)" fontSize="9">
            + −
          </text>
          <path d="M72 85 H160" stroke="var(--color-ink)" strokeWidth="3" />
          <rect x="160" y={on ? 78 : 64} width="56" height="14" fill="var(--color-bad)" />
          <path d="M216 85 H268" stroke="var(--color-ink)" strokeWidth="3" />
          <path d="M28 98 V138 H348 V85" stroke="var(--color-ink)" strokeWidth="3" fill="none" />
          {load.id === "bulb" ? (
            <>
              <circle cx="320" cy="85" r="22" fill={on ? "var(--color-chalk)" : "var(--color-line)"} stroke="var(--color-forest)" strokeWidth="3" />
              {on ? <circle cx="320" cy="85" r="8" fill="var(--color-forest)" /> : null}
            </>
          ) : null}
          {load.id === "fan" ? (
            <g transform="translate(320 85)">
              <circle r="8" fill="var(--color-forest)" />
              <g className={on ? "animate-spin" : undefined} style={{ transformOrigin: "0px 0px" }}>
                <rect x="-4" y="-28" width="8" height="20" rx="2" fill="var(--color-ink)" />
                <rect x="-4" y="8" width="8" height="20" rx="2" fill="var(--color-ink)" />
                <rect x="-28" y="-4" width="20" height="8" rx="2" fill="var(--color-ink)" />
                <rect x="8" y="-4" width="20" height="8" rx="2" fill="var(--color-ink)" />
              </g>
            </g>
          ) : null}
          {load.id === "buzzer" ? (
            <g transform="translate(320 85)">
              <rect x="-18" y="-14" width="36" height="28" rx="6" fill="var(--color-forest)" />
              {on ? (
                <>
                  <path d="M22 -10 Q34 0 22 10" fill="none" stroke="var(--color-ink)" strokeWidth="2" />
                  <path d="M30 -16 Q48 0 30 16" fill="none" stroke="var(--color-muted)" strokeWidth="2" />
                </>
              ) : null}
            </g>
          ) : null}
          {load.id === "coil" ? (
            <g transform="translate(320 85)">
              <path d="M-24 0 C-16 -16, -8 16, 0 0 C8 -16, 16 16, 24 0" fill="none" stroke="var(--color-bad)" strokeWidth="4" />
              {on ? (
                <>
                  <path d="M-8 -22 L-4 -30" stroke="var(--color-bad)" strokeWidth="2" />
                  <path d="M4 -22 L8 -32" stroke="var(--color-bad)" strokeWidth="2" />
                  <path d="M14 -18 L20 -28" stroke="var(--color-bad)" strokeWidth="2" />
                </>
              ) : null}
            </g>
          ) : null}
        </svg>
      </Stage>
      <p className="mt-3 font-display text-2xl leading-snug sm:text-3xl">
        chemical → electrical → {on ? load.out : "off"}
      </p>
      <p className="mt-1 text-sm text-muted">Same battery. Swap the load. Open the switch to stop the path.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {loads.map((l) => (
          <Button key={l.id} variant={load.id === l.id ? "default" : "secondary" } onClick={() => setLoad(l)}>
            {l.label}
          </Button>
        ))}
        <Button variant="secondary" onClick={() => setOn((v) => !v)}>
          {on ? "Open switch" : "Close switch"}
        </Button>
      </div>
    </div>
  );
}

function ConductLab() {
  const materials = [
    { id: "foil", label: "Foil", ok: true },
    { id: "penny", label: "Penny", ok: true },
    { id: "lead", label: "Pencil lead", ok: true },
    { id: "rubber", label: "Rubber band", ok: false },
    { id: "wood", label: "Wood", ok: false },
    { id: "yarn", label: "Yarn", ok: false },
  ];
  const [gap, setGap] = useState<(typeof materials)[number] | null>(null);
  const on = gap?.ok === true;
  return (
    <div>
      <Stage>
        <svg viewBox="0 0 400 150" className="h-auto w-full">
          <rect x="28" y="64" width="36" height="22" rx="3" fill="var(--color-forest)" />
          <path d="M64 75 H150" stroke="var(--color-ink)" strokeWidth="3" />
          <path d="M250 75 H330" stroke="var(--color-ink)" strokeWidth="3" />
          <path d="M28 86 V118 H360 V75" stroke="var(--color-ink)" strokeWidth="3" fill="none" />
          <circle cx="348" cy="75" r="16" fill={on ? "var(--color-chalk)" : "var(--color-line)"} stroke="var(--color-forest)" strokeWidth="3" />
          <rect x="158" y="60" width="84" height="30" rx="4" fill={gap ? (on ? "var(--color-forest-soft)" : "var(--color-bad-soft)") : "var(--color-surface)"} stroke="var(--color-line-strong)" />
          <text x="200" y="80" textAnchor="middle" fontSize="11" fill="var(--color-ink)">
            {gap ? gap.label : "gap"}
          </text>
        </svg>
      </Stage>
      <p className="mt-3 font-display text-xl">
        {gap ? (gap.ok ? "Bulb ON — conductor" : "Bulb dark — insulator") : "Tap a material to test it in the gap."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {materials.map((m) => (
          <Button key={m.id} variant={gap?.id === m.id ? "default" : "secondary"} onClick={() => setGap(m)}>
            {m.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

const ROCK_STEPS = [
  { id: "weathering", title: "Weathering", line: "Rock breaks. Bits stay in place.", cue: "break" },
  { id: "erosion", title: "Erosion", line: "Wind, water, or ice carries the bits away.", cue: "move" },
  { id: "deposition", title: "Deposition", line: "The bits drop in layers.", cue: "drop" },
  { id: "compaction", title: "Compaction", line: "New layers squeeze the old ones.", cue: "squeeze" },
  { id: "cementation", title: "Cementation", line: "Minerals glue the grains. Sedimentary rock.", cue: "glue" },
];

function RockPicture({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 400 140" className="h-auto w-full">
      {id === "weathering" ? (
        <>
          <rect x="40" y="20" width="90" height="100" fill="var(--color-line-strong)" />
          <path d="M70 20 L78 60 L62 100" stroke="var(--color-ink)" strokeWidth="2" fill="none" />
          <circle cx="160" cy="108" r="8" fill="var(--color-muted)" />
          <circle cx="184" cy="114" r="6" fill="var(--color-muted)" />
          <circle cx="148" cy="118" r="5" fill="var(--color-faint)" />
        </>
      ) : null}
      {id === "erosion" ? (
        <>
          <path d="M20 80 Q120 60 220 90 T380 70" fill="none" stroke="var(--color-forest)" strokeWidth="6" />
          <circle cx="120" cy="74" r="6" fill="var(--color-line-strong)" />
          <circle cx="200" cy="86" r="5" fill="var(--color-muted)" />
          <circle cx="280" cy="78" r="7" fill="var(--color-line-strong)" />
        </>
      ) : null}
      {id === "deposition" ? (
        <>
          <rect x="40" y="100" width="320" height="16" fill="var(--color-line)" />
          <rect x="50" y="84" width="300" height="16" fill="var(--color-line-strong)" />
          <rect x="70" y="68" width="260" height="16" fill="var(--color-muted)" />
        </>
      ) : null}
      {id === "compaction" ? (
        <>
          <rect x="70" y="88" width="260" height="18" fill="var(--color-line)" />
          <rect x="70" y="70" width="260" height="12" fill="var(--color-line-strong)" />
          <path d="M200 24 L200 58 M188 46 L200 58 L212 46" stroke="var(--color-ink)" strokeWidth="3" fill="none" />
        </>
      ) : null}
      {id === "cementation" ? (
        <>
          <circle cx="130" cy="80" r="18" fill="var(--color-line-strong)" />
          <circle cx="168" cy="86" r="16" fill="var(--color-muted)" />
          <circle cx="204" cy="78" r="17" fill="var(--color-line-strong)" />
          <circle cx="238" cy="88" r="14" fill="var(--color-faint)" />
          <path d="M148 80 Q168 70 188 82" stroke="var(--color-forest)" strokeWidth="3" fill="none" />
          <path d="M184 86 Q210 96 226 84" stroke="var(--color-forest)" strokeWidth="3" fill="none" />
        </>
      ) : null}
    </svg>
  );
}

function StoryLab() {
  const [step, setStep] = useState(0);
  const s = ROCK_STEPS[step];
  return (
    <div>
      <Stage>
        <p className="px-4 pt-3 text-xs tracking-wide text-muted uppercase">
          Step {step + 1} of 5
        </p>
        <RockPicture id={s.id} />
        <div className="px-4 pb-4">
          <p className="font-display text-3xl">{s.title}</p>
          <p className="mt-2 text-ink-soft">{s.line}</p>
        </div>
      </Stage>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setStep(0)} disabled={step === 0}>
          Still
        </Button>
        <Button onClick={() => setStep((n) => Math.min(4, n + 1))} disabled={step >= 4}>
          Play
        </Button>
      </div>
    </div>
  );
}

function ProcessLab() {
  const pics = useMemo(() => {
    const copy = [...ROCK_STEPS];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, []);
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const pic = pics[i];
  return (
    <div>
      <Stage>
        <RockPicture id={pic.id} />
        <div className="px-4 pb-4">
          <p className="font-display text-2xl">{show ? pic.title : "Which process?"}</p>
          <p className="mt-2 text-ink-soft">{show ? pic.line : "Look at the still picture. Whisper a word, then reveal."}</p>
        </div>
      </Stage>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => setShow(true)}>Reveal</Button>
        <Button
          variant="secondary"
          onClick={() => {
            setShow(false);
            setI((n) => (n + 1) % pics.length);
          }}
        >
          Next picture
        </Button>
      </div>
    </div>
  );
}

function OrderLab() {
  const target = ROCK_STEPS.map((s) => s.id);
  const [picked, setPicked] = useState<string[]>([]);
  const remaining = ROCK_STEPS.filter((s) => !picked.includes(s.id));
  const ok = picked.length === 5 && picked.every((id, i) => id === target[i]);
  const wrong = picked.length === 5 && !ok;
  return (
    <div>
      <p className="mb-2 text-sm text-muted">Tap in order: break, move, drop, squeeze, glue.</p>
      <div className="flex flex-wrap gap-2">
        {remaining.map((s) => (
          <Button key={s.id} variant="secondary" onClick={() => setPicked((p) => [...p, s.id])}>
            {s.title}
          </Button>
        ))}
      </div>
      <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm">
        {picked.map((id) => (
          <li key={id}>{ROCK_STEPS.find((s) => s.id === id)?.title}</li>
        ))}
      </ol>
      {ok ? <p className="mt-3 text-sm text-good">That’s the sequence.</p> : null}
      {wrong ? <p className="mt-3 text-sm text-bad">Not quite. Reset and try break → move → drop → squeeze → glue.</p> : null}
      <Button className="mt-3" variant="ghost" onClick={() => setPicked([])}>
        Reset
      </Button>
    </div>
  );
}

function FuelsLab() {
  const beats = [
    { t: "Living things grow in a swamp, forest, or sea.", id: "weathering" },
    { t: "They die and get buried in sediment.", id: "deposition" },
    { t: "Time, heat, and pressure change the remains.", id: "compaction" },
    { t: "Coal, oil, or natural gas ends up in sedimentary rock.", id: "cementation" },
  ];
  const [i, setI] = useState(0);
  return (
    <div>
      <Stage>
        <p className="px-4 pt-3 text-xs tracking-wide text-muted uppercase">
          {i + 1} / {beats.length}
        </p>
        <RockPicture id={beats[i].id} />
        <p className="px-4 pb-5 font-display text-2xl leading-snug">{beats[i].t}</p>
      </Stage>
      <Button className="mt-3" onClick={() => setI((n) => Math.min(beats.length - 1, n + 1))} disabled={i >= beats.length - 1}>
        Next
      </Button>
    </div>
  );
}
