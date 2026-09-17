import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScienceShell } from "@/components/science/science-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import items from "@/lib/science/checkit.json";
import { useLabStore } from "@/lib/science/lab-store";

type Item = {
  id: string;
  prompt: string;
  teks: string;
  choices: string[];
  answer: number;
  why: string;
};

const QUESTIONS = items as Item[];
const LETTERS = ["A", "B", "C", "D"] as const;

export const Route = createFileRoute("/science/quiz")({ component: QuizPage });

function QuizPage() {
  const saveQuiz = useLabStore((s) => s.saveQuiz);
  const saved = useLabStore((s) => s.quiz);
  const [mounted, setMounted] = useState(false);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUESTIONS.map(() => null));
  const [done, setDone] = useState(false);
  useEffect(() => setMounted(true), []);

  const q = QUESTIONS[i];
  const locked = picked !== null;
  const score = answers.reduce<number>((n, a, idx) => n + (a === QUESTIONS[idx].answer ? 1 : 0), 0);

  function choose(n: number) {
    if (locked) return;
    setPicked(n);
    setAnswers((prev) => {
      const next = [...prev];
      next[i] = n;
      return next;
    });
  }

  function next() {
    if (i + 1 >= QUESTIONS.length) {
      const final = answers.map((a, idx) => (idx === i ? picked : a));
      const total = final.reduce<number>((n, a, idx) => n + (a === QUESTIONS[idx].answer ? 1 : 0), 0);
      saveQuiz(total, QUESTIONS.length);
      setDone(true);
      return;
    }
    setI((n) => n + 1);
    setPicked(answers[i + 1]);
  }

  function restart() {
    setI(0);
    setPicked(null);
    setAnswers(QUESTIONS.map(() => null));
    setDone(false);
  }

  if (done) {
    return (
      <ScienceShell className="max-w-2xl">
        <p className="text-xs font-medium tracking-[0.16em] text-forest uppercase">Check-it</p>
        <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">
          You scored {score} of {QUESTIONS.length}
        </h1>
        <p className="mt-3 text-ink-soft">
          {score >= 16
            ? "Strong grasp of forces, landforms, circuits, and rock processes."
            : score >= 10
              ? "Solid start. Revisit the labs that match the items you missed."
              : "Walk back through the unit labs, then try again."}
        </p>
        <div className="mt-6 space-y-3">
          {QUESTIONS.map((item, idx) => {
            const pick = answers[idx];
            const ok = pick === item.answer;
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <p className="text-sm font-medium leading-snug">
                    {idx + 1}. {item.prompt}
                  </p>
                  <p className={`mt-2 text-sm ${ok ? "text-good" : "text-bad"}`}>
                    {ok ? "Correct. " : `Your answer: ${item.choices[pick ?? 0]}. `}
                    {item.why}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Button className="mt-6" onClick={restart}>
          Try again
        </Button>
      </ScienceShell>
    );
  }

  return (
    <ScienceShell>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-[0.16em] text-forest uppercase">Check it · STAAR-style</p>
        <span className="text-sm text-muted tabular-nums">
          {i + 1} / {QUESTIONS.length}
        </span>
      </div>
      <p className="mt-2 text-sm text-faint">
        {mounted && saved ? `Last score ${saved.score}/${saved.total}` : "No saved score yet"}
      </p>
      <Badge className="mt-4">{q.teks}</Badge>
      <h1 className="mt-3 max-w-2xl font-display text-2xl font-semibold tracking-tight sm:text-3xl">{q.prompt}</h1>
      <div className="mt-6 grid gap-2">
        {q.choices.map((choice, n) => {
          const isPick = picked === n;
          const isRight = locked && n === q.answer;
          const isWrong = locked && isPick && n !== q.answer;
          return (
            <button
              key={choice}
              type="button"
              onClick={() => choose(n)}
              className={`flex min-h-12 items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                isRight
                  ? "border-good bg-good-soft text-ink"
                  : isWrong
                    ? "border-bad bg-bad-soft text-ink"
                    : isPick
                      ? "border-forest bg-forest-soft"
                      : "border-line bg-surface hover:border-line-strong"
              }`}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-paper text-xs font-medium">
                {LETTERS[n]}
              </span>
              <span className="pt-0.5">{choice}</span>
            </button>
          );
        })}
      </div>
      {locked ? (
        <Card className="mt-5">
          <CardContent className="p-5">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">
              {picked === q.answer ? "Correct" : "Not quite"}
            </p>
            <p className="mt-2 text-sm text-ink-soft">{q.why}</p>
            <Button className="mt-4" onClick={next}>
              {i + 1 >= QUESTIONS.length ? "See score" : "Next"}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </ScienceShell>
  );
}
