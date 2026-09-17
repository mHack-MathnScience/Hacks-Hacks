import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ClipboardCheck, FlaskConical, GraduationCap, Layers, Mountain, PenLine, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { ScienceShell } from "@/components/science/science-shell";
import { Card, CardContent } from "@/components/ui/card";
import { finishedCount, useLabStore } from "@/lib/science/lab-store";
import { LAB_UNITS } from "@/lib/science/labs";

export const Route = createFileRoute("/science/")({ component: ScienceHome });

const ICONS = {
  forces: FlaskConical,
  landforms: Mountain,
  circuits: Zap,
  rocks: Layers,
};

const UNIT_LABS = {
  forces: ["equal", "ramp", "rocket", "distance"],
  landforms: ["canyon", "valley", "delta", "dunes"],
  circuits: ["build", "lightup", "energy", "conduct"],
  rocks: ["story", "process", "order", "fuels"],
} as const;

function ScienceHome() {
  const byLab = useLabStore((s) => s.byLab);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const done = mounted ? finishedCount(byLab) : 0;

  return (
    <ScienceShell>
      <p className="text-xs font-medium tracking-[0.18em] text-forest uppercase">Science Hacks · Texas Grade 5</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Where do you want to go?</h1>
      <p className="mt-3 max-w-lg text-ink-soft">Pick a unit, open your notebook, or check what you know.</p>
      <p className="mt-2 text-xs text-faint">{done} of 16 labs finished</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {LAB_UNITS.map((u) => {
          const Icon = ICONS[u.id];
          const n = mounted ? UNIT_LABS[u.id].filter((id) => byLab[id]?.finished).length : 0;
          return (
            <Link key={u.id} to="/science/labs/$unit" params={{ unit: u.id }} className="group block no-underline">
              <Card className="h-full transition-[border-color] hover:border-line-strong">
                <CardContent className="flex gap-3 p-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-forest-soft text-forest">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display text-lg font-medium">{u.title}</span>
                      <ArrowRight className="size-4 text-faint transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-1 block text-sm text-muted">{u.blurb}</span>
                    <span className="mt-2 block text-xs text-faint">
                      {n}/4 done · {u.teks}
                    </span>
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        <Link to="/science/notebook" className="group block no-underline">
          <Card className="h-full transition-[border-color] hover:border-line-strong">
            <CardContent className="flex gap-3 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-forest-soft text-forest">
                <BookOpen className="size-5" />
              </span>
              <span>
                <span className="flex items-center gap-2 font-display text-lg font-medium">
                  Notebook
                  <ArrowRight className="size-4 text-faint" />
                </span>
                <span className="mt-1 block text-sm text-muted">Claims, evidence, and your trial data.</span>
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/science/quiz" className="group block no-underline">
          <Card className="h-full transition-[border-color] hover:border-line-strong">
            <CardContent className="flex gap-3 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-forest-soft text-forest">
                <ClipboardCheck className="size-5" />
              </span>
              <span>
                <span className="flex items-center gap-2 font-display text-lg font-medium">
                  Check it
                  <ArrowRight className="size-4 text-faint" />
                </span>
                <span className="mt-1 block text-sm text-muted">STAAR-style questions for all units.</span>
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/science/teacher" className="group block no-underline">
          <Card className="h-full transition-[border-color] hover:border-line-strong">
            <CardContent className="flex gap-3 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-forest-soft text-forest">
                <GraduationCap className="size-5" />
              </span>
              <span>
                <span className="flex items-center gap-2 font-display text-lg font-medium">
                  Teachers
                  <ArrowRight className="size-4 text-faint" />
                </span>
                <span className="mt-1 block text-sm text-muted">Lesson paths, TEKS, and classroom notes.</span>
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/science/staar" className="group block no-underline">
          <Card className="h-full transition-[border-color] hover:border-line-strong">
            <CardContent className="flex gap-3 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-forest-soft text-forest">
                <PenLine className="size-5" />
              </span>
              <span>
                <span className="flex items-center gap-2 font-display text-lg font-medium">
                  STAAR stations
                  <ArrowRight className="size-4 text-faint" />
                </span>
                <span className="mt-1 block text-sm text-muted">Generated items for every Grade 5 science TEKS.</span>
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </ScienceShell>
  );
}
