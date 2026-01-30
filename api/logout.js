// api/logout.js
// Clears the auth cookies across all subdomains

const ACCESS_COOKIE = "hi5tech_access_token";
const REFRESH_COOKIE = "hi5tech_refresh_token";

function getRegistrableDomain(hostname = "") {
  const h = String(hostname || "").toLowerCase().trim();
  const parts = h.split(".").filter(Boolean);
  if (parts.length < 2) return null;

  const last2 = parts.slice(-2).join(".");
  const last3 = parts.slice(-3).join(".");

  const MULTI_PART_TLDS = new Set([
    "co.uk",
    "org.uk",
    "ac.uk",
    "gov.uk",
    "ltd.uk",
    "plc.uk",
    "net.uk",
  ]);

  if (MULTI_PART_TLDS.has(last2)) return last3;
  return last2;
}

function cookieDomainFromReq(req) {
  const host = req.headers.host || "";
  const hostname = host.split(":")[0];
  const base = getRegistrableDomain(hostname);
  if (!base) return null;
  return `.${base}`;
}

function clearCookie(res, name, opts = {}) {
  const parts = [];
  parts.push(`${encodeURIComponent(name)}=`);
  parts.push("Path=/");
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  parts.push("Max-Age=0");
  parts.push("HttpOnly");
  parts.push("Secure");
  parts.push("SameSite=Lax");
  return parts.join("; ");
}

function json(res, status, body) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const domain = cookieDomainFromReq(req);

    // Clear on dot-domain (subdomain-wide)
    const cookies = [
      clearCookie(res, ACCESS_COOKIE, { domain }),
      clearCookie(res, REFRESH_COOKIE, { domain }),
      // Also clear without domain (covers localhost / edge cases)
      clearCookie(res, ACCESS_COOKIE, { domain: null }),
      clearCookie(res, REFRESH_COOKIE, { domain: null }),
    ];

    res.setHeader("Set-Cookie", cookies);
    return json(res, 200, { ok: true });
  } catch (e) {
    console.error("api/logout error:", e);
    return json(res, 200, { ok: true });
  }
}
