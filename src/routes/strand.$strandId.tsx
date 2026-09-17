import { createFileRoute, Navigate } from "@tanstack/react-router";
import { isScienceTeks } from "@/lib/subjects";

export const Route = createFileRoute("/strand/$strandId")({ component: LegacyStrand });

function LegacyStrand() {
  const { strandId } = Route.useParams();
  if (isScienceTeks(strandId)) {
    return <Navigate to="/science/strand/$strandId" params={{ strandId }} replace />;
  }
  return <Navigate to="/math/strand/$strandId" params={{ strandId }} replace />;
}
