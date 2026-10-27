/** Prefix public assets and plain anchors; Next Link handles its own basePath. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export function publicPath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${basePath}${path}`;
}
