import { createFileRoute, Navigate } from "@tanstack/react-router";
import { isScienceTeks } from "@/lib/subjects";

export const Route = createFileRoute("/practice/$teks")({ component: LegacyPractice });

function LegacyPractice() {
  const { teks } = Route.useParams();
  if (isScienceTeks(teks)) {
    return <Navigate to="/science/practice/$teks" params={{ teks }} replace />;
  }
  return <Navigate to="/math/practice/$teks" params={{ teks }} replace />;
}
