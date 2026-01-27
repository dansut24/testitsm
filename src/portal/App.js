import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import CentralLogin from "../common/pages/CentralLogin";
import { supabase } from "../common/utils/supabaseClient";

function getTenantBaseHost() {
  const host = window.location.hostname || "";
  return host.split(".")[0] || "";
}

function getParentDomain() {
  const host = window.location.hostname || "";
  return host.split(".").slice(1).join(".");
}

function buildModuleUrl(tenantBase, moduleKey) {
  const parent = getParentDomain();
  const sub =
    moduleKey === "itsm"
      ? `${tenantBase}-itsm`
      : moduleKey === "control"
      ? `${tenantBase}-control`
      : `${tenantBase}-self`;

  return `https://${sub}.${parent}`;
}

async function loadTenantByBaseHost(tenantBase) {
  // assumes tenants.subdomain exists (your TenantContext already uses this)
  const { data, error } = await supabase
    .from("tenants")
    .select("id, subdomain, name")
    .eq("subdomain", tenantBase)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

// ====== Access mapping helpers (kept resilient to column naming) ======

async function loadProfileRole(userId, tenantId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) throw error;
  return data?.role || null;
}

function normalizeModuleValue(v) {
  const m = String(v || "").toLowerCase();
  if (!m) return null;
  if (m.includes("itsm")) return "itsm";
  if (m.includes("control")) return "control";
  if (m.includes("selfservice")) return "self";
  if (m.includes("self")) return "self";
  return null;
}

async function loadUserModules(userId, tenantId) {
  const { data, error } = await supabase
    .from("user_module_access")
    .select("*")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId);

  if (error) throw error;

  const rows = Array.isArray(data) ? data : [];
  const modules = new Set();

  for (const r of rows) {
    const moduleVal = r.module || r.module_key || r.app || r.product;
    const allowedVal = r.allowed ?? r.enabled ?? r.has_access ?? r.active ?? true;

    const norm = normalizeModuleValue(moduleVal);
    if (norm && allowedVal) modules.add(norm);
  }

  return Array.from(modules);
}

async function loadRoleModules(role, tenantId) {
  if (!role) return [];

  const { data, error } = await supabase
    .from("role_module_access")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("role", role);

  if (error) throw error;

  const rows = Array.isArray(data) ? data : [];
  const modules = new Set();

  for (const r of rows) {
    const moduleVal = r.module || r.module_key || r.app || r.product;
    const allowedVal = r.allowed ?? r.enabled ?? r.has_access ?? r.active ?? true;

    const norm = normalizeModuleValue(moduleVal);
    if (norm && allowedVal) modules.add(norm);
  }

  return Array.from(modules);
}

// ====== UI bits ======

