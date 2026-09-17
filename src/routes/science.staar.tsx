import { createFileRoute } from "@tanstack/react-router";
import { ScienceShell } from "@/components/science/science-shell";
import { SubjectHome } from "@/components/subject-home";

export const Route = createFileRoute("/science/staar")({ component: ScienceStaar });

function ScienceStaar() {
  return (
    <ScienceShell>
      <SubjectHome subject="science" framed hideBack />
    </ScienceShell>
  );
}
