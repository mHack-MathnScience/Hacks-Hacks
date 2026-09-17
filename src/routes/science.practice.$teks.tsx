import { createFileRoute } from "@tanstack/react-router";
import { PracticeSession } from "@/components/practice-session";

export const Route = createFileRoute("/science/practice/$teks")({ component: SciencePractice });

function SciencePractice() {
  const { teks } = Route.useParams();
  return <PracticeSession subject="science" teks={teks} />;
}
