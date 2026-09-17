import { createFileRoute } from "@tanstack/react-router";
import { StrandBoard } from "@/components/strand-board";

export const Route = createFileRoute("/math/strand/$strandId")({ component: MathStrand });

function MathStrand() {
  const { strandId } = Route.useParams();
  return <StrandBoard subject="math" strandId={strandId} />;
}
