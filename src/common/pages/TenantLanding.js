// src/common/pages/TenantLanding.js
import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import DevicesIcon from "@mui/icons-material/Devices";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

import { useAuth } from "../context/AuthContext";
import { useTenant } from "../context/TenantContext";
import { getUserModuleAccess } from "../utils/moduleAccess";
import { getCentralLoginUrl, getModuleBaseUrl } from "../utils/portalUrl";
import { supabase } from "../utils/supabaseClient";

function pickModuleMeta(module) {
  const m = String(module || "").toLowerCase();

  if (m === "itsm") {
    return {
      title: "ITSM",
      desc: "Incidents, requests, changes, problems and knowledge base.",
      icon: <SupportAgentIcon />,
      goText: "Open ITSM",
      url: `${getModuleBaseUrl("itsm")}/`,
    };
  }

  if (m === "control") {
    return {
      title: "Control",
      desc: "Devices, remote actions, reporting and RMM tools.",
      icon: <DevicesIcon />,
      goText: "Open Control",
      url: `${getModuleBaseUrl("control")}/`,
    };
  }

  if (m === "self") {
    return {
      title: "Self Service",
      desc: "End-user portal for raising tickets and browsing help articles.",
      icon: <DashboardIcon />,
      goText: "Open Self Service",
      url: `${getModuleBaseUrl("self")}/`,
    };
  }

  return {
    title: module,
    desc: "Open module",
    icon: <DashboardIcon />,
    goText: "Open",
    url: `${getModuleBaseUrl(module)}/`,
  };
}

export default function TenantLanding() {
  const { user, authLoading } = useAuth();
  const { tenantId, tenant, loading: tenantLoading } = useTenant();
  const location = useLocation();

  const [busy, setBusy] = useState(true);
  const [modules, setModules] = useState([]);
  const [role, setRole] = useState(null);
  const [err, setErr] = useState("");

  const redirectParam = useMemo(() => {
    const raw = new URLSearchParams(location.search).get("redirect") || "";
    return raw.trim();
  }, [location.search]);

  useEffect(() => {
    // Not logged in -> central login
    if (!authLoading && !user) {
      window.location.replace(getCentralLoginUrl("/"));
      return;
    }

    if (authLoading || tenantLoading || !user || !tenantId) return;

    let mounted = true;

    (async () => {
      setBusy(true);
      setErr("");
      try {
        const res = await getUserModuleAccess({ userId: user.id, tenantId });
        if (!mounted) return;

        setModules(res.modules || []);
        setRole(res.role || null);

        // If redirect explicitly asks for a module, jump there (if allowed)
        const wanted = redirectParam.replace("/", "").toLowerCase();
        if (wanted && res.modules?.includes(wanted)) {
          window.location.replace(`${getModuleBaseUrl(wanted)}/`);
          return;
        }

        // Auto redirect if single module
        if ((res.modules || []).length === 1) {
          const only = res.modules[0];
          window.location.replace(`${getModuleBaseUrl(only)}/`);
          return;
        }
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load module access.");
      } finally {
        if (!mounted) return;
        setBusy(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authLoading, user, tenantLoading, tenantId, redirectParam]);

  async function onLogout() {
    try {
      await supabase.auth.signOut();
    } finally {
      window.location.replace(getCentralLoginUrl("/"));
    }
  }

  const displayTenant = tenant?.name || tenant?.subdomain || "Tenant";
  const meta = modules.map(pickModuleMeta);

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2 }}>
      <Container maxWidth="md">
        <Paper elevation={6} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
            <Box>
              <Typography variant="h5" fontWeight={950}>
                {displayTenant} Portal
              </Typography>
              <Typography sx={{ opacity: 0.7, mt: 0.5 }}>
                {role ? `Signed in as ${role}` : "Signed in"}
              </Typography>
            </Box>

            <Button variant="outlined" onClick={onLogout} sx={{ fontWeight: 900 }}>
              Logout
            </Button>
          </Stack>

          <Box sx={{ mt: 3 }}>
            {busy ? (
              <Typography sx={{ opacity: 0.75 }}>Loading access…</Typography>
            ) : err ? (
              <Typography sx={{ color: "error.main" }}>{err}</Typography>
            ) : meta.length === 0 ? (
              <Typography sx={{ opacity: 0.75 }}>
                No modules assigned for this tenant.
              </Typography>
            ) : meta.length === 1 ? (
              <Typography sx={{ opacity: 0.75 }}>
                Redirecting you to {meta[0].title}…
              </Typography>
            ) : (
              <>
                <Typography sx={{ fontWeight: 900, mb: 1.2 }}>
                  Choose where to go
                </Typography>

                <Stack spacing={1.4}>
                  {meta.map((m) => (
                    <Paper
                      key={m.title}
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 3 }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        alignItems={{ sm: "center" }}
                        justifyContent="space-between"
                      >
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Box sx={{ opacity: 0.9 }}>{m.icon}</Box>
                          <Box>
                            <Typography fontWeight={950}>{m.title}</Typography>
                            <Typography sx={{ opacity: 0.7, fontSize: 13 }}>
                              {m.desc}
                            </Typography>
                          </Box>
                        </Stack>

                        <Button
                          variant="contained"
                          onClick={() => window.location.assign(m.url)}
                          sx={{ fontWeight: 900 }}
                        >
                          {m.goText}
                        </Button>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
