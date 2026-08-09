import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";

const require = createRequire(import.meta.url);
const packageJson = JSON.parse(
  await readFile(new URL("../../package.json", import.meta.url), "utf8"),
);
const wranglerPackagePath = require.resolve("wrangler/package.json");
const wranglerRequire = createRequire(wranglerPackagePath);
const wranglerPackageJson = require(wranglerPackagePath);
const miniflarePackageJson = wranglerRequire("miniflare/package.json");
const workerdPackageJson = wranglerRequire("workerd/package.json");

test("self-hosted runtime pins Wrangler before the local D1 crash regression", () => {
  assert.equal(
    packageJson.devDependencies.wrangler,
    "4.112.0",
    "Wrangler 4.114+ can terminate the multi-worker local runtime on concurrent D1 writes",
  );
  assert.equal(wranglerPackageJson.version, "4.112.0");
  assert.equal(miniflarePackageJson.version, "4.20260714.0");
  assert.equal(workerdPackageJson.version, "1.20260714.1");
});
