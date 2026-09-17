import { createFileRoute } from "@tanstack/react-router";
import { SubjectHome } from "@/components/subject-home";

export const Route = createFileRoute("/math/")({ component: MathHome });

function MathHome() {
  return <SubjectHome subject="math" />;
}
