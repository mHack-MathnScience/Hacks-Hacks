import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calculator, FlaskConical } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/lib/progress-store";
import { isScienceTeks, SUBJECTS } from "@/lib/subjects";

export const Route = createFileRoute("/")({ component: Hub });

function Hub() {
  const name = useProgress((s) => s.name);
  const setName = useProgress((s) => s.setName);
  const byTeks = useProgress((s) => s.byTeks);
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState("");
  useEffect(() => {
    setMounted(true);
    setDraft(useProgress.getState().name);
  }, []);

  let mathAtt = 0;
  let mathCor = 0;
  let sciAtt = 0;
  let sciCor = 0;
  for (const [id, stat] of Object.entries(byTeks)) {
    if (isScienceTeks(id)) {
      sciAtt += stat.attempted;
      sciCor += stat.correct;
    } else {
      mathAtt += stat.attempted;
      mathCor += stat.correct;
    }
  }
  const overallAtt = mathAtt + sciAtt;
  const overallCor = mathCor + sciCor;
  const overall = overallAtt ? Math.round((overallCor / overallAtt) * 100) : null;

  return (
    <AppShell>
      <section className="mb-8 grid gap-6 md:grid-cols-[1.4fr_0.8fr] md:items-end">
        <div>
          <p className="mb-2 text-xs font-medium tracking-[0.18em] text-forest uppercase">Grade 5 · Texas TEKS</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Hack’s Hacks</h1>
          <p className="mt-3 max-w-xl text-base text-ink-soft">
            Math Hacks is generated TEKS practice. Science Hacks is the lab set — forces, landforms, circuits, and
            rocks — with a notebook and Check-it quiz.
          </p>
        </div>
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setName(draft);
          }}
        >
          <label htmlFor="student-name" className="text-xs font-medium tracking-wide text-muted uppercase">
            Name on this device
          </label>
          <div className="flex gap-2">
            <Input
              id="student-name"
              value={mounted ? draft : ""}
              placeholder="Optional"
              onChange={(e) => setDraft(e.target.value)}
              autoComplete="nickname"
            />
            <Button type="submit" variant="secondary">
              Save
            </Button>
          </div>
        </form>
      </section>

      {mounted && overall !== null ? (
        <div className="mb-6 flex items-center gap-3 text-sm text-muted">
          <span className="tabular-nums text-ink">
            {overallCor}/{overallAtt} correct
          </span>
          <Progress value={overall} className="max-w-40" />
          <span className="tabular-nums">{overall}%</span>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <SubjectCard
          to="/math"
          icon={<Calculator className="size-5" />}
          name={SUBJECTS.math.name}
          range="TEKS 5.2–5.10"
          blurb="Place value, operations, volume, graphs, and financial literacy. A new question every time."
          cta="Open stations"
          filled
          score={mounted && mathAtt ? `${Math.round((mathCor / mathAtt) * 100)}%` : null}
        />
        <SubjectCard
          to="/science"
          icon={<FlaskConical className="size-5" />}
          name={SUBJECTS.science.name}
          range="Labs · 5.7–5.10"
          blurb="Sixteen labs, a scientist notebook, and a 21-item Check-it. Same classroom set as Science Hacks."
          cta="Open labs"
          filled={false}
          score={mounted && sciAtt ? `${Math.round((sciCor / sciAtt) * 100)}%` : null}
        />
      </div>

      <p className="mt-10 max-w-2xl text-xs leading-relaxed text-faint">
        Math aligned to 19 TAC §111.7 (2012). Science labs follow the Grade 5 science TEKS implemented in 2024 (19 TAC
        §112.16). Progress is stored only on this device.
      </p>
    </AppShell>
  );
}

function SubjectCard({
  to,
  icon,
  name,
  range,
  blurb,
  cta,
  filled,
  score,
}: {
  to: "/math" | "/science";
  icon: ReactNode;
  name: string;
  range: string;
  blurb: string;
  cta: string;
  filled: boolean;
  score: string | null;
}) {
  return (
    <Link to={to} className="group block no-underline">
      <Card
        className={
          filled
            ? "h-full border-forest bg-forest text-bg transition-colors hover:bg-forest-deep"
            : "h-full transition-[border-color] duration-200 hover:border-line-strong"
        }
      >
        <CardContent className="flex h-full flex-col p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <span className={filled ? "text-chalk" : "text-forest"}>{icon}</span>
            <span className={`text-xs tracking-[0.14em] uppercase ${filled ? "text-chalk" : "text-muted"}`}>{range}</span>
          </div>
          <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight">{name}</h2>
          <p className={`mt-2 flex-1 text-sm ${filled ? "text-chalk" : "text-muted"}`}>{blurb}</p>
          <div className="mt-6 flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${filled ? "text-bg" : "text-forest"}`}>
              {cta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
            {score ? (
              <span className={`text-xs tabular-nums ${filled ? "text-chalk" : "text-muted"}`}>{score}</span>
            ) : (
              <span className={`text-xs ${filled ? "text-chalk/80" : "text-faint"}`}>New</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
