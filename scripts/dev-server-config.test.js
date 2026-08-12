import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "jsonc-parser";

import * as devServerConfig from "./dev-server-config.js";

const { getWranglerPortFromBackendHost } = devServerConfig;
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

describe("getWranglerPortFromBackendHost", () => {
  it("extracts a port from a localhost backend host", () => {
    assert.equal(getWranglerPortFromBackendHost("localhost:9000"), "9000");
  });

  it("extracts a port from an IPv6 backend host", () => {
    assert.equal(getWranglerPortFromBackendHost("[::1]:9001"), "9001");
  });

  it("returns null when the backend host has no port", () => {
    assert.equal(getWranglerPortFromBackendHost("localhost"), null);
  });

  it("rejects invalid ports", () => {
    assert.throws(
        () => getWranglerPortFromBackendHost("localhost:99999"),
        /VITE_BACKEND_HOST must include a valid port/);
  });

  it("rejects invalid IPv6 ports", () => {
    assert.throws(
        () => getWranglerPortFromBackendHost("[::1]:99999"),
        /VITE_BACKEND_HOST must include a valid port/);
  });

  it("rejects port zero", () => {
    assert.throws(
        () => getWranglerPortFromBackendHost("localhost:0"),
        /VITE_BACKEND_HOST must include a valid port/);
  });

  it("rejects invalid hosts", () => {
    assert.throws(
        () => getWranglerPortFromBackendHost("http://localhost:9000"),
        /VITE_BACKEND_HOST must include a valid host/);
  });
});

describe("getGatekeeperBaseUrl", () => {
  it("maps a production public URL to the gatekeeper callback origin", () => {
    assert.equal(
        devServerConfig.getGatekeeperBaseUrl?.(
            "https://cloudflare-os.cddao.com", "gatekeeper-google"),
        "https://cloudflare-os.cddao.com/gatekeeper/google");
  });

  it("normalizes a trailing slash on the public URL", () => {
    assert.equal(
        devServerConfig.getGatekeeperBaseUrl?.(
            "https://cloudflare-os.cddao.com/", "gatekeeper-github"),
        "https://cloudflare-os.cddao.com/gatekeeper/github");
  });

  it("leaves local development defaults unchanged when no public URL is configured", () => {
    assert.equal(
        devServerConfig.getGatekeeperBaseUrl?.(undefined, "gatekeeper-google"),
        null);
  });
});

describe("createGatekeeperDevConfig", () => {
  it("injects the production base URL into every discovered gatekeeper config", () => {
    const packagesDir = join(ROOT, "packages");
    const gatekeepers = readdirSync(packagesDir)
        .filter(name => name.startsWith("gatekeeper-"))
        .filter(name => statSync(join(packagesDir, name, "wrangler.jsonc")).isFile());

    assert.ok(gatekeepers.length > 0);
    for (const name of gatekeepers) {
      const dir = join(packagesDir, name);
      const source = parse(readFileSync(join(dir, "wrangler.jsonc"), "utf8"));
      const generated = devServerConfig.createGatekeeperDevConfig?.(
          source, { name, dir }, "https://cloudflare-os.cddao.com");
      assert.equal(
          generated?.vars?.BASE_URL,
          `https://cloudflare-os.cddao.com/gatekeeper/${name.slice("gatekeeper-".length)}`,
          `${name} must receive its production BASE_URL`);
    }
  });

  it("preserves an existing local base URL when no public URL is configured", () => {
    const generated = devServerConfig.createGatekeeperDevConfig?.(
        { vars: { BASE_URL: "http://localhost:8787/gatekeeper/google" } },
        { name: "gatekeeper-google", dir: "/tmp/gatekeeper-google" },
        undefined);

    assert.equal(
        generated?.vars?.BASE_URL,
        "http://localhost:8787/gatekeeper/google");
  });
});
