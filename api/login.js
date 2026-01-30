// api/login.js
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/login
 * Body: { email, password }
 *
 * Sets HttpOnly cookies for access + refresh tokens scoped to .hi5tech.co.uk
 * so ALL subdomains share auth without flaky client-side session storage.
 */

function isProdHost(host) {
  // Covers demoitsm.hi5tech.co.uk, demoitsm-itsm.hi5tech.co.uk, etc.
  return typeof host === "string" && (host === "hi5tech.co.uk" || host.endsWith(".hi5tech.co.uk"));
}

function cookieDomainFromHost(host) {
  // Only set a Domain= in production; omit in localhost/preview to avoid browser rejection.
  return isProdHost(host) ? ".hi5tech.co.uk" : null;
}

function serializeCookie(name, value, opts = {}) {
  const encName = encodeURIComponent(name);
  const encVal = encodeURIComponent(value);

  let str = `${encName}=${encVal}`;

  if (opts.maxAge != null) str += `; Max-Age=${opts.maxAge}`;
  str += `; Path=/`;
  if (opts.domain) str += `; Domain=${opts.domain}`;
  if (opts.httpOnly) str += `; HttpOnly`;
  if (opts.secure) str += `; Secure`;
  if (opts.sameSite) str += `; SameSite=${opts.sameSite}`;

  return str;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: "Supabase env vars not set" });
    }

    // Server-side auth: anon key is enough for signInWithPassword
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }, // important: we manage cookies ourselves
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(password),
    });

    if (error || !data?.session) {
      return res.status(401).json({ error: error?.message || "Invalid login" });
    }

    const hostHeader = req.headers.host || "";
    const domain = cookieDomainFromHost(hostHeader);

    const isSecure = (req.headers["x-forwarded-proto"] || "").toString() === "https";

    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;

    // Keep cookies slightly longer than access token lifetime; refresh token handles the long session.
    const accessMaxAge = Math.max(60, Number(data.session.expires_in || 3600)); // seconds
    const refreshMaxAge = 60 * 60 * 24 * 30; // 30 days

    const cookies = [
      serializeCookie("hi5_at", accessToken, {
        domain,
        httpOnly: true,
        secure: isSecure,
        sameSite: "Lax",
        maxAge: accessMaxAge,
      }),
      serializeCookie("hi5_rt", refreshToken, {
        domain,
        httpOnly: true,
        secure: isSecure,
        sameSite: "Lax",
        maxAge: refreshMaxAge,
      }),
    ];

    res.setHeader("Set-Cookie", cookies);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[api/login] error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
