// Copies the sql.js WebAssembly engine into public/ so it is served locally.
// ATHENA runs offline: never load it from a CDN (DECISIONS.md > Database).
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });
copyFileSync("node_modules/sql.js/dist/sql-wasm.wasm", "public/sql-wasm.wasm");
console.log("Copied sql-wasm.wasm to public/");
