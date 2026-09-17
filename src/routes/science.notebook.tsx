import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScienceShell } from "@/components/science/science-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { finishedCount, labRecord, useLabStore } from "@/lib/science/lab-store";
import { LABS, WORD_BANK } from "@/lib/science/labs";

export const Route = createFileRoute("/science/notebook")({ component: NotebookPage });

function NotebookPage() {
  const byLab = useLabStore((s) => s.byLab);
  const quiz = useLabStore((s) => s.quiz);
  const resetLabs = useLabStore((s) => s.resetLabs);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const done = mounted ? finishedCount(byLab) : 0;
  const trials = mounted ? Object.values(byLab).reduce((n, r) => n + r.trials.length, 0) : 0;

  return (
    <ScienceShell>
      <p className="text-xs font-medium tracking-[0.16em] text-forest uppercase">Scientist notebook</p>
      <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">Your claims and data</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Everything here stays on this device. Teachers can screenshot a page or have students copy a claim into a
        journal.
      </p>
      <p className="mt-3 text-sm text-ink-soft">
        Labs finished: {done}/16 · Trials recorded: {trials} · Check-it:{" "}
        {mounted && quiz ? `${quiz.score}/${quiz.total}` : "—"}
      </p>

      <div className="mt-8 grid gap-3">
        {LABS.map((lab) => {
          const rec = mounted ? labRecord(byLab, lab.id) : { finished: false, claim: "", trials: [] };
          return (
            <Card key={lab.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-medium">{lab.title}</p>
                    <p className="mt-1 text-sm text-muted">{lab.question}</p>
                  </div>
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/science/lab/$labId" params={{ labId: lab.id }}>
                      Open lab
                    </Link>
                  </Button>
                </div>
                <p className="mt-3 text-sm text-ink-soft">
                  {rec.claim ? rec.claim : rec.finished ? "Finished — no claim saved yet." : "No claim saved yet."}
                </p>
                {rec.trials.length ? (
                  <p className="mt-2 text-xs text-faint">{rec.trials.length} trial{rec.trials.length === 1 ? "" : "s"} recorded</p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-medium">Word bank</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {WORD_BANK.map((w) => (
            <div key={w.term} className="rounded-lg border border-line bg-surface px-4 py-3">
              <dt className="text-sm font-medium">{w.term}</dt>
              <dd className="mt-1 text-sm text-muted">{w.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Button
        className="mt-10"
        variant="ghost"
        onClick={() => {
          if (window.confirm("Clear notebook on this device? Lab progress, claims, and quiz score will be erased.")) {
            resetLabs();
          }
        }}
      >
        Clear notebook on this device
      </Button>
    </ScienceShell>
  );
}
