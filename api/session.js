// api/session.js
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/session
 *
 * Reads HttpOnly cookies set by /api/login,
 * validates them with Supabase,
 * refreshes access token if needed,
 * and returns the user object.
 */

function isProdHost(host) {
  return typeof host === "string" && (host === "hi5tech.co.uk" || host.endsWith(".hi5tech.co.uk"));
}

function cookieDomainFromHost(host) {
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
  try {
    const accessToken = req.cookies?.hi5_at;
    const refreshToken = req.cookies?.hi5_rt;

    if (!accessToken && !refreshToken) {
      return res.status(401).end();
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: "Supabase env vars not set" });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    let user = null;
    let newSession = null;

    // 1️⃣ Try current access token
    if (accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (!error && data?.user) {
        user = data.user;
      }
    }

    // 2️⃣ If access token expired, refresh using refresh token
    if (!user && refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data?.session) {
        return res.status(401).end();
      }

      newSession = data.session;
      user = data.session.user;
    }

    if (!user) {
      return res.status(401).end();
    }

    // 3️⃣ If we refreshed, update cookies
    if (newSession) {
      const hostHeader = req.headers.host || "";
      const domain = cookieDomainFromHost(hostHeader);
      const isSecure = (req.headers["x-forwarded-proto"] || "").toString() === "https";

      const accessMaxAge = Math.max(60, Number(newSession.expires_in || 3600));
      const refreshMaxAge = 60 * 60 * 24 * 30;

      const cookies = [
        serializeCookie("hi5_at", newSession.access_token, {
          domain,
          httpOnly: true,
          secure: isSecure,
          sameSite: "Lax",
          maxAge: accessMaxAge,
        }),
        serializeCookie("hi5_rt", newSession.refresh_token, {
          domain,
          httpOnly: true,
          secure: isSecure,
          sameSite: "Lax",
          maxAge: refreshMaxAge,
        }),
      ];

      res.setHeader("Set-Cookie", cookies);
    }

    return res.status(200).json({ user });
  } catch (e) {
    console.error("[api/session] error:", e);
    return res.status(401).end();
  }
}
