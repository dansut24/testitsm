// src/common/hooks/useSession.js
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Server-validated session hook.
 * Uses /api/session (HttpOnly cookies) so auth is stable across subdomains.
 *
 * Returns:
 *  - loading: boolean
 *  - user: object|null
 *  - error: string
 *  - refresh(): refetch session
 */
export function useSession() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const mountedRef = useRef(true);
  const inflightRef = useRef(false);

  const fetchSession = useCallback(async () => {
    if (inflightRef.current) return;
    inflightRef.current = true;

    try {
      setError("");
      const res = await fetch("/api/session", {
        method: "GET",
        credentials: "include",
        headers: { "Accept": "application/json" },
      });

      if (!mountedRef.current) return;

      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await res.json().catch(() => null);
      setUser(data?.user || null);
      setLoading(false);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e?.message || "Failed to load session");
      setUser(null);
      setLoading(false);
    } finally {
      inflightRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchSession();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchSession]);

  return {
    loading,
    user,
    error,
    refresh: fetchSession,
  };
}
