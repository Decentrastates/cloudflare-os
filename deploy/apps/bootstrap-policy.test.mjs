import assert from "node:assert/strict";
import test from "node:test";

import { resolveBootstrapState, shouldCloseSignups } from "./bootstrap-policy.mjs";

test("a fresh deployment closes the temporary public signup path", () => {
  assert.equal(shouldCloseSignups({ freshDeployment: true }), true);
});

test("an existing deployment preserves the administrator's signup setting", () => {
  assert.equal(shouldCloseSignups({ freshDeployment: false }), false);
});

test("creating a replacement administrator does not make an existing volume fresh", () => {
  assert.equal(
    shouldCloseSignups({ freshDeployment: false, accountCreated: true }),
    false,
  );
});

test("a complete marker only applies to the same Docker volume identity", () => {
  assert.equal(
    resolveBootstrapState({
      volumeIdentity: "volume-new",
      completeIdentity: "volume-old",
      pendingIdentity: "",
      legacyDeployment: true,
    }),
    "fresh",
  );
});

test("a pending marker keeps a failed first bootstrap fresh on retry", () => {
  assert.equal(
    resolveBootstrapState({
      volumeIdentity: "volume-one",
      completeIdentity: "",
      pendingIdentity: "volume-one",
      legacyDeployment: true,
    }),
    "fresh",
  );
});

test("an unmarked legacy deployment migrates without changing signup policy", () => {
  assert.equal(
    resolveBootstrapState({
      volumeIdentity: "volume-one",
      completeIdentity: "",
      pendingIdentity: "",
      legacyDeployment: true,
    }),
    "legacy",
  );
});
