// A minimal cookie storage adapter for supabase-js.
// Stores tokens in a cookie scoped to the parent domain so all subdomains can read it.
//
// IMPORTANT:
// - Works only when everything is under the same parent domain (e.g. *.hi5tech.co.uk)
// - Requires HTTPS in production (Secure cookies)

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, options = {}) {
  const {
    days = 7,
    path = "/",
    domain = ".hi5tech.co.uk",
    secure = true,
    sameSite = "Lax",
  } = options;

  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  let cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=${path}; Domain=${domain}; SameSite=${sameSite}`;
  if (secure) cookie += "; Secure";
  document.cookie = cookie;
}

function deleteCookie(name, options = {}) {
  const { path = "/", domain = ".hi5tech.co.uk" } = options;
  document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=${path}; Domain=${domain}; SameSite=Lax; Secure`;
}

// supabase-js expects: getItem/setItem/removeItem
export function cookieStorage(cookieKey = "hi5tech_sb_session") {
  return {
    getItem: (key) => {
      if (key !== cookieKey) return null;
      return getCookie(cookieKey);
    },
    setItem: (key, value) => {
      if (key !== cookieKey) return;
      setCookie(cookieKey, value, {
        // local dev: you might not have https, so allow non-secure on localhost
        secure: window.location.hostname !== "localhost" && !window.location.hostname.startsWith("127."),
      });
    },
    removeItem: (key) => {
      if (key !== cookieKey) return;
      deleteCookie(cookieKey, {
        secure: window.location.hostname !== "localhost" && !window.location.hostname.startsWith("127."),
      });
    },
  };
}
