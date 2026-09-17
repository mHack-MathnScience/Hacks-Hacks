import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { labRecord, useLabStore } from "@/lib/science/lab-store";
import { LAB_UNITS, neighbors, type LabDef } from "@/lib/science/labs";
import { cn } from "@/lib/utils";

export function LabFrame({ lab, children }: { lab: LabDef; children: ReactNode }) {
  const byLab = useLabStore((s) => s.byLab);
  const rec = labRecord(byLab, lab.id);
  const saveClaim = useLabStore((s) => s.saveClaim);
  const markFinished = useLabStore((s) => s.markFinished);
  const [claim, setClaim] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setClaim(useLabStore.getState().byLab[lab.id]?.claim ?? "");
  }, [lab.id]);

  const { prev, next } = neighbors(lab.id);
  const done = mounted && rec.finished;

  return (
    <div>
      <Link
        to="/science/labs/$unit"
        params={{ unit: lab.unit }}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        {LAB_UNITS.find((u) => u.id === lab.unit)?.title ?? "Labs"}
      </Link>

      <p className="text-xs font-medium tracking-[0.16em] text-forest uppercase">{lab.kicker}</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{lab.title}</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">{lab.teksPlain}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {lab.teks.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
        <span className="text-xs text-faint">{lab.duration}</span>
        {done ? (
          <Badge variant="readiness" className="normal-case tracking-normal">
            Finished
          </Badge>
        ) : null}
      </div>
      <p className="mt-4 text-sm text-ink">
        <span className="font-medium">Investigate: </span>
        {lab.question}
      </p>

      <div className="mt-6">{children}</div>

      <Card className="mt-6">
        <CardContent className="p-5">
          <label htmlFor="claim" className="text-xs font-medium tracking-wide text-muted uppercase">
            Claim — evidence — reasoning
          </label>
          <textarea
            id="claim"
            value={mounted ? claim : ""}
            onChange={(e) => setClaim(e.target.value)}
            rows={3}
            placeholder="I think… because in the lab I saw…"
            className="mt-2 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-forest"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => saveClaim(lab.id, claim)}>
              Save claim
            </Button>
            <Button onClick={() => markFinished(lab.id)} disabled={done}>
              <Check className="size-4" />
              {done ? "Finished" : "Mark finished"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap justify-between gap-2">
        {prev ? (
          <Button asChild variant="secondary">
            <Link to="/science/lab/$labId" params={{ labId: prev.id }}>
              <ArrowLeft className="size-4" />
              {prev.title}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild>
            <Link to="/science/lab/$labId" params={{ labId: next.id }}>
              Next: {next.title}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cn("overflow-hidden rounded-xl border border-line bg-paper", className)}>{children}</div>;
}

export function ChallengeList({ items }: { items: Array<{ ok: boolean; text: string }> }) {
  return (
    <ul className="mt-5 space-y-1.5 text-sm">
      <li className="text-xs font-medium tracking-wide text-muted uppercase">Challenges</li>
      {items.map((it) => (
        <li key={it.text} className="flex gap-2">
          <span className={it.ok ? "text-good" : "text-faint"} aria-hidden>
            {it.ok ? "✓" : "○"}
          </span>
          <span className={it.ok ? "text-ink" : "text-muted"}>{it.text}</span>
        </li>
      ))}
    </ul>
  );
}
