// api/session.js
import { createClient } from "@supabase/supabase-js";

// Expect these env vars in Vercel:
// - REACT_APP_SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY   (server only; never expose to client)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cookie names (must match what your api/login.js sets)
const ACCESS_COOKIE = "hi5tech_access_token";
const REFRESH_COOKIE = "hi5tech_refresh_token";

function parseCookies(cookieHeader = "") {
  const out = {};
  const parts = String(cookieHeader || "")
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);

  for (const p of parts) {
    const idx = p.indexOf("=");
    if (idx === -1) continue;
    const k = decodeURIComponent(p.slice(0, idx).trim());
    const v = decodeURIComponent(p.slice(idx + 1).trim());
    out[k] = v;
  }
  return out;
}

function json(res, status, body) {
  // Prevent any caching at CDN/browser level (important!)
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  res.status(status).json(body);
}

export default async function handler(req, res) {
  try {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return json(res, 500, { error: "Server auth not configured (missing env vars)" });
    }

    const cookies = parseCookies(req.headers.cookie || "");
    const access_token = cookies[ACCESS_COOKIE];
    const refresh_token = cookies[REFRESH_COOKIE];

    if (!access_token) {
      return json(res, 200, { user: null });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1) Try access token
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(access_token);

    if (userData?.user && !userErr) {
      return json(res, 200, { user: userData.user });
    }

    // 2) If access token expired but refresh token exists, try refresh
    if (!refresh_token) {
      return json(res, 200, { user: null });
    }

    const { data: refreshData, error: refreshErr } = await supabaseAdmin.auth.refreshSession({
      refresh_token,
    });

    if (refreshErr || !refreshData?.session?.access_token) {
      return json(res, 200, { user: null });
    }

    // If you want: you *could* re-set cookies here with new tokens,
    // but it's optional. Login flow already handles this.
    const { data: userData2 } = await supabaseAdmin.auth.getUser(
      refreshData.session.access_token
    );

    return json(res, 200, { user: userData2?.user || null });
  } catch (e) {
    console.error("api/session error:", e);
    return json(res, 200, { user: null });
  }
}
