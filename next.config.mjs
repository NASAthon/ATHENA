const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
if (basePath && (!basePath.startsWith("/") || basePath.endsWith("/"))) {
  throw new Error("NEXT_PUBLIC_BASE_PATH must start with one slash and have no trailing slash.");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: plain files for the local offline build and hosted evaluation copy.
  output: "export",
  basePath,
  // Directory routes work on static hosts without server-side rewrites.
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
