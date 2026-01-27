// src/common/utils/portalUrl.js

const ROOT_HOSTS = new Set(["hi5tech.co.uk", "www.hi5tech.co.uk"]);

const MODULE_HOST_SUFFIXES = [
  { module: "itsm", token: "-itsm" },
  { module: "control", token: "-control" },
  { module: "self", token: "-self" },
];

function getHost() {
  return window.location.hostname || "";
}

function getProtocol() {
  return window.location.protocol || "https:";
}

function getRootDomainFromHost(host) {
  // e.g. demoitsm.hi5tech.co.uk -> hi5tech.co.uk
  const parts = String(host || "").split(".").filter(Boolean);
  if (parts.length < 2) return host;
  return parts.slice(-2).join(".");
}

function parseTenantFromHost(host) {
  const h = String(host || "");
  if (!h) return { tenantSlug: null, module: null, rootDomain: null };

  if (ROOT_HOSTS.has(h)) return { tenantSlug: null, module: null, rootDomain: h };

  const rootDomain = getRootDomainFromHost(h);

  // If host is something like demoitsm-itsm.hi5tech.co.uk -> tenantSlug=demoitsm module=itsm
  const firstLabel = h.split(".")[0] || ""; // demoitsm-itsm OR demoitsm
  const found = MODULE_HOST_SUFFIXES.find((x) => firstLabel.endsWith(x.token));

  if (found) {
    const tenantSlug = firstLabel.slice(0, -found.token.length);
    return { tenantSlug: tenantSlug || null, module: found.module, rootDomain };
  }

  // tenant base host: demoitsm.hi5tech.co.uk
  return { tenantSlug: firstLabel || null, module: null, rootDomain };
}

/**
 * Central tenant host (no module suffix)
 * e.g. https://demoitsm.hi5tech.co.uk
 */
export function getTenantBaseUrl() {
  const { tenantSlug, rootDomain } = parseTenantFromHost(getHost());
  if (!tenantSlug || !rootDomain) return `${getProtocol()}//${getHost()}`;
  return `${getProtocol()}//${tenantSlug}.${rootDomain}`;
}

/**
 * Module base URL
 * e.g. https://demoitsm-itsm.hi5tech.co.uk
 */
export function getModuleBaseUrl(module) {
  const { tenantSlug, rootDomain } = parseTenantFromHost(getHost());
  if (!tenantSlug || !rootDomain) return `${getProtocol()}//${getHost()}`;

  const mod = String(module || "").toLowerCase();
  const token =
    mod === "itsm" ? "itsm" : mod === "control" ? "control" : mod === "self" ? "self" : mod;

  return `${getProtocol()}//${tenantSlug}-${token}.${rootDomain}`;
}

/**
 * Central login URL on tenant base host.
 * redirectPath can be:
 *  - "/" (landing)
 *  - "/itsm" | "/control" | "/self" (meaning: go to that module host after login)
 */
export function getCentralLoginUrl(redirectPath = "/") {
  const base = getTenantBaseUrl();
  const qp = encodeURIComponent(redirectPath || "/");
  return `${base}/login?redirect=${qp}`;
}
