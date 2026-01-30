// src/common/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

export const STORAGE_KEY = "hi5tech_sb_session";

// Cookie storage shared across subdomains (fixes cross-subdomain login issues)
function isLocalhost() {
  const h = window.location.hostname || "";
  return h === "localhost" || h === "127.0.0.1" || h.endsWith(".localhost");
}

function getCookieDomain() {
  // For prod: .hi5tech.co.uk so all subdomains share session
  // For localhost: omit domain (browsers reject .localhost in many cases)
  if (isLocalhost()) return null;
  return ".hi5tech.co.uk";
}

function setCookie(name, value, { maxAgeSeconds } = {}) {
  const domain = getCookieDomain();
  const secure = window.location.protocol === "https:" && !isLocalhost();

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; SameSite=Lax`;

  if (domain) cookie += `; Domain=${domain}`;
  if (secure) cookie += `; Secure`;
  if (typeof maxAgeSeconds === "number") cookie += `; Max-Age=${maxAgeSeconds}`;

  document.cookie = cookie;
}

function getCookie(name) {
  const target = `${encodeURIComponent(name)}=`;
  const parts = (document.cookie || "").split("; ");
  for (const p of parts) {
    if (p.startsWith(target)) return decodeURIComponent(p.slice(target.length));
  }
  return null;
}

function deleteCookie(name) {
  // delete for current host
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax`;

  // delete for shared domain too (if applicable)
  const domain = getCookieDomain();
  if (domain) {
    document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; Domain=${domain}; SameSite=Lax`;
  }
}

// Supabase storage adapter (cookie-based)
const cookieStorage = {
  getItem: (key) => {
    try {
      return getCookie(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      // Keep long enough for refresh token usage. Adjust if you want.
      setCookie(key, value, { maxAgeSeconds: 60 * 60 * 24 * 30 }); // 30 days
    } catch {
      // ignore
    }
  },
  removeItem: (key) => {
    try {
      deleteCookie(key);
    } catch {
      // ignore
    }
  },
};

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: STORAGE_KEY,
    storage: cookieStorage, // ✅ critical
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
