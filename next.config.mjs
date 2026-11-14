/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: the app is plain files that run offline as a PWA (DECISIONS.md).
  output: "export",
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
