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

function normalizeModuleForHost(module) {
  const m = String(module || "").toLowerCase().trim();
  if (m === "self_service" || m === "self-service" || m === "selfservice" || m === "self") return "self";
  if (m === "rmm") return "control";
  return m;
}

function getRegistrableDomain(host) {
  const parts = String(host || "").split(".").filter(Boolean);
  if (parts.length <= 2) return host;

  const last2 = parts.slice(-2).join(".");
  const last3 = parts.slice(-3).join(".");

  if (MULTI_PART_TLDS.has(last2)) return last3;
  return last2;
}

function parseTenantFromHost(host) {
  const h = String(host || "").trim();
  if (!h) return { tenantSlug: null, module: null, rootDomain: null };

  if (ROOT_HOSTS.has(h)) return { tenantSlug: null, module: null, rootDomain: h };

  const rootDomain = getRegistrableDomain(h);
  const firstLabel = h.split(".")[0] || "";
  const found = MODULE_HOST_SUFFIXES.find((x) => firstLabel.endsWith(x.token));

  if (found) {
    const tenantSlug = firstLabel.slice(0, -found.token.length);
    return { tenantSlug: tenantSlug || null, module: found.module, rootDomain };
  }

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

export function getTenantBaseUrl() {
  const { tenantSlug, rootDomain } = parseTenantFromHost(getHost());
  if (!tenantSlug || !rootDomain) return `${getProtocol()}//${getHost()}`;
  return `${getProtocol()}//${tenantSlug}.${rootDomain}`;
}

export function getModuleBaseUrl(module) {
  const { tenantSlug, rootDomain } = parseTenantFromHost(getHost());
  if (!tenantSlug || !rootDomain) return `${getProtocol()}//${getHost()}`;

  const token = normalizeModuleForHost(module);
  return `${getProtocol()}//${tenantSlug}-${token}.${rootDomain}`;
}

export function getCentralLoginUrl(redirectPath = "/") {
  const base = getTenantBaseUrl();
  const qp = encodeURIComponent(redirectPath || "/");
  return `${base}/login?redirect=${qp}`;
}

export function getCentralLogoutUrl() {
  const base = getTenantBaseUrl();
  return `${base}/logout`;
}
