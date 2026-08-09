import { createRequire } from "node:module";

import { shouldCloseSignups } from "./bootstrap-policy.mjs";

// Resolve dependencies from the frontend workspace; pnpm intentionally does not hoist them to the
// repository root in the runtime image.
const require = createRequire(new URL("../../packages/workshop-frontend/package.json", import.meta.url));
const { newWebSocketRpcSession } = require("capnweb");
const { argon2id } = require("hash-wasm");
const SERVICE_SALT = new Uint8Array([
  0xd9, 0x4e, 0x54, 0x1d, 0x29, 0xc1, 0x03, 0x74,
  0x73, 0x7e, 0xb3, 0xe3, 0x34, 0x6d, 0x8f, 0x21,
]);

const username = process.env.CLOUDFLARE_OS_BOOTSTRAP_USERNAME;
const password = process.env.CLOUDFLARE_OS_BOOTSTRAP_PASSWORD;
const freshDeployment = process.env.CLOUDFLARE_OS_FRESH_BOOTSTRAP === "true";

if (!username || !password) throw new Error("Bootstrap credentials are required.");

const usernameBytes = new TextEncoder().encode(username);
const salt = new Uint8Array(SERVICE_SALT.length + usernameBytes.length);
salt.set(SERVICE_SALT);
salt.set(usernameBytes, SERVICE_SALT.length);

const passwordHash = await argon2id({
  password,
  salt,
  parallelism: 1,
  iterations: 3,
  memorySize: 65536,
  hashLength: 32,
  outputType: "binary",
});

const publicApi = newWebSocketRpcSession("ws://127.0.0.1:8787/api");
try {
  // Authenticate first so redeployments preserve the administrator's current signup setting.
  // Only a fresh volume needs the short-lived account-creation path and automatic signup closure.
  let token = await publicApi.login(username, passwordHash);
  const accountCreated = !token;
  if (accountCreated) token = await publicApi.createAccount(username, username, passwordHash);
  if (!token) throw new Error("Bootstrap administrator authentication failed.");

  const authenticatedApi = publicApi.authenticate(token, "en");
  if (!await authenticatedApi.amIAdmin()) {
    throw new Error("Bootstrap account was not granted deployment-admin access.");
  }
  const adminApi = await authenticatedApi.getAdminApi();
  if (!adminApi) throw new Error("Admin capability was not returned.");
  if (shouldCloseSignups({ freshDeployment })) {
    await adminApi.setSignupsEnabled(false);
  }

  const config = await publicApi.getServerConfig();
  if (freshDeployment && config.signupsEnabled) {
    throw new Error("New-account registration is still enabled after fresh-volume bootstrap.");
  }
  console.log(
    freshDeployment
      ? "Bootstrap administrator verified; public sign-ups are closed."
      : `Bootstrap administrator verified; public sign-ups remain ${config.signupsEnabled ? "enabled" : "disabled"}.`,
  );
} finally {
  publicApi[Symbol.dispose]();
}
