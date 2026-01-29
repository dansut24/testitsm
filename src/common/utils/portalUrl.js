// src/common/utils/portalUrl.js

const ROOT_HOSTS = new Set(["hi5tech.co.uk", "www.hi5tech.co.uk"]);

const MODULE_HOST_SUFFIXES = [
  { module: "itsm", token: "-itsm" },
  { module: "control", token: "-control" },
  { module: "self", token: "-self" },
];

// Minimal public-suffix handling (enough to fix .co.uk etc)
const MULTI_PART_TLDS = new Set([
  "co.uk",
  "org.uk",
  "ac.uk",
  "gov.uk",
  "ltd.uk",
  "plc.uk",
  "net.uk",
]);

function getHost() {
  return window.location.hostname || "";
}

function getProtocol() {
  return window.location.protocol || "https:";
}

function getRegistrableDomain(host) {
  // Returns the base domain:
  // demoitsm.hi5tech.co.uk -> hi5tech.co.uk
  // demoitsm-control.hi5tech.com -> hi5tech.com
  const parts = String(host || "").split(".").filter(Boolean);
  if (parts.length <= 2) return host;

  const last2 = parts.slice(-2).join(".");
  const last3 = parts.slice(-3).join(".");

  // If TLD is multi-part (co.uk), registrable domain uses last 3 labels
  if (MULTI_PART_TLDS.has(last2)) {
    return last3; // e.g. hi5tech.co.uk
  }

  // Normal TLD (com/net/etc) uses last 2 labels
  return last2;
}

function parseTenantFromHost(host) {
  const h = String(host || "").trim();
  if (!h) return { tenantSlug: null, module: null, rootDomain: null };

  if (ROOT_HOSTS.has(h)) return { tenantSlug: null, module: null, rootDomain: h };

  const rootDomain = getRegistrableDomain(h);

  // first label: demoitsm-itsm OR demoitsm
  const firstLabel = h.split(".")[0] || "";
  const found = MODULE_HOST_SUFFIXES.find((x) => firstLabel.endsWith(x.token));

  if (found) {
    const tenantSlug = firstLabel.slice(0, -found.token.length);
    return { tenantSlug: tenantSlug || null, module: found.module, rootDomain };
  }

  // tenant base host: demoitsm.hi5tech.co.uk
  return { tenantSlug: firstLabel || null, module: null, rootDomain };
}

export function appendQueryParams(urlString, params = {}) {
  try {
    const u = new URL(urlString, window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      u.searchParams.set(k, String(v));
    });
    return u.toString();
  } catch {
    const sep = urlString.includes("?") ? "&" : "?";
    const qp = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");
    return qp ? `${urlString}${sep}${qp}` : urlString;
  }
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
 *  - "/itsm" | "/control" | "/self"
 */
export function getCentralLoginUrl(redirectPath = "/") {
  const base = getTenantBaseUrl();
  const qp = encodeURIComponent(redirectPath || "/");
  return `${base}/login?redirect=${qp}`;
}

/**
 * Central logout URL on tenant base host.
 * Useful as a single redirect target from module portals.
 */
export function getCentralLogoutUrl() {
  const base = getTenantBaseUrl();
  return `${base}/logout`;
}
