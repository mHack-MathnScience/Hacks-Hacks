import { createFileRoute } from "@tanstack/react-router";
import { PracticeSession } from "@/components/practice-session";

export const Route = createFileRoute("/math/practice/$teks")({ component: MathPractice });

function MathPractice() {
  const { teks } = Route.useParams();
  return <PracticeSession subject="math" teks={teks} />;
}
