// api/logout.js

/**
 * POST /api/logout
 *
 * Clears auth cookies across all subdomains
 * and ends the session from the browser’s point of view.
 */

function isProdHost(host) {
  return typeof host === "string" && (host === "hi5tech.co.uk" || host.endsWith(".hi5tech.co.uk"));
}

function cookieDomainFromHost(host) {
  return isProdHost(host) ? ".hi5tech.co.uk" : null;
}

function serializeDeleteCookie(name, opts = {}) {
  let str = `${encodeURIComponent(name)}=; Max-Age=0; Path=/`;
  if (opts.domain) str += `; Domain=${opts.domain}`;
  if (opts.httpOnly) str += `; HttpOnly`;
  if (opts.secure) str += `; Secure`;
  if (opts.sameSite) str += `; SameSite=${opts.sameSite}`;
  return str;
}

export default async function handler(req, res) {
  try {
    const hostHeader = req.headers.host || "";
    const domain = cookieDomainFromHost(hostHeader);
    const isSecure = (req.headers["x-forwarded-proto"] || "").toString() === "https";

    const cookies = [
      serializeDeleteCookie("hi5_at", {
        domain,
        httpOnly: true,
        secure: isSecure,
        sameSite: "Lax",
      }),
      serializeDeleteCookie("hi5_rt", {
        domain,
        httpOnly: true,
        secure: isSecure,
        sameSite: "Lax",
      }),
    ];

    res.setHeader("Set-Cookie", cookies);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[api/logout] error:", e);
    return res.status(500).json({ error: "Logout failed" });
  }
}
