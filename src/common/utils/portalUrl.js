// src/common/utils/portalUrl.js

function getParentDomain() {
  const host = window.location.hostname || "";
  return host.split(".").slice(1).join(".");
}

function stripModuleSuffixFromTenantBase(firstLabel) {
  return String(firstLabel || "").replace(/-(control|itsm|self)$/i, "");
}

function getTenantBase() {
  const host = window.location.hostname || "";
  const first = host.split(".")[0] || "";
  return stripModuleSuffixFromTenantBase(first);
}

/**
 * Returns the central login URL for the current tenant, e.g.
 *   https://demoitsm.hi5tech.co.uk/login?redirect=/itsm
 */
export function getCentralLoginUrl(redirectPath = "/") {
  const tenantBase = getTenantBase();
  const parent = getParentDomain();

  const redirect = String(redirectPath || "/").startsWith("/")
    ? String(redirectPath || "/")
    : `/${redirectPath}`;

  return `https://${tenantBase}.${parent}/login?redirect=${encodeURIComponent(redirect)}`;
}
