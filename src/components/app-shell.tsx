import { Link, useRouterState } from "@tanstack/react-router";
import { Calculator, ChartColumn, FlaskConical, House } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useProgress } from "@/lib/progress-store";
import { cn } from "@/lib/utils";

export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  const name = useProgress((s) => s.name);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onMath = pathname === "/math" || pathname.startsWith("/math/");
  const onScience = pathname === "/science" || pathname.startsWith("/science/");
  const onProgress = pathname === "/progress";

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-baseline gap-2 no-underline">
            <span className="font-display text-lg font-semibold italic tracking-tight text-forest">Hack’s</span>
            <span className="font-display text-lg font-medium tracking-tight text-ink">Hacks</span>
          </Link>
          <nav className="flex items-center gap-0.5">
            {mounted && name ? (
              <span className="mr-2 hidden max-w-32 truncate text-xs text-muted sm:inline">{name}</span>
            ) : null}
            <Link
              to="/"
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink",
                pathname === "/" && "bg-paper text-ink",
              )}
              aria-label="Home"
            >
              <House className="size-4" />
            </Link>
            <Link
              to="/math"
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink",
                onMath && "bg-paper text-forest",
              )}
              aria-label="Math Hacks"
            >
              <Calculator className="size-4" />
            </Link>
            <Link
              to="/science"
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink",
                onScience && "bg-paper text-forest",
              )}
              aria-label="Science Hacks"
            >
              <FlaskConical className="size-4" />
            </Link>
            <Link
              to="/progress"
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink",
                onProgress && "bg-paper text-ink",
              )}
              aria-label="Progress"
            >
              <ChartColumn className="size-4" />
            </Link>
          </nav>
        </div>
      </header>
      <main className={cn("mx-auto w-full max-w-5xl px-4 py-6 sm:py-8", className)}>{children}</main>
    </div>
  );
}
