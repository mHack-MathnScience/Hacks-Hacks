import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { QuestionVisual } from "@/components/question-visual";
import { PracticeLink, StrandLink, SubjectHomeLink } from "@/components/subject-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/lib/progress-store";
import { getSubject, type SubjectId } from "@/lib/subjects";
import { answersMatch } from "@/lib/teks/answers";
import type { Question } from "@/lib/teks/types";
import { cn } from "@/lib/utils";

const SET_SIZE = 8;

export function PracticeSession({ subject, teks }: { subject: SubjectId; teks: string }) {
  const sub = getSubject(subject);
  const pool = sub.poolForKey(teks);
  const label = sub.labelForKey(teks);
  const isMix = teks === "staar" || teks === "mix";
  const record = useProgress((s) => s.record);

  const [set, setSet] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (pool.length === 0) return;
    setSet(sub.generateSet(teks, SET_SIZE));
    setIndex(0);
    setSelected(null);
    setTyped("");
    setChecked(false);
    setCorrectCount(0);
    setDone(false);
  }, [teks, round, pool.length, sub]);

  const q = set?.[index] ?? null;
  const se = q ? sub.expectationById(q.teks) : sub.expectationById(teks);
  const strand = se ? sub.strandById(se.strandId) : sub.strandById(teks);

  const isCorrect = useMemo(() => {
    if (!q || !checked) return false;
    if (q.kind === "mc") return selected === q.correct;
    return answersMatch(typed, q.correct, q.accept);
  }, [q, checked, selected, typed]);

  function check() {
    if (!q || checked) return;
    const ok = q.kind === "mc" ? selected === q.correct : answersMatch(typed, q.correct, q.accept);
    setChecked(true);
    if (ok) setCorrectCount((n) => n + 1);
    record(q.teks, ok);
  }

  function next() {
    if (!set) return;
    if (index + 1 >= set.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setTyped("");
    setChecked(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!q || done) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        if (e.key === "Enter") {
          e.preventDefault();
          if (checked) next();
          else check();
        }
        return;
      }
      if (!checked && q.kind === "mc" && q.choices) {
        const map: Record<string, string> = { "1": "A", "2": "B", "3": "C", "4": "D" };
        const id = map[e.key];
        if (id && q.choices.some((c) => c.id === id)) setSelected(id);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (checked) next();
        else check();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (pool.length === 0) {
    return (
      <AppShell>
        <p className="text-ink-soft">No questions for that TEKS yet.</p>
        <Button asChild className="mt-4">
          <SubjectHomeLink subject={subject}>Back to {sub.name}</SubjectHomeLink>
        </Button>
      </AppShell>
    );
  }

  if (!set || !q) {
    return (
      <AppShell>
        <p className="text-muted">Shuffling a new set…</p>
      </AppShell>
    );
  }

  if (done) {
    const pct = Math.round((correctCount / set.length) * 100);
    return (
      <AppShell className="max-w-xl">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <p className="text-xs font-medium tracking-[0.16em] text-forest uppercase">{label.kicker}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold">Set complete</h1>
            <p className="mt-3 font-display text-5xl tabular-nums text-forest">
              {correctCount}
              <span className="text-2xl text-muted">/{set.length}</span>
            </p>
            <p className="mt-1 text-ink-soft">
              {pct}% on this set of {label.title}.
            </p>
            <Progress value={pct} className="mt-4" />
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => setRound((n) => n + 1)}>
                <RotateCcw className="size-4" />
                New set
              </Button>
              <Button asChild variant="secondary">
                <SubjectHomeLink subject={subject}>{sub.name}</SubjectHomeLink>
              </Button>
              {strand ? (
                <Button asChild variant="ghost">
                  <StrandLink subject={subject} strandId={strand.id}>
                    {strand.title}
                  </StrandLink>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const canCheck = q.kind === "mc" ? Boolean(selected) : typed.trim().length > 0;
  const progressPct = ((index + (checked ? 1 : 0)) / set.length) * 100;

  return (
    <AppShell className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        {isMix ? (
          <SubjectHomeLink
            subject={subject}
            className="inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            {sub.name}
          </SubjectHomeLink>
        ) : strand ? (
          <StrandLink
            subject={subject}
            strandId={strand.id}
            className="inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            {strand.title}
          </StrandLink>
        ) : (
          <SubjectHomeLink
            subject={subject}
            className="inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            {sub.name}
          </SubjectHomeLink>
        )}
        <span className="font-mono text-xs tabular-nums text-muted">
          {index + 1} / {set.length}
        </span>
      </div>
      <Progress value={progressPct} className="mb-5" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="default">{se?.code ?? label.kicker}</Badge>
        {se?.weight === "readiness" ? <Badge variant="readiness">Readiness</Badge> : null}
        <span className="text-sm text-muted">{se?.kidTitle ?? label.title}</span>
      </div>

      <Card>
        <CardContent className="p-5 sm:p-6">
          <p className="text-lg leading-relaxed text-ink">{q.stem}</p>
          {q.expression ? (
            <p className="mt-4 font-display text-3xl tracking-tight text-forest sm:text-4xl">{q.expression}</p>
          ) : null}
          {q.visual ? (
            <div className="mt-5">
              <QuestionVisual visual={q.visual} />
            </div>
          ) : null}

          {q.kind === "mc" && q.choices ? (
            <div className="mt-6 grid gap-2" role="listbox" aria-label="Answer choices">
              {q.choices.map((c) => {
                const isSel = selected === c.id;
                const isAns = c.id === q.correct;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={checked}
                    onClick={() => setSelected(c.id)}
                    className={cn(
                      "flex min-h-12 items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                      !checked && "hover:border-line-strong hover:bg-paper",
                      !checked && isSel && "border-forest bg-forest-soft",
                      checked && isAns && "border-good bg-good-soft",
                      checked && isSel && !isAns && "border-bad bg-bad-soft",
                      checked && !isSel && !isAns && "opacity-60",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-sm border font-mono text-xs",
                        checked && isAns && "border-good bg-good text-bg",
                        checked && isSel && !isAns && "border-bad bg-bad text-bg",
                        !checked && isSel && "border-forest bg-forest text-bg",
                        !checked && !isSel && "border-line bg-surface text-muted",
                      )}
                    >
                      {c.id}
                    </span>
                    <span className="pt-0.5 text-base leading-snug">{c.text}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-6">
              <label htmlFor="answer" className="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">
                Your answer
              </label>
              <Input
                id="answer"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={q.inputHint}
                disabled={checked}
                autoComplete="off"
                inputMode="decimal"
                className={cn(
                  "max-w-xs font-mono text-lg",
                  checked && isCorrect && "border-good bg-good-soft",
                  checked && !isCorrect && "border-bad bg-bad-soft",
                )}
              />
            </div>
          )}

          {checked ? (
            <div
              className={cn(
                "mt-5 rounded-lg border px-4 py-3",
                isCorrect ? "border-good/30 bg-good-soft" : "border-bad/30 bg-bad-soft",
              )}
            >
              <p className="flex items-center gap-2 text-sm font-medium">
                {isCorrect ? <Check className="size-4 text-good" /> : <X className="size-4 text-bad" />}
                {isCorrect ? "That’s it." : "Not quite."}
              </p>
              {!isCorrect && q.kind === "input" ? (
                <p className="mt-1 text-sm text-ink-soft">
                  Correct answer: <span className="font-medium text-ink">{q.correct}</span>
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{q.explanation}</p>
            </div>
          ) : (
            <p className="mt-4 hidden text-xs text-faint sm:block">
              {q.kind === "mc" ? "Press 1–4 to choose, Enter to check." : "Press Enter to check."}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {!checked ? (
              <Button onClick={check} disabled={!canCheck}>
                Check
              </Button>
            ) : (
              <Button onClick={next}>
                {index + 1 >= set.length ? "See results" : "Next"}
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
