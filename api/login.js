// api/login.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Cookie names (keep in sync with api/session.js)
const ACCESS_COOKIE = "hi5tech_access_token";
const REFRESH_COOKIE = "hi5tech_refresh_token";

function getRegistrableDomain(hostname = "") {
  // Handles .co.uk properly (enough for hi5tech.co.uk)
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

  // If the TLD is multi-part (co.uk), registrable domain is last 3 labels
  if (MULTI_PART_TLDS.has(last2)) return last3;

  return last2;
}

function cookieDomainFromReq(req) {
  const host = req.headers.host || "";
  const hostname = host.split(":")[0];
  const base = getRegistrableDomain(hostname);
  if (!base) return null;

  // Always use dot-domain to share across subdomains
  return `.${base}`;
}

function setCookie(res, name, value, opts = {}) {
  const parts = [];
  parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);

  parts.push(`Path=${opts.path || "/"}`);
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  parts.push(`SameSite=${opts.sameSite || "Lax"}`);

  if (typeof opts.maxAge === "number") parts.push(`Max-Age=${opts.maxAge}`);

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
    if (!SUPABASE_URL || !ANON_KEY) {
      return json(res, 500, { error: "Server not configured (missing env vars)" });
    }

    const { email, password } = req.body || {};
    const e = String(email || "").trim();
    const p = String(password || "");

    if (!e || !p) {
      return json(res, 400, { error: "Email and password are required" });
    }

    const supabase = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: e,
      password: p,
    });

    if (error || !data?.session) {
      return json(res, 401, { error: error?.message || "Invalid credentials" });
    }

    const access = data.session.access_token;
    const refresh = data.session.refresh_token;

    const domain = cookieDomainFromReq(req);

    // If you run locally (localhost) domain may be null; that’s fine.
    const secure = true; // Vercel = https; leaving this true is correct for prod

    // Supabase default access token lifetime is short; refresh is longer.
    // We keep access cookie short and refresh longer.
    const accessMaxAge = 60 * 60; // 1 hour
    const refreshMaxAge = 60 * 60 * 24 * 30; // 30 days

    const cookies = [
      setCookie(res, ACCESS_COOKIE, access, {
        path: "/",
        domain,
        httpOnly: true,
        secure,
        sameSite: "Lax",
        maxAge: accessMaxAge,
      }),
      setCookie(res, REFRESH_COOKIE, refresh, {
        path: "/",
        domain,
        httpOnly: true,
        secure,
        sameSite: "Lax",
        maxAge: refreshMaxAge,
      }),
    ];

    res.setHeader("Set-Cookie", cookies);

    // Return minimal user info (optional)
    return json(res, 200, {
      ok: true,
      user: data.user || null,
    });
  } catch (e) {
    console.error("api/login error:", e);
    return json(res, 500, { error: "Login failed" });
  }
}
