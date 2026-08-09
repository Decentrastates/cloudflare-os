import { pathToFileURL } from "node:url";

export function shouldCloseSignups({ freshDeployment }) {
  return freshDeployment;
}

export function resolveBootstrapState({
  volumeIdentity,
  completeIdentity,
  pendingIdentity,
  legacyDeployment,
}) {
  if (completeIdentity === volumeIdentity) return "existing";
  if (pendingIdentity === volumeIdentity) return "fresh";
  if (!completeIdentity && !pendingIdentity && legacyDeployment) return "legacy";
  return "fresh";
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [volumeIdentity, completeIdentity, pendingIdentity, legacyDeployment] =
    process.argv.slice(2);
  console.log(resolveBootstrapState({
    volumeIdentity,
    completeIdentity,
    pendingIdentity,
    legacyDeployment: legacyDeployment === "true",
  }));
}
