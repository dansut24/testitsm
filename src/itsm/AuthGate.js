// src/itsm/AuthGate.js
import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { supabase } from "../common/utils/supabaseClient";
import { getCentralLoginUrl } from "../common/utils/portalUrl";

export default function AuthGate({ children }) {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  // Prevent state updates after unmount
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

    // Single listener for the whole ITSM app
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
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Typography sx={{ fontWeight: 900, opacity: 0.8 }}>
          Loading session…
        </Typography>
      </Box>
    );
  }

  if (!hasSession) {
    // HARD redirect to central login (no React Router bouncing)
    const loginUrl = getCentralLoginUrl("/itsm");
    window.location.replace(`${loginUrl}?t=${Date.now()}`);
    return null;
  }

  return children;
}
