import { createFileRoute, Link } from "@tanstack/react-router";
import { LabFrame } from "@/components/science/lab-frame";
import { LabSim } from "@/components/science/lab-sims";
import { ScienceShell } from "@/components/science/science-shell";
import { labById } from "@/lib/science/labs";

export const Route = createFileRoute("/science/lab/$labId")({ component: LabPage });

function LabPage() {
  const { labId } = Route.useParams();
  const lab = labById(labId);
  if (!lab) {
    return (
      <ScienceShell>
        <p className="text-ink-soft">That lab isn’t here.</p>
        <Link to="/science" className="mt-3 inline-block text-sm text-forest">
          Back to Science Hacks
        </Link>
      </ScienceShell>
    );
  }
  return (
    <ScienceShell>
      <LabFrame lab={lab}>
        <LabSim id={lab.id} />
      </LabFrame>
    </ScienceShell>
  );
}
