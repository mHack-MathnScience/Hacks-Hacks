import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

/** The game is a static folder. Vite drops the trailing slash, so this route sends that address to the folder index. */
export const Route = createFileRoute("/design-a-world")({
  beforeLoad: () => {
    throw redirect({ href: "/design-a-world/index.html" });
  },
  component: DesignWorldRedirect,
});

function DesignWorldRedirect() {
  useEffect(() => {
    window.location.replace("/design-a-world/index.html");
  }, []);
  return null;
}
