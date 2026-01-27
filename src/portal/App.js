import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import CentralLogin from "../common/pages/CentralLogin";
import { supabase } from "../common/utils/supabaseClient";

function getTenantBaseFromHost() {
  const host = window.location.hostname || "";
  // If host is demo.hi5tech.co.uk => tenantBase = "demo"
  // If host is hi5tech.co.uk => tenantBase = null (root marketing scenario)
  const first = host.split(".")[0] || "";
  // ignore www/root if needed
  if (first === "www" || first === "hi5tech") return null;
  // If user hits a module domain by mistake, strip suffix
  return first.replace("-itsm", "").replace("-control", "").replace("-self", "");
}

function buildModuleUrl(tenantBase, module) {
  // module: "itsm" | "control" | "self"
  const host = window.location.hostname || "";
  const parent = host.split(".").slice(1).join("."); // hi5tech.co.uk
  const sub =
    module === "itsm"
      ? `${tenantBase}-itsm`
      : module === "control"
      ? `${tenantBase}-control`
      : `${tenantBase}-self`;
  return `https://${sub}.${parent}`;
}

// TEMP: Decide modules from user_metadata.apps
// Later: replace with DB roles/assignments
function getAllowedApps(user) {
  const apps = user?.user_metadata?.apps;
  if (Array.isArray(apps) && apps.length) return apps;
  return ["itsm"]; // default
}

function PortalHome() {
  const navigate = useNavigate();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [user, setUser] = useState(null);

  const tenantBase = useMemo(() => getTenantBaseFromHost(), []);
  const parentDomain = useMemo(() => window.location.hostname.split(".").slice(1).join("."), []);

  useEffect(() => {
    let mounted = true;

    async function run() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;

      setUser(data?.user || null);
      setSessionLoading(false);
    }

    run();
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setUser(sess?.user || null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (sessionLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Typography sx={{ fontWeight: 900, opacity: 0.8 }}>Loading…</Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowed = getAllowedApps(user);

  // Auto route if only one
  if (allowed.length === 1 && tenantBase) {
    const only = allowed[0];
    const url = buildModuleUrl(
      tenantBase,
      only === "selfservice" ? "self" : only
    );
    window.location.href = url;
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2 }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={950}>
            Choose a module
          </Typography>
          <Typography sx={{ opacity: 0.7, mt: 0.6 }}>
            {tenantBase
              ? `Signed in to ${tenantBase}.${parentDomain}`
              : "Signed in"}
          </Typography>

          <Stack spacing={1.2} sx={{ mt: 3 }}>
            {allowed.includes("itsm") && tenantBase && (
              <Button
                variant="contained"
                sx={{ py: 1.2, fontWeight: 900 }}
                onClick={() => (window.location.href = buildModuleUrl(tenantBase, "itsm"))}
              >
                Open ITSM
              </Button>
            )}

            {allowed.includes("control") && tenantBase && (
              <Button
                variant="contained"
                sx={{ py: 1.2, fontWeight: 900 }}
                onClick={() => (window.location.href = buildModuleUrl(tenantBase, "control"))}
              >
                Open Control
              </Button>
            )}

            {(allowed.includes("self") || allowed.includes("selfservice")) && tenantBase && (
              <Button
                variant="outlined"
                sx={{ py: 1.2, fontWeight: 900 }}
                onClick={() => (window.location.href = buildModuleUrl(tenantBase, "self"))}
              >
                Open Self Service
              </Button>
            )}

            <Button
              variant="text"
              sx={{ mt: 1, fontWeight: 900 }}
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login", { replace: true });
              }}
            >
              Sign out
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default function PortalApp() {
  return (
    <Routes>
      <Route path="/login" element={<CentralLogin title="Sign in" afterLogin="/" />} />
      <Route path="/" element={<PortalHome />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
