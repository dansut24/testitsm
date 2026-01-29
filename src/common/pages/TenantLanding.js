// src/common/pages/TenantLanding.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { getAccessibleModules } from "../services/ModuleAccessService";
import {
  getTenantBaseHost,
  buildModuleUrlFromTenantHost,
} from "../utils/tenantHost";
import CentralLogin from "./CentralLogin";

function labelFor(module) {
  if (module === "itsm") return "ITSM";
  if (module === "control") return "Control (RMM)";
  if (module === "self_service") return "Self Service";
  return module;
}

function descFor(module) {
  if (module === "itsm")
    return "Incidents, requests, changes, assets, knowledge base.";
  if (module === "control")
    return "Devices, remote tools, reports and admin control.";
  if (module === "self_service")
    return "End-user portal for raising requests and incidents.";
  return "";
}

function storageKey(tenantId, userId) {
  return `hi5.modules:${tenantId || "none"}:${userId || "none"}`;
}

export default function TenantLanding() {
  const { user, authLoading, tenantId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [error, setError] = useState("");

  const tenantBaseHost = useMemo(() => getTenantBaseHost(), []);

  // Prevent double auto-forward (StrictMode / rerenders)
  const forwardedRef = useRef(false);

  // Load module access once we have user + tenantId
  useEffect(() => {
    let mounted = true;

    async function load() {
      forwardedRef.current = false; // reset when tenant/user changes

      if (!user?.id || !tenantId) {
        if (mounted) {
          setModules([]);
          setError("");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError("");

      // Try cache first (fast, avoids flicker)
      try {
        const cached = sessionStorage.getItem(storageKey(tenantId, user.id));
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setModules(parsed);
            setLoading(false);
          }
        }
      } catch {
        // ignore cache parse errors
      }

      try {
        const mods = await getAccessibleModules({
          tenantId,
          userId: user.id,
          // if AuthContext includes role, pass it to avoid extra profile query:
          role: user.role,
        });

        if (!mounted) return;

        const safeMods = Array.isArray(mods) ? mods : [];
        setModules(safeMods);

        try {
          sessionStorage.setItem(
            storageKey(tenantId, user.id),
            JSON.stringify(safeMods)
          );
        } catch {
          // ignore
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load module access");
        setModules([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [user?.id, user?.role, tenantId]);

  // Auto-forward if exactly one module
  useEffect(() => {
    if (forwardedRef.current) return;
    if (authLoading) return;
    if (!user?.id) return;
    if (!tenantId) return;
    if (loading) return;

    if (modules.length === 1) {
      forwardedRef.current = true;
      const url = buildModuleUrlFromTenantHost(tenantBaseHost, modules[0]);
      window.location.assign(url);
    }
  }, [authLoading, user?.id, tenantId, loading, modules, tenantBaseHost]);

  if (authLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Typography sx={{ opacity: 0.7 }}>Loading session…</Typography>
      </Box>
    );
  }

  if (!user) {
    return <CentralLogin title="Sign in to Hi5Tech" />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 4 }}>
          <Stack spacing={1}>
            <Typography variant="h5" fontWeight={950}>
              Choose where to go
            </Typography>
            <Typography sx={{ opacity: 0.7 }}>Signed in as {user.email}</Typography>
          </Stack>

          <Box sx={{ mt: 3 }}>
            {loading ? (
              <Typography sx={{ opacity: 0.7 }}>Loading modules…</Typography>
            ) : error ? (
              <Typography sx={{ color: "error.main" }}>{error}</Typography>
            ) : !tenantId ? (
              <Typography sx={{ opacity: 0.8 }}>
                No tenant detected for this host. If you&apos;re on the root domain,
                use the tenant subdomain.
              </Typography>
            ) : modules.length === 0 ? (
              <Typography sx={{ opacity: 0.8 }}>
                No modules assigned to your account for this tenant.
              </Typography>
            ) : modules.length === 1 ? (
              <Typography sx={{ opacity: 0.8 }}>
                Taking you to {labelFor(modules[0])}…
              </Typography>
            ) : (
              <Stack spacing={2}>
                {modules.map((m) => (
                  <Paper key={m} variant="outlined" sx={{ p: 2.2, borderRadius: 3 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      alignItems={{ sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography fontWeight={950} sx={{ fontSize: 18 }}>
                          {labelFor(m)}
                        </Typography>
                        <Typography sx={{ opacity: 0.7, mt: 0.4 }}>
                          {descFor(m)}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        sx={{ fontWeight: 900, minWidth: 160 }}
                        onClick={() => {
                          const url = buildModuleUrlFromTenantHost(tenantBaseHost, m);
                          window.location.assign(url);
                        }}
                      >
                        Open {labelFor(m)}
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
