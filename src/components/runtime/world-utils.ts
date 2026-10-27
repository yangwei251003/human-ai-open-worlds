import type { WorldKey } from "@/data/types";

export function worldFromPath(pathname: string): WorldKey {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (segment === "projects" || segment === "honors" || segment === "resume" || segment === "journal" || segment === "cinema" || segment === "gallery") {
    return segment;
  }
  return "home";
}
