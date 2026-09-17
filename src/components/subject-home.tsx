import { ArrowLeft, ArrowRight, Layers } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PracticeLink, StrandLink } from "@/components/subject-links";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/lib/progress-store";
import { getSubject, type SubjectId } from "@/lib/subjects";

export function SubjectHome({
  subject,
  framed = false,
  hideBack = false,
}: {
  subject: SubjectId;
  framed?: boolean;
  hideBack?: boolean;
}) {
  const sub = getSubject(subject);
  const byTeks = useProgress((s) => s.byTeks);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const ids = new Set(sub.expectations.map((e) => e.id));
  let attempted = 0;
  let correct = 0;
  for (const [id, stat] of Object.entries(byTeks)) {
    if (!ids.has(id)) continue;
    attempted += stat.attempted;
    correct += stat.correct;
  }
  const overall = attempted ? Math.round((correct / attempted) * 100) : null;

  const body = (
    <>
      {hideBack ? null : (
        <Link
          to={framed && subject === "science" ? "/science" : "/"}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          {framed && subject === "science" ? "Science Hacks" : "Hack’s Hacks"}
        </Link>
      )}

      <section className="mb-8">
        <p className="mb-2 text-xs font-medium tracking-[0.18em] text-forest uppercase">{sub.kicker}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{sub.name}</h1>
        <p className="mt-3 max-w-xl text-base text-ink-soft">{sub.tagline}</p>
      </section>

      <PracticeLink
        subject={subject}
        teks="staar"
        className="mb-8 flex items-center justify-between gap-4 rounded-xl bg-forest px-5 py-5 text-bg no-underline transition-colors hover:bg-forest-deep"
      >
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-chalk uppercase">{sub.mixKicker}</p>
          <p className="font-display text-2xl font-semibold">{sub.mixTitle}</p>
          <p className="mt-1 max-w-md text-sm text-chalk">{sub.mixBlurb}</p>
        </div>
        <ArrowRight className="size-6 shrink-0" />
      </PracticeLink>

      {mounted && overall !== null ? (
        <div className="mb-6 flex items-center gap-3 text-sm text-muted">
          <span className="tabular-nums text-ink">
            {correct}/{attempted} correct
          </span>
          <Progress value={overall} className="max-w-40" />
          <span className="tabular-nums">{overall}%</span>
        </div>
      ) : null}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">Stations</h2>
        <span className="text-xs text-muted">{sub.expectations.length} student expectations</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sub.strands.map((strand) => {
          const ses = sub.expectationsForStrand(strand.id);
          const att = ses.reduce((n, se) => n + (byTeks[se.id]?.attempted ?? 0), 0);
          const cor = ses.reduce((n, se) => n + (byTeks[se.id]?.correct ?? 0), 0);
          const pct = att ? Math.round((cor / att) * 100) : null;
          const ready = ses.filter((s) => s.weight === "readiness").length;
          return (
            <StrandLink key={strand.id} subject={subject} strandId={strand.id} className="group block no-underline">
              <Card className="h-full transition-[border-color,transform] duration-200 hover:border-line-strong">
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-3xl font-medium tracking-tight text-forest">{strand.code}</p>
                    <Layers className="size-4 text-faint transition-colors group-hover:text-forest" />
                  </div>
                  <h3 className="mt-3 font-display text-xl font-medium">{strand.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted">{strand.blurb}</p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="supporting">{ses.length} TEKS</Badge>
                      {ready ? <Badge variant="readiness">{ready} readiness</Badge> : null}
                    </div>
                    {mounted && pct !== null ? (
                      <span className="text-xs tabular-nums text-muted">{pct}%</span>
                    ) : (
                      <span className="text-xs text-faint">New</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StrandLink>
          );
        })}
      </div>

      <p className="mt-10 max-w-2xl text-xs leading-relaxed text-faint">{sub.footer}</p>
    </>
  );

  if (framed) return body;
  return <AppShell>{body}</AppShell>;
}
