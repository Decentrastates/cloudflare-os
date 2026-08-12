import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = new URL("..", import.meta.url).pathname;

function composeConfig(composeFile) {
  const dir = mkdtempSync(join(tmpdir(), "bug-os-oauth-config-"));
  const oauthFile = join(dir, "oauth.env");
  writeFileSync(
      oauthFile,
      "GITHUB_CLIENT_ID=test-client-id\nGITHUB_CLIENT_SECRET=test-client-secret\n",
      { mode: 0o600 });

  try {
    return JSON.parse(execFileSync(
        "docker",
        ["compose", "-f", join(ROOT, composeFile), "config", "--format", "json"],
        {
          cwd: ROOT,
          encoding: "utf8",
          env: {
            ...process.env,
            CLOUDFLARE_OS_ADMINS: '["test-admin"]',
            CLOUDFLARE_OS_OAUTH_ENV_FILE: oauthFile,
          },
        }));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("self-hosted OAuth configuration", () => {
  function assertOrdered(source, first, second) {
    assert.match(source, new RegExp(first.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(source, new RegExp(second.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.ok(source.indexOf(first) < source.indexOf(second));
  }

  it("rejects project-local secrets and restores prior remote credentials", () => {
    const output = execFileSync("bash", [join(ROOT, "deploy/oauth-env.test.sh")], {
      cwd: ROOT,
      encoding: "utf8",
    });
    assert.match(output, /oauth env lifecycle passed/);
  });

  for (const composeFile of [
    "deploy/auto-macmini/compose.yml",
    "deploy/apps/compose.yml",
  ]) {
    it(`injects protected OAuth credentials through ${composeFile}`, () => {
      const config = composeConfig(composeFile);
      const environment = config.services["cloudflare-os"].environment;

      assert.equal(environment.GITHUB_CLIENT_ID, "test-client-id");
      assert.equal(environment.GITHUB_CLIENT_SECRET, "test-client-secret");
    });
  }

  it("keeps both compose files usable before OAuth credentials are installed", () => {
    for (const composeFile of [
      "deploy/auto-macmini/compose.yml",
      "deploy/apps/compose.yml",
    ]) {
      const output = execFileSync(
          "docker", ["compose", "-f", join(ROOT, composeFile), "config", "--format", "json"],
          {
            cwd: ROOT,
            encoding: "utf8",
            env: { ...process.env, CLOUDFLARE_OS_ADMINS: '["test-admin"]' },
          });
      assert.ok(JSON.parse(output).services["cloudflare-os"]);
    }
  });

  it("arms deployment rollback around every OAuth configuration switch", () => {
    const autoDeploy = readFileSync(
        join(ROOT, "deploy/auto-macmini/deploy.sh"), "utf8");
    const appsDeploy = readFileSync(join(ROOT, "deploy/apps/deploy.sh"), "utf8");

    const autoRemote = autoDeploy.slice(autoDeploy.indexOf("<<'REMOTE_DEPLOY'"));
    assert.match(autoDeploy, /ssh -o BatchMode=yes .* "bash -s" --/);
    assert.match(autoDeploy, /REMOTE_OAUTH_INCOMING="\$NO_OAUTH_UPDATE"/);
    assert.match(autoRemote, /if \[ "\$oauth_incoming" = __NO_OAUTH_UPDATE__ \]/);
    assert.match(autoDeploy, /trap cleanup_remote_incoming EXIT/);
    assertOrdered(autoRemote, "trap rollback_deployment ERR", "install_oauth_env");
    assertOrdered(
        autoRemote,
        "trap rollback_deployment ERR",
        'docker compose -f "$compose_file" build');
    assert.match(autoRemote, /\[ -n "\$oauth_incoming" \] && \[ -f "\$oauth_incoming" \]/);
    assert.doesNotMatch(autoRemote, /\[ -f "\$oauth_env\.incoming" \]/);
    assert.ok(autoRemote.lastIndexOf("trap - ERR") >
      autoRemote.indexOf("if ! wait_for_health"));

    assertOrdered(
        appsDeploy,
        "trap rollback_on_error ERR",
        'install_oauth_env "$oauth_incoming"');
    assertOrdered(
        appsDeploy,
        "trap rollback_on_error ERR",
        'docker load --input "$image_archive"');
    assert.match(appsDeploy, /oauth\.env\.incoming\.\$RELEASE_ID/);
    assert.match(appsDeploy, /REMOTE_OAUTH_INCOMING="\$NO_OAUTH_UPDATE"/);
    assert.match(appsDeploy, /if \[ "\$oauth_incoming" = __NO_OAUTH_UPDATE__ \]/);
    assert.match(appsDeploy, /oauth_upload_pending=true/);
    assert.match(appsDeploy, /\[ -n "\$oauth_incoming" \] && \[ -f "\$oauth_incoming" \]/);
    assert.doesNotMatch(appsDeploy, /\[ -f "\$oauth_env\.incoming" \]/);
    assert.ok(appsDeploy.lastIndexOf("trap - ERR") >
      appsDeploy.indexOf('"${compose[@]}" up -d --no-build'));
  });
});
