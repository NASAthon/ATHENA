import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const cssDirectory = path.join(process.cwd(), "out", "_next", "static", "css");
const files = (await readdir(cssDirectory)).filter((file) => file.endsWith(".css"));

if (files.length === 0) {
  throw new Error(`No production CSS files found in ${cssDirectory}`);
}

// These Tailwind build directives are not browser CSS. Their presence means the
// wrong compiler built the export and browsers can render an unstyled document.
const uncompiledDirectives = /@(apply|custom-variant|theme)\b/;
const failures = [];

for (const file of files) {
  const css = await readFile(path.join(cssDirectory, file), "utf8");
  const match = css.match(uncompiledDirectives);
  if (match) failures.push(`${file}: contains uncompiled ${match[0]}`);
}

if (failures.length > 0) {
  throw new Error(`Production CSS is not fully compiled:\n${failures.join("\n")}`);
}

console.log(`Production CSS OK: ${files.length} compiled stylesheet${files.length === 1 ? "" : "s"}.`);
