import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ClipboardCheck, FlaskConical, GraduationCap, Layers, Mountain, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { labById, type LabUnit } from "@/lib/science/labs";
import { cn } from "@/lib/utils";

const ITEMS: Array<{ unit: LabUnit; label: string; icon: typeof FlaskConical }> = [
  { unit: "forces", label: "Forces", icon: FlaskConical },
  { unit: "landforms", label: "Landforms", icon: Mountain },
  { unit: "circuits", label: "Circuits", icon: Zap },
  { unit: "rocks", label: "Rocks", icon: Layers },
];

export function ScienceShell({ children, className }: { children: ReactNode; className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const labMatch = pathname.match(/\/science\/lab\/([^/]+)/);
  const currentLab = labMatch ? labById(labMatch[1] ?? "") : undefined;
  const unitMatch = pathname.match(/\/science\/labs\/([^/]+)/);
  const currentUnit = (unitMatch?.[1] ?? currentLab?.unit) as LabUnit | undefined;
  const onScienceHome = pathname === "/science" || pathname === "/science/";
  const onLab = Boolean(labMatch);

  return (
    <AppShell className={className}>
      <div className="-mx-4 -mt-6 mb-6 border-b border-line sm:-mt-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-0.5 px-4 py-1.5">
          <Link
            to="/science"
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm no-underline",
              onScienceHome ? "bg-paper text-forest" : "text-muted hover:bg-paper hover:text-ink",
            )}
          >
            Science
          </Link>
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const on = currentUnit === item.unit;
            return (
              <Link
                key={item.unit}
                to="/science/labs/$unit"
                params={{ unit: item.unit }}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm no-underline",
                  on ? "bg-paper text-forest" : "text-muted hover:bg-paper hover:text-ink",
                )}
              >
                <Icon className="size-3.5" />
                {item.label}
              </Link>
            );
          })}
          <span className="mx-1 hidden h-4 w-px bg-line sm:block" />
          <Link
            to="/science/notebook"
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm no-underline",
              pathname.includes("/notebook") ? "bg-paper text-forest" : "text-muted hover:bg-paper hover:text-ink",
            )}
          >
            <BookOpen className="size-3.5" />
            <span className="hidden sm:inline">Notebook</span>
          </Link>
          <Link
            to="/science/quiz"
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm no-underline",
              pathname.includes("/quiz") ? "bg-paper text-forest" : "text-muted hover:bg-paper hover:text-ink",
            )}
          >
            <ClipboardCheck className="size-3.5" />
            <span className="hidden sm:inline">Check it</span>
          </Link>
          <Link
            to="/science/teacher"
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm no-underline",
              pathname.includes("/teacher") ? "bg-paper text-forest" : "text-muted hover:bg-paper hover:text-ink",
            )}
          >
            <GraduationCap className="size-3.5" />
            <span className="hidden sm:inline">Teachers</span>
          </Link>
        </div>
      </div>
      {onLab ? null : (
        <Link
          to={onScienceHome ? "/" : "/science"}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          {onScienceHome ? "Hack’s Hacks" : "Science Hacks"}
        </Link>
      )}
      {children}
    </AppShell>
  );
}
