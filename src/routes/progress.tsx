import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PracticeLink } from "@/components/subject-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { accuracy, useProgress } from "@/lib/progress-store";
import { SUBJECTS, type SubjectId } from "@/lib/subjects";

export const Route = createFileRoute("/progress")({ component: ProgressPage });

function ProgressPage() {
  const name = useProgress((s) => s.name);
  const byTeks = useProgress((s) => s.byTeks);
  const streak = useProgress((s) => s.streak);
  const bestStreak = useProgress((s) => s.bestStreak);
  const totalCorrect = useProgress((s) => s.totalCorrect);
  const totalAttempted = useProgress((s) => s.totalAttempted);
  const reset = useProgress((s) => s.reset);
  const [mounted, setMounted] = useState(false);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => setMounted(true), []);

  const overall = totalAttempted ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const mathPracticed = SUBJECTS.math.expectations.filter((e) => (byTeks[e.id]?.attempted ?? 0) > 0).length;
  const sciPracticed = SUBJECTS.science.expectations.filter((e) => (byTeks[e.id]?.attempted ?? 0) > 0).length;
  const totalSe = SUBJECTS.math.expectations.length + SUBJECTS.science.expectations.length;

  return (
    <AppShell>
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink">
        <ArrowLeft className="size-4" />
        Hack’s Hacks
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {mounted && name ? `${name}’s progress` : "Progress"}
      </h1>
      <p className="mt-1 text-sm text-muted">Stored on this device only.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Answered" value={mounted ? String(totalAttempted) : "—"} />
        <Stat label="Accuracy" value={mounted && totalAttempted ? `${overall}%` : "—"} />
        <Stat label="Streak" value={mounted ? `${streak} · best ${bestStreak}` : "—"} />
      </div>

      {mounted && totalAttempted > 0 ? <Progress value={overall} className="mt-4" /> : null}
      <p className="mt-2 text-xs text-muted">
        {mounted
          ? `${mathPracticed + sciPracticed} of ${totalSe} student expectations practiced · Math ${mathPracticed}/${SUBJECTS.math.expectations.length} · Science ${sciPracticed}/${SUBJECTS.science.expectations.length}`
          : ""}
      </p>

      <SubjectProgress subject="math" />
      <SubjectProgress subject="science" />

      <div className="mt-10">
        {!confirm ? (
          <Button variant="ghost" onClick={() => setConfirm(true)}>
            Reset progress
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Clear all scores on this device?</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                reset();
                setConfirm(false);
              }}
            >
              Reset
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
              Keep
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function SubjectProgress({ subject }: { subject: SubjectId }) {
  const sub = SUBJECTS[subject];
  const byTeks = useProgress((s) => s.byTeks);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="mt-10">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{sub.name}</h2>
      <p className="mt-1 text-xs text-muted">{sub.kicker}</p>
      <div className="mt-5 space-y-8">
        {sub.strands.map((strand) => {
          const ses = sub.expectationsForStrand(strand.id);
          const att = ses.reduce((n, se) => n + (byTeks[se.id]?.attempted ?? 0), 0);
          const cor = ses.reduce((n, se) => n + (byTeks[se.id]?.correct ?? 0), 0);
          const pct = att ? Math.round((cor / att) * 100) : 0;
          return (
            <section key={strand.id}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl">
                  <span className="text-forest">{strand.code}</span> {strand.title}
                </h3>
                <span className="text-xs tabular-nums text-muted">{att ? `${pct}%` : "Not started"}</span>
              </div>
              <div className="divide-y divide-line rounded-xl border border-line bg-surface">
                {ses.map((se) => {
                  const stat = byTeks[se.id];
                  const a = accuracy(stat);
                  return (
                    <div key={se.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="w-16 shrink-0 font-mono text-xs text-forest">{se.code}</span>
                      <span className="min-w-0 flex-1 truncate text-sm">{se.kidTitle}</span>
                      {se.weight === "readiness" ? <Badge variant="readiness">R</Badge> : null}
                      <span className="w-16 text-right text-xs tabular-nums text-muted">
                        {mounted && a !== null ? `${a}%` : "—"}
                      </span>
                      <Button asChild size="sm" variant="ghost">
                        <PracticeLink subject={subject} teks={se.id}>
                          Go
                        </PracticeLink>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
        <p className="mt-1 font-display text-2xl tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
