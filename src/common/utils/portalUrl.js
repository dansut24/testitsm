// src/common/utils/portalUrl.js

export function getParentDomain() {
  const host = window.location.hostname || "";
  return host.split(".").slice(1).join(".");
}

// demoitsm-control.hi5tech.co.uk => demoitsm
// demoitsm-itsm.hi5tech.co.uk    => demoitsm
// demoitsm-self.hi5tech.co.uk    => demoitsm
// demoitsm.hi5tech.co.uk         => demoitsm
export function getTenantBase() {
  const host = window.location.hostname || "";
  const first = host.split(".")[0] || "";
  return first.replace(/-(control|itsm|self)$/i, "");
}

// Central portal base for the CURRENT tenant
export function getPortalBaseUrl() {
  const parent = getParentDomain();
  const tenantBase = getTenantBase();
  return `https://${tenantBase}.${parent}`;
}

// Central login URL; optional redirect param (e.g. /control, /itsm, /self-service)
export function getCentralLoginUrl(redirectPath = "/") {
  const portal = getPortalBaseUrl();
  const r = encodeURIComponent(redirectPath || "/");
  return `${portal}/login?redirect=${r}`;
}
