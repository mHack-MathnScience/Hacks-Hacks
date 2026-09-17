import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PracticeLink, SubjectHomeLink } from "@/components/subject-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { accuracy, useProgress } from "@/lib/progress-store";
import { getSubject, type SubjectId } from "@/lib/subjects";
import type { StaarWeight } from "@/lib/teks/types";

function weightVariant(w: StaarWeight): "readiness" | "supporting" | "classroom" {
  return w;
}

function weightLabel(w: StaarWeight): string {
  if (w === "readiness") return "Readiness";
  if (w === "supporting") return "Supporting";
  return "Classroom";
}

export function StrandBoard({ subject, strandId }: { subject: SubjectId; strandId: string }) {
  const sub = getSubject(subject);
  const strand = sub.strandById(strandId);
  const ses = sub.expectationsForStrand(strandId);
  const byTeks = useProgress((s) => s.byTeks);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!strand) {
    return (
      <AppShell>
        <p className="text-ink-soft">That station is not on the board.</p>
        <Button asChild className="mt-4">
          <SubjectHomeLink subject={subject}>Back to {sub.name}</SubjectHomeLink>
        </Button>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SubjectHomeLink
        subject={subject}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        {sub.name}
      </SubjectHomeLink>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-4xl font-medium text-forest">{strand.code}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{strand.title}</h1>
          <p className="mt-2 max-w-xl text-ink-soft">{strand.blurb}</p>
          <p className="mt-1 text-xs text-faint">{strand.categoryLabel}</p>
        </div>
        <Button asChild size="lg">
          <PracticeLink subject={subject} teks={strand.id}>
            Practice this strand
            <ArrowRight className="size-4" />
          </PracticeLink>
        </Button>
      </div>

      <div className="space-y-2">
        {ses.map((se) => {
          const stat = byTeks[se.id];
          const pct = accuracy(stat);
          return (
            <Card key={se.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-medium tabular-nums text-forest">{se.code}</span>
                    <Badge variant={weightVariant(se.weight)}>{weightLabel(se.weight)}</Badge>
                    {mounted && pct !== null ? (
                      <span className="text-xs tabular-nums text-muted">
                        {stat!.correct}/{stat!.attempted} · {pct}%
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-1 font-display text-lg font-medium">{se.kidTitle}</h2>
                  <p className="mt-0.5 text-sm text-muted">{se.official}</p>
                </div>
                <Button asChild variant="outline" className="shrink-0">
                  <PracticeLink subject={subject} teks={se.id}>
                    Practice
                  </PracticeLink>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
