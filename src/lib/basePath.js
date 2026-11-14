// Build-time path helpers. Local builds use ""; GitHub Pages uses "/ATHENA".
// next/link and useRouter apply Next's basePath automatically; public files loaded by
// plain browser APIs (sql.js/WASM) need the prefix explicitly.

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function publicAssetPath(path, basePath = BASE_PATH) {
  const cleanPath = String(path).replace(/^\/+/, "");
  const cleanBase = normaliseBasePath(basePath);
  return `${cleanBase}/${cleanPath}`;
}

/** Returns an app-relative pathname regardless of host base path or trailing slash. */
export function appPathname(pathname, basePath = BASE_PATH) {
  let result = String(pathname || "/");
  const cleanBase = normaliseBasePath(basePath);
  if (cleanBase && (result === cleanBase || result.startsWith(`${cleanBase}/`))) {
    result = result.slice(cleanBase.length) || "/";
  }
  if (result.length > 1) result = result.replace(/\/+$/, "");
  return result || "/";
}

function normaliseBasePath(value) {
  const text = String(value || "").trim();
  if (!text || text === "/") return "";
  return `/${text.replace(/^\/+|\/+$/g, "")}`;
}
