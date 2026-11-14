import { test } from "node:test";
import assert from "node:assert/strict";
import { appPathname, publicAssetPath } from "./basePath.js";

test("public assets work at the local root and under the hosted repository path", () => {
  assert.equal(publicAssetPath("sql-wasm.js", ""), "/sql-wasm.js");
  assert.equal(publicAssetPath("/sql-wasm.wasm", "/ATHENA"), "/ATHENA/sql-wasm.wasm");
});

test("app pathname removes the deployment prefix and trailing slash", () => {
  assert.equal(appPathname("/summary/", ""), "/summary");
  assert.equal(appPathname("/ATHENA/summary/", "/ATHENA"), "/summary");
  assert.equal(appPathname("/ATHENA/", "/ATHENA"), "/");
});
