// src/common/utils/tenantHost.js

/**
 * Your hosts:
 *  - tenant:  demoitsm.hi5tech.co.uk
 *  - modules: demoitsm-itsm.hi5tech.co.uk, demoitsm-control.hi5tech.co.uk, demoitsm-self.hi5tech.co.uk
 */

export function getHost() {
  return window.location.hostname || "";
}

export function getProtocol() {
  // Keeps localhost/http working without hardcoding https
  return window.location.protocol || "https:";
}

export function isModuleHost(host = getHost()) {
  return host.includes("-itsm.") || host.includes("-control.") || host.includes("-self.");
}

/**
 * Converts:
 *  demoitsm-itsm.hi5tech.co.uk -> demoitsm.hi5tech.co.uk
 *  demoitsm-control.hi5tech.co.uk -> demoitsm.hi5tech.co.uk
 *  demoitsm-self.hi5tech.co.uk -> demoitsm.hi5tech.co.uk
 */
export function getTenantBaseHost(host = getHost()) {
  return host.replace("-itsm.", ".").replace("-control.", ".").replace("-self.", ".");
}

export function getTenantSlugFromHost(host = getHost()) {
  const base = getTenantBaseHost(host);
  return (base.split(".")[0] || "").trim();
}

/**
 * Builds module host from tenant base host:
 *  base: demoitsm.hi5tech.co.uk
 *  module: itsm/control/self
 */
export function buildModuleHost(tenantBaseHost, module) {
  const parts = tenantBaseHost.split(".");
  const tenantSlug = parts.shift();
  const rest = parts.join(".");

  const m = module === "self_service" ? "self" : module; // normalize
  return `${tenantSlug}-${m}.${rest}`;
}

export function buildTenantLoginUrl(redirectPath = "/app") {
  const baseHost = getTenantBaseHost(getHost());
  const url = new URL(`${getProtocol()}//${baseHost}/login`);
  url.searchParams.set("redirect", redirectPath);
  return url.toString();
}

export function buildModuleUrlFromTenantHost(tenantBaseHost, module) {
  const moduleHost = buildModuleHost(tenantBaseHost, module);
  return `${getProtocol()}//${moduleHost}/`;
}