function GlassPanel({ children, sx }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid rgba(255,255,255,0.10)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 18px 55px rgba(0,0,0,0.35)",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

function ModuleCard({ title, subtitle, chips = [], icon, onOpen, href }) {
  return (
    <GlassPanel sx={{ p: 2.2, height: "100%" }}>
      <Stack direction="row" spacing={1.6} alignItems="center">
        <Box
          sx={{
            width: 54,
            height: 54,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            background: "rgba(124,92,255,0.18)",
            border: "1px solid rgba(255,255,255,0.12)",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 950, fontSize: 18 }} noWrap>
            {title}
          </Typography>
          <Typography sx={{ opacity: 0.7, fontSize: 13 }} noWrap>
            {subtitle}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1.6, flexWrap: "wrap" }}>
        {chips.map((c) => (
          <Chip
            key={c}
            label={c}
            sx={{
              height: 30,
              borderRadius: 999,
              fontWeight: 900,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.90)",
            }}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 1.8, borderColor: "rgba(255,255,255,0.10)" }} />

      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
        <Button
          variant="contained"
          onClick={onOpen}
          endIcon={<KeyboardArrowRightIcon />}
          sx={{
            borderRadius: 999,
            fontWeight: 950,
            textTransform: "none",
            px: 2,
          }}
        >
          Open
        </Button>

        <Button
          variant="outlined"
          onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
          startIcon={<OpenInNewIcon />}
          sx={{
            borderRadius: 999,
            fontWeight: 950,
            textTransform: "none",
            borderColor: "rgba(255,255,255,0.18)",
            color: "rgba(255,255,255,0.88)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          New tab
        </Button>
      </Stack>
    </GlassPanel>
  );
}

function PortalHome() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(true);
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [modules, setModules] = useState([]);
  const [query, setQuery] = useState("");

  const tenantBase = useMemo(() => getTenantBaseHost(), []);

  const displayName = useMemo(() => {
    const name =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")?.[0] ||
      "User";
    return String(name || "User");
  }, [user]);

  const initials = useMemo(() => {
    const s = String(displayName || "U").trim();
    return (s[0] || "U").toUpperCase();
  }, [displayName]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        setBusy(true);

        const { data: userRes } = await supabase.auth.getUser();
        const u = userRes?.user || null;
        if (!mounted) return;
        setUser(u);

        if (!u) {
          setBusy(false);
          return;
        }

        const t = await loadTenantByBaseHost(tenantBase);
        if (!mounted) return;
        setTenant(t);

        if (!t?.id) {
          setModules([]);
          setBusy(false);
          return;
        }

        // 1) user_module_access
        let allowed = await loadUserModules(u.id, t.id);

        // 2) fallback role_module_access via profiles.role
        if (!allowed.length) {
          const role = await loadProfileRole(u.id, t.id);
          allowed = await loadRoleModules(role, t.id);
        }

        if (!mounted) return;
        setModules(allowed.length ? allowed : ["itsm"]);
        setBusy(false);
      } catch (e) {
        console.error("[Portal] error:", e);
        if (!mounted) return;
        setModules(["itsm"]);
        setBusy(false);
      }
    }

    run();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setUser(sess?.user || null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [tenantBase]);

  if (busy) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Typography sx={{ fontWeight: 950, opacity: 0.8 }}>Loading…</Typography>
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Auto-route if only one
  if (modules.length === 1 && tenantBase) {
    window.location.href = buildModuleUrl(tenantBase, modules[0]);
    return null;
  }

  const catalog = [
    {
      key: "itsm",
      title: "ITSM",
      subtitle: "Incidents, Requests, Changes, KB",
      icon: <ListAltIcon sx={{ opacity: 0.92 }} />,
      chips: ["Tickets", "Knowledge", "Approvals"],
      href: buildModuleUrl(tenantBase, "itsm"),
    },
    {
      key: "control",
      title: "Control",
      subtitle: "Devices, remote actions, reporting",
      icon: <DashboardIcon sx={{ opacity: 0.92 }} />,
      chips: ["Devices", "Remote", "Patch"],
      href: buildModuleUrl(tenantBase, "control"),
    },
    {
      key: "self",
      title: "Self Service",
      subtitle: "End-user portal & service catalog",
      icon: <SupportAgentIcon sx={{ opacity: 0.92 }} />,
      chips: ["Catalog", "Raise ticket", "Status"],
      href: buildModuleUrl(tenantBase, "self"),
    },
  ];

  const allowedSet = new Set(modules);
  const q = query.trim().toLowerCase();
  const visible = catalog
    .filter((m) => allowedSet.has(m.key))
    .filter((m) => {
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q) ||
        m.chips.some((c) => c.toLowerCase().includes(q))
      );
    });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        color: "rgba(255,255,255,0.92)",
        background: `
          radial-gradient(1200px 800px at 20% 10%, rgba(124, 92, 255, 0.28), transparent 60%),
          radial-gradient(1000px 700px at 85% 25%, rgba(56, 189, 248, 0.18), transparent 55%),
          radial-gradient(900px 700px at 60% 90%, rgba(34, 197, 94, 0.10), transparent 55%),
          linear-gradient(180deg, #070A12 0%, #0A1022 45%, #0B1633 100%)
        `,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        {/* Top header */}
        <GlassPanel sx={{ p: 2.2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  fontWeight: 950,
                  background:
                    "linear-gradient(135deg, rgba(0,176,255,0.95), rgba(140,90,255,0.95))",
                }}
              >
                {initials}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 950, fontSize: 20 }} noWrap>
                  Welcome back, {displayName.split(" ")[0]}
                </Typography>
                <Typography sx={{ opacity: 0.72, fontSize: 13 }} noWrap>
                  {tenant?.name ? tenant.name : tenantBase} • {user.email}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <TextField
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search modules…"
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 320 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    backdropFilter: "blur(10px)",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ opacity: 0.75 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/login", { replace: true });
                }}
                sx={{
                  borderRadius: 999,
                  fontWeight: 950,
                  textTransform: "none",
                  borderColor: "rgba(255,255,255,0.18)",
                  color: "rgba(255,255,255,0.88)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                Sign out
              </Button>
            </Stack>
          </Stack>
        </GlassPanel>

        {/* Module grid */}
        <Box
          sx={{
            mt: 2.2,
            display: "grid",
            gap: 16,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
          }}
        >
          {visible.map((m) => (
            <ModuleCard
              key={m.key}
              title={m.title}
              subtitle={m.subtitle}
              chips={m.chips}
              icon={m.icon}
              href={m.href}
              onOpen={() => {
                window.location.href = m.href;
              }}
            />
          ))}
        </Box>

        {/* Empty state */}
        {!visible.length ? (
          <GlassPanel sx={{ mt: 2.2, p: 3 }}>
            <Typography sx={{ fontWeight: 950, fontSize: 18 }}>
              No modules matched your search
            </Typography>
            <Typography sx={{ opacity: 0.72, mt: 0.6 }}>
              Try searching for “tickets”, “devices”, or “catalog”.
            </Typography>
          </GlassPanel>
        ) : null}

        <Box sx={{ height: 16 }} />
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
