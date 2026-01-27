import React, { useEffect, useState } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

/**
 * AppRouter:
 * - Ensures user is logged in
 * - Fetches role/assignment info
 * - Sends user to ITSM or Control or chooser
 *
 * You can wire to your real tables later.
 * For now it uses user_metadata flags:
 *   user.user_metadata.apps = ["itsm","control"] etc
 */
export default function AppRouter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);

      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      // ✅ TEMP logic (no DB needed yet):
      // Put allowed apps in user_metadata.apps
      // Example: ["itsm"] or ["control"] or ["itsm","control"]
      const allowed = Array.isArray(user.user_metadata?.apps)
        ? user.user_metadata.apps
        : ["itsm"]; // default

      if (!mounted) return;
      setApps(allowed);

      // Auto-route if exactly one app
      if (allowed.length === 1) {
        const only = allowed[0];
        navigate(only === "control" ? "/control" : only === "selfservice" ? "/selfservice" : "/itsm", {
          replace: true,
        });
        return;
      }

      setLoading(false);
    }

    run();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Typography sx={{ opacity: 0.8, fontWeight: 800 }}>Loading…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 4, width: "100%", maxWidth: 520 }}>
        <Typography variant="h5" fontWeight={950}>
          Choose where to go
        </Typography>
        <Typography sx={{ opacity: 0.7, mt: 0.6 }}>
          Your account has access to multiple areas.
        </Typography>

        <Stack spacing={1.2} sx={{ mt: 3 }}>
          {apps.includes("itsm") && (
            <Button variant="contained" onClick={() => navigate("/itsm")} sx={{ py: 1.2, fontWeight: 900 }}>
              Open ITSM
            </Button>
          )}
          {apps.includes("control") && (
            <Button variant="contained" onClick={() => navigate("/control")} sx={{ py: 1.2, fontWeight: 900 }}>
              Open Control
            </Button>
          )}
          {apps.includes("selfservice") && (
            <Button variant="outlined" onClick={() => navigate("/selfservice")} sx={{ py: 1.2, fontWeight: 900 }}>
              Open Self Service
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
