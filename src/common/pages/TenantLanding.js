// src/main/pages/TenantLanding.js
import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";
import { useAuth } from "../../common/context/AuthContext";

function getTenantSlugFromHost() {
  const host = window.location.hostname || "";
  const first = host.split(".")[0] || "";
  // tenant host is like demoitsm.hi5tech.co.uk
  return first || null;
}

function moduleToHostSuffix(module) {
  // DNS pattern you already use:
  // demoitsm-itsm.hi5tech.co.uk
  // demoitsm-control.hi5tech.co.uk
  // demoitsm-self.hi5tech.co.uk   (self_service module)
  if (module === "self_service") return "self";
  return module; // "itsm" | "control"
}

function buildModuleUrl(module) {
  const tenantSlug = getTenantSlugFromHost();
  if (!tenantSlug) return null;
  const suffix = moduleToHostSuffix(module);
  return `https://${tenantSlug}-${suffix}.hi5tech.co.uk/`;
}

export default function TenantLanding() {
  const navigate = useNavigate();
  const { user, authLoading, tenant } = useAuth();

  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [err, setErr] = useState("");

  const tenantId = tenant?.id || user?.tenant_id || null;
  const role = user?.role || "user";

  useEffect(() => {
    let alive = true;

    async function run() {
      setErr("");

      if (authLoading) return;
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }
      if (!tenantId) {
        setLoading(false);
        setErr("Tenant could not be resolved for this user/session.");
        return;
      }

      setLoading(true);

      try {
        // 1) role allows
        const { data: roleRows, error: roleErr } = await supabase
          .from("role_module_access")
          .select("module, allowed")
          .eq("tenant_id", tenantId)
          .eq("role", role);

        if (roleErr) throw roleErr;

        const roleAllowed = new Set(
          (roleRows || [])
            .filter((r) => r.allowed === true)
            .map((r) => r.module)
        );

        // 2) user overrides (allow/deny)
        const { data: userRows, error: userErr } = await supabase
          .from("user_module_access")
          .select("module, effect")
          .eq("tenant_id", tenantId)
          .eq("user_id", user.id);

        if (userErr) throw userErr;

        const final = new Set([...roleAllowed]);

        for (const o of userRows || []) {
          const m = o.module;
          const effect = String(o.effect || "").toLowerCase();
          if (effect === "deny") final.delete(m);
          if (effect === "allow") final.add(m);
        }

        // Only modules we actually support here
        const allowed = [...final].filter((m) =>
          ["itsm", "control", "self_service"].includes(m)
        );

        if (!alive) return;
        setModules(allowed);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load module access.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [authLoading, user, tenantId, role, navigate]);

  const title = useMemo(() => {
    const name =
      user?.full_name || user?.email?.split("@")?.[0] || "there";
    return `Welcome, ${name}`;
  }, [user]);

  // ✅ If only one module is allowed, auto-forward
  useEffect(() => {
    if (loading || err) return;
    if (modules.length === 1) {
      const url = buildModuleUrl(modules[0]);
      if (url) window.location.href = url;
    }
  }, [loading, err, modules]);

  const cards = useMemo(() => {
    return modules.map((m) => {
      const label =
        m === "itsm" ? "ITSM" : m === "control" ? "Control" : "Self Service";
      const desc =
        m === "itsm"
          ? "Tickets, changes, assets and knowledge base"
          : m === "control"
          ? "RMM device management, scripts and remote actions"
          : "End-user portal for raising requests and incidents";

      return { module: m, label, desc };
    });
  }, [modules]);

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2 }}>
      <Container maxWidth="md">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 4 }}>
          <Stack spacing={1}>
            <Typography variant="h5" fontWeight={950}>
              {title}
            </Typography>
            <Typography sx={{ opacity: 0.75 }}>
              Choose where you want to go.
            </Typography>
          </Stack>

          {loading ? (
            <Typography sx={{ mt: 3, opacity: 0.8 }}>Loading access…</Typography>
          ) : err ? (
            <Typography sx={{ mt: 3, color: "error.main" }}>{err}</Typography>
          ) : modules.length <= 1 ? (
            <Typography sx={{ mt: 3, opacity: 0.8 }}>
              Redirecting…
            </Typography>
          ) : (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 3 }}>
              {cards.map((c) => (
                <Paper
                  key={c.module}
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 3, flex: 1 }}
                >
                  <Typography sx={{ fontWeight: 950, fontSize: 18 }}>
                    {c.label}
                  </Typography>
                  <Typography sx={{ mt: 0.6, opacity: 0.75 }}>
                    {c.desc}
                  </Typography>

                  <Button
                    variant="contained"
                    sx={{ mt: 2, fontWeight: 900 }}
                    onClick={() => {
                      const url = buildModuleUrl(c.module);
                      if (url) window.location.href = url;
                    }}
                  >
                    Open {c.label}
                  </Button>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
