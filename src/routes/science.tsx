import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/science")({ component: ScienceLayout });

function ScienceLayout() {
  return <Outlet />;
}
