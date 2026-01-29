/**
 * Centralized helpers for building cross-portal URLs.
 *
 * Notes:
 * - Works whether you run on root domain (tenantless) or tenant subdomains.
 * - Uses Vite env var if present, otherwise derives from window.location.
 */

const trimTrailingSlash = (s) => (s || "").replace(/\/+$/, "");
const ensureLeadingSlash = (s) => (s?.startsWith("/") ? s : `/${s || ""}`);

/**
 * Returns the base origin for the "central" portal (where /login lives).
 *
 * Priority:
 * 1) VITE_CENTRAL_PORTAL_ORIGIN (e.g. https://demoitsm.hi5tech.co.uk)
 * 2) current origin
 */
export function getCentralPortalOrigin() {
  const env = import.meta?.env?.VITE_CENTRAL_PORTAL_ORIGIN;
  if (env) return trimTrailingSlash(env);
  return trimTrailingSlash(window.location.origin);
}

/**
 * Safe query builder.
 */
function toQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const q = sp.toString();
  return q ? `?${q}` : "";
}

/**
 * Central login URL.
 * Example:
 *  getCentralLoginUrl("/itsm") -> https://<central>/login?redirect=%2Fitsm
 */
export function getCentralLoginUrl(redirectPath = "/app") {
  const origin = getCentralPortalOrigin();
  const redirect = ensureLeadingSlash(redirectPath);
  return `${origin}/login${toQuery({ redirect })}`;
}

/**
 * Central landing page (module chooser) URL.
 */
export function getCentralLandingUrl() {
  const origin = getCentralPortalOrigin();
  return `${origin}/app`;
}

/**
 * Central logout URL.
 *
 * IMPORTANT:
 * We route through the portal's /logout route (which does supabase signOut +
 * clears storage + finally redirects to /login?logout=1). This avoids the
 * common bug where callers try to append '?logout=1' to an existing URL that
 * already has query params (leading to broken redirect querystrings).
 */
export function getCentralLogoutUrl() {
  const origin = getCentralPortalOrigin();
  return `${origin}/logout`;
}

/**
 * Optional helpers to build module-specific origins if your deployment uses
 * separate subdomains. If you use path-based routing only, these are unused.
 *
 * If you *do* have separate origins, set env vars like:
 *  VITE_ITSM_PORTAL_ORIGIN=https://demoitsm-itsm.hi5tech.co.uk
 *  VITE_CONTROL_PORTAL_ORIGIN=https://demoitsm-control.hi5tech.co.uk
 *  VITE_SELFSERVICE_PORTAL_ORIGIN=https://demoitsm-selfservice.hi5tech.co.uk
 */
export function getItsmPortalOrigin() {
  const env = import.meta?.env?.VITE_ITSM_PORTAL_ORIGIN;
  if (env) return trimTrailingSlash(env);
  return trimTrailingSlash(window.location.origin);
}

export function getControlPortalOrigin() {
  const env = import.meta?.env?.VITE_CONTROL_PORTAL_ORIGIN;
  if (env) return trimTrailingSlash(env);
  return trimTrailingSlash(window.location.origin);
}

export function getSelfServicePortalOrigin() {
  const env = import.meta?.env?.VITE_SELFSERVICE_PORTAL_ORIGIN;
  if (env) return trimTrailingSlash(env);
  return trimTrailingSlash(window.location.origin);
}
