import { createFileRoute, Link } from "@tanstack/react-router";
import { ScienceShell } from "@/components/science/science-shell";
import { Badge } from "@/components/ui/badge";
import { LABS } from "@/lib/science/labs";
import { LESSON_PATHS, MISCONCEPTIONS, TEKS_ROWS } from "@/lib/science/teacher";

export const Route = createFileRoute("/science/teacher")({ component: TeacherPage });

function TeacherPage() {
  return (
    <ScienceShell>
      <p className="text-xs font-medium tracking-[0.16em] text-forest uppercase">For teachers</p>
      <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">Science Hacks · Texas Grade 5</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Aligned to the science TEKS implemented in 2024 (assessed on STAAR Elementary Science from 2025–2026). Four
        units: forces (5.7), landforms (5.10C), circuits (5.8B / 5.8A), and sedimentary rock (5.10B). Students never see
        Newton’s laws by name.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Standards</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="py-2 pr-3">TEKS</th>
                <th className="py-2 pr-3">Student expectation</th>
                <th className="py-2">Lab</th>
              </tr>
            </thead>
            <tbody>
              {TEKS_ROWS.map((row) => (
                <tr key={row.teks} className="border-b border-line align-top">
                  <td className="py-3 pr-3 font-medium text-forest">{row.teks}</td>
                  <td className="py-3 pr-3 text-ink-soft">{row.expectation}</td>
                  <td className="py-3 text-ink">{row.labs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {LESSON_PATHS.map((path) => (
        <section key={path.title} className="mt-10">
          <h2 className="font-display text-2xl font-semibold">{path.title}</h2>
          <ol className="mt-4 space-y-4">
            {path.steps.map((step) => (
              <li key={step.name} className="rounded-xl border border-line bg-surface px-4 py-4">
                <p className="text-xs tracking-wide text-muted uppercase">{step.time}</p>
                <p className="mt-1 font-medium">{step.name}</p>
                <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Watch for these ideas</h2>
        <ul className="mt-4 space-y-3">
          {MISCONCEPTIONS.map((m) => (
            <li key={m.myth} className="rounded-xl border border-line bg-surface px-4 py-4">
              <p className="text-sm font-medium">“{m.myth}”</p>
              <p className="mt-1 text-sm text-ink-soft">{m.truth}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Labs at a glance</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {LABS.map((lab) => (
            <Link key={lab.id} to="/science/lab/$labId" params={{ labId: lab.id }} className="block no-underline">
              <div className="h-full rounded-xl border border-line bg-surface px-4 py-4 transition-[border-color] hover:border-line-strong">
                <div className="flex flex-wrap gap-1.5">
                  {lab.teks.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
                <p className="mt-2 font-display text-lg font-medium">{lab.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {lab.duration} · {lab.question}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </ScienceShell>
  );
}
