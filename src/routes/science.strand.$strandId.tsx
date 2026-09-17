import { createFileRoute } from "@tanstack/react-router";
import { StrandBoard } from "@/components/strand-board";

export const Route = createFileRoute("/science/strand/$strandId")({ component: ScienceStrand });

function ScienceStrand() {
  const { strandId } = Route.useParams();
  return <StrandBoard subject="science" strandId={strandId} />;
}
