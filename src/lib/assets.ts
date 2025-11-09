// Build a URL for files under /public using Vite's base.
// Works in dev and on Lovable deploys.
export function publicUrl(path: string) {
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/+$/, "/")}${path.replace(/^\/+/, "")}`;
}
