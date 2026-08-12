export function getWranglerPortFromBackendHost(backendHost) {
  const trimmed = backendHost.trim();
  if (!trimmed) return null;
  if (trimmed.includes("://")) {
    throw new Error("VITE_BACKEND_HOST must include a valid host with an optional port.");
  }

  let url;
  try {
    url = new URL(`http://${trimmed}`);
  } catch {
    if (/(^.*\]:|^[^:]+:)[^:]+$/.test(trimmed)) {
      throw new Error("VITE_BACKEND_HOST must include a valid port between 1 and 65535.");
    }
    throw new Error("VITE_BACKEND_HOST must include a valid host with an optional port.");
  }

  if (!url.port) return null;

  const port = Number(url.port);
  if (port < 1) {
    throw new Error("VITE_BACKEND_HOST must include a valid port between 1 and 65535.");
  }

  return url.port;
}

export function getGatekeeperBaseUrl(publicBaseUrl, gatekeeperName) {
  if (publicBaseUrl === undefined || !publicBaseUrl.trim()) return null;

  const shortName = gatekeeperName.replace(/^gatekeeper-/, "");
  return `${publicBaseUrl.trim().replace(/\/+$/, "")}/gatekeeper/${shortName}`;
}

export function createGatekeeperDevConfig(sourceConfig, gatekeeper, publicBaseUrl) {
  const config = {
    ...sourceConfig,
    build: { ...sourceConfig.build, cwd: gatekeeper.dir },
  };
  if (sourceConfig.vars !== undefined) config.vars = { ...sourceConfig.vars };

  const baseUrl = getGatekeeperBaseUrl(publicBaseUrl, gatekeeper.name);
  if (baseUrl !== null) {
    config.vars = config.vars || {};
    config.vars.BASE_URL = baseUrl;
  }
  return config;
}
