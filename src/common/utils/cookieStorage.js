// src/common/utils/cookieStorage.js

// Cookie limits are ~4096 bytes per cookie. Supabase session JSON can exceed this,
// especially for admin users / larger JWTs. So we chunk into multiple cookies.
//
// Stored cookies:
//   <key>.0, <key>.1, <key>.2, ...
//
// Notes:
// - We use encodeURIComponent to keep cookie-safe
// - We set Domain=.hi5tech.co.uk when on that domain so subdomains share auth
// - SameSite=None; Secure to avoid modern browser restrictions

function isHi5TechDomain(hostname) {
  return typeof hostname === "string" && hostname.endsWith("hi5tech.co.uk");
}

function cookieDomainAttr() {
  const host = window.location.hostname || "";
  if (isHi5TechDomain(host)) return "Domain=.hi5tech.co.uk; ";
  // For localhost / preview domains, don't set Domain
  return "";
}

function baseAttrs() {
  // SameSite=None requires Secure
  return `${cookieDomainAttr()}Path=/; Secure; SameSite=None;`;
}

function setCookie(name, value, maxAgeSeconds) {
  const maxAge = typeof maxAgeSeconds === "number" ? ` Max-Age=${maxAgeSeconds};` : "";
  document.cookie = `${name}=${value}; ${baseAttrs()}${maxAge}`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; ${baseAttrs()} Max-Age=0;`;
}

function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const prefix = `${name}=`;
  for (const c of cookies) {
    if (c.startsWith(prefix)) return c.substring(prefix.length);
  }
  return null;
}

function listChunkKeys(baseKey) {
  // read <baseKey>.0,1,2... until missing
  const keys = [];
  for (let i = 0; i < 50; i++) {
    const k = `${baseKey}.${i}`;
    const v = getCookie(k);
    if (v == null) break;
    keys.push(k);
  }
  return keys;
}

export function cookieStorage(baseKey, opts = {}) {
  const chunkSize = opts.chunkSize || 3800; // safe under 4KB after attrs
  const maxAgeSeconds = opts.maxAgeSeconds || 60 * 60 * 24 * 7; // 7 days

  return {
    getItem: (key) => {
      try {
        const keys = listChunkKeys(key);
        if (!keys.length) return null;

        const joined = keys
          .map((k) => getCookie(k) || "")
          .join("");

        if (!joined) return null;

        return decodeURIComponent(joined);
      } catch (e) {
        console.warn("[cookieStorage] getItem failed:", e);
        return null;
      }
    },

    setItem: (key, value) => {
      try {
        // Clear old chunks first
        const old = listChunkKeys(key);
        old.forEach(deleteCookie);

        if (value == null) return;

        const enc = encodeURIComponent(String(value));

        // Chunk and write
        let i = 0;
        for (let pos = 0; pos < enc.length; pos += chunkSize) {
          const chunk = enc.slice(pos, pos + chunkSize);
          setCookie(`${key}.${i}`, chunk, maxAgeSeconds);
          i++;
        }
      } catch (e) {
        console.warn("[cookieStorage] setItem failed:", e);
      }
    },

    removeItem: (key) => {
      try {
        const keys = listChunkKeys(key);
        keys.forEach(deleteCookie);
      } catch (e) {
        console.warn("[cookieStorage] removeItem failed:", e);
      }
    },
  };
}
