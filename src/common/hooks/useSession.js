// src/common/hooks/useSession.js
import { useCallback, useEffect, useRef, useState } from "react";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchSessionOnce(signal) {
  const res = await fetch("/api/session", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      // extra cache-busters for stubborn intermediaries:
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    signal,
  });

  if (!res.ok) {
    // treat as no session rather than throwing loops
    return { user: null };
  }

  const data = await res.json().catch(() => null);
  return data && typeof data === "object" ? data : { user: null };
}

/**
 * Cookie-based session hook.
 * - Always uses no-store to avoid stale `{user:null}` responses.
 * - Retries briefly because cookies can land a beat after login redirect.
 * - Never stays stuck loading (timeout safety).
 */
export function useSession() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const runIdRef = useRef(0);
  const abortRef = useRef(null);

  const refresh = useCallback(async ({ retries = 8 } = {}) => {
    const runId = ++runIdRef.current;

    // cancel previous in-flight
    try {
      abortRef.current?.abort?.();
    } catch {
      // ignore
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    // hard timeout: never hang forever
    const timeout = setTimeout(() => {
      if (runId === runIdRef.current) {
        setLoading(false);
      }
      try {
        controller.abort();
      } catch {
        // ignore
      }
    }, 8000);

    try {
      // small retry window:
      // useful after login redirect where cookies may be present but edge response can lag
      for (let i = 0; i <= retries; i++) {
        const data = await fetchSessionOnce(controller.signal);

        if (runId !== runIdRef.current) return;

        // If we got a user, accept immediately
        if (data?.user) {
          setUser(data.user);
          setLoading(false);
          return;
        }

        // No user yet. If this is the last try, commit null.
        if (i === retries) {
          setUser(null);
          setLoading(false);
          return;
        }

        // backoff: 80ms, 120ms, 180ms... capped
        const delay = Math.min(80 + i * 60, 500);
        await sleep(delay);
      }
    } catch (e) {
      if (runId !== runIdRef.current) return;
      // On error, treat as logged out but don't loop forever
      setUser(null);
      setLoading(false);
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    refresh({ retries: 8 });

    // Re-check when the tab becomes visible / after bfcache restore
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh({ retries: 2 });
    };
    const onPageShow = () => refresh({ retries: 2 });

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      try {
        abortRef.current?.abort?.();
      } catch {
        // ignore
      }
    };
  }, [refresh]);

  return { loading, user, refresh };
}
