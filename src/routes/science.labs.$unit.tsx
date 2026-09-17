import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { ScienceShell } from "@/components/science/science-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { labRecord, useLabStore } from "@/lib/science/lab-store";
import { glossaryForUnit, isLabUnit, LAB_UNITS, labsForUnit } from "@/lib/science/labs";

export const Route = createFileRoute("/science/labs/$unit")({ component: UnitPage });

function UnitPage() {
  const { unit } = Route.useParams();
  const byLab = useLabStore((s) => s.byLab);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isLabUnit(unit)) {
    return (
      <ScienceShell>
        <p className="text-ink-soft">That unit isn’t here.</p>
        <Link to="/science" className="mt-3 inline-block text-sm text-forest">
          Back to Science Hacks
        </Link>
      </ScienceShell>
    );
  }

  const meta = LAB_UNITS.find((u) => u.id === unit)!;
  const labs = labsForUnit(unit);
  const done = mounted ? labs.filter((l) => byLab[l.id]?.finished).length : 0;
  const words = glossaryForUnit(unit);

  return (
    <ScienceShell>
      <p className="text-xs font-medium tracking-[0.16em] text-forest uppercase">{meta.teks}</p>
      <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">{meta.name}</h1>
      <p className="mt-2 max-w-xl text-ink-soft">{meta.blurb}</p>
      <p className="mt-2 text-sm text-muted">
        {meta.duration} · {done} of {labs.length} finished
      </p>

      <div className="mt-8 grid gap-3">
        {labs.map((lab) => {
          const rec = mounted ? labRecord(byLab, lab.id) : { finished: false, claim: "", trials: [] };
          return (
            <Link key={lab.id} to="/science/lab/$labId" params={{ labId: lab.id }} className="group block no-underline">
              <Card className="transition-[border-color] hover:border-line-strong">
                <CardContent className="flex items-start gap-4 p-5">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-xl font-medium">{lab.title}</span>
                      {rec.finished ? (
                        <Badge variant="readiness" className="normal-case tracking-normal">
                          <Check className="mr-1 size-3" />
                          Finished
                        </Badge>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm text-muted">{lab.kicker}</span>
                    <span className="mt-2 block text-sm text-ink-soft">{lab.blurb}</span>
                    <span className="mt-2 block text-sm text-ink">
                      <span className="font-medium">Investigate: </span>
                      {lab.question}
                    </span>
                    <span className="mt-2 block text-xs text-faint">
                      {lab.teks.join(" · ")} · {lab.duration}
                    </span>
                  </span>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-medium">Word bank</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {words.map((w) => (
            <div key={w.term} className="rounded-lg border border-line bg-surface px-4 py-3">
              <dt className="text-sm font-medium text-ink">{w.term}</dt>
              <dd className="mt-1 text-sm text-muted">{w.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>
    </ScienceShell>
  );
}
