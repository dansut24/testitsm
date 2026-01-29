// src/control/AuthGate.js
import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { supabase } from "../common/utils/supabaseClient";
import { getCentralLoginUrl } from "../common/utils/portalUrl";

export default function AuthGate({ children }) {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const resolve = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted.current) return;
        setHasSession(!!data?.session);
      } finally {
        if (!mounted.current) return;
        setLoading(false);
      }
    };

    resolve();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted.current) return;
      setHasSession(!!session);
      setLoading(false);
    });

    return () => {
      mounted.current = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 4 }}>
        <p>Loading session...</p>
      </Box>
    );
  }

  if (!hasSession) {
    const loginUrl = getCentralLoginUrl("/control");
    window.location.replace(`${loginUrl}?t=${Date.now()}`);
    return null;
  }

  return children;
}
