// Copies the sql.js engine into public/ so it is served locally and the app works offline.
// Never load it from a CDN (docs/DECISIONS.md › Database).
// - sql-wasm.wasm: the SQLite engine itself.
// - sql-wasm.js: its loader, loaded as a plain script by src/lib/db/index.js (not bundled,
//   because the bundler can't build its Node-only branches for the browser).
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });
for (const file of ["sql-wasm.wasm", "sql-wasm.js"]) {
  copyFileSync(`node_modules/sql.js/dist/${file}`, `public/${file}`);
  console.log(`Copied ${file} to public/`);
}
