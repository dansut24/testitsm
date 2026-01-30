// src/portal/App.js
import React, { useMemo, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Container,
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
import { useSession } from "../common/hooks/useSession";

import { Hi5ThemeProvider, useHi5Theme } from "../common/ui/hi5Theme";
import GlassPanel from "../common/ui/GlassPanel";
import ThemeToggleIconButton from "../common/ui/ThemeToggleIconButton";

// -------------------------
// Host helpers
// -------------------------

function getHost() {
  return window.location.hostname || "";
}

function getHostModule(host = getHost()) {
  if (host.includes("-itsm.")) return "itsm";
  if (host.includes("-control.")) return "control";
  if (host.includes("-self.")) return "self";
  return null; // tenant base host
}

function getTenantSlug(search) {
  const qp = new URLSearchParams(search || "").get("tenant");
  if (qp) return qp.toLowerCase();

  const host = getHost();
  return (host.split(".")[0] || "").split("-")[0];
}

function parentDomain() {
  const host = getHost();
  return host.split(".").slice(1).join(".");
}

function protocol() {
  return window.location.protocol || "https:";
}

function moduleUrl(tenant, module) {
  const sub =
    module === "itsm"
      ? `${tenant}-itsm`
      : module === "control"
      ? `${tenant}-control`
      : `${tenant}-self`;

  // We navigate to the module HOST. The module host itself will route to the correct module path.
  return `${protocol()}//${sub}.${parentDomain()}/`;
}

// -------------------------
// UI
// -------------------------

function ModuleCard({ title, subtitle, chips, icon, href, t }) {
  return (
    <GlassPanel t={t} sx={{ p: 2.2 }}>
      <Stack direction="row" spacing={1.6}>
        <Box
          sx={{
            width: 54,
            height: 54,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            background: "rgba(124,92,255,0.18)",
            border: t.glass.border,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={950}>{title}</Typography>
          <Typography sx={{ opacity: 0.7 }}>{subtitle}</Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} mt={1.6} flexWrap="wrap">
        {chips.map((c) => (
          <Chip key={c} label={c} />
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          endIcon={<KeyboardArrowRightIcon />}
          onClick={() => window.location.assign(href)}
        >
          Open
        </Button>
        <Button
          variant="outlined"
          startIcon={<OpenInNewIcon />}
          onClick={() => window.open(href, "_blank")}
        >
          New tab
        </Button>
      </Stack>
    </GlassPanel>
  );
}

// -------------------------
// Pages
// -------------------------

function PortalHome() {
  const location = useLocation();
  const { mode, tokens: t, toggleMode } = useHi5Theme();
  const { loading, user } = useSession();

  const tenant = useMemo(() => getTenantSlug(location.search), [location.search]);
  const [query, setQuery] = useState("");

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Typography fontWeight={900}>Loading…</Typography>
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const modules = [
    {
      key: "itsm",
      title: "ITSM",
      subtitle: "Incidents, Requests, Knowledge",
      icon: <ListAltIcon />,
      chips: ["Tickets", "KB"],
    },
    {
      key: "control",
      title: "Control",
      subtitle: "Devices, Remote Actions",
      icon: <DashboardIcon />,
      chips: ["Devices", "Remote"],
    },
    {
      key: "self",
      title: "Self Service",
      subtitle: "End-user portal",
      icon: <SupportAgentIcon />,
      chips: ["Raise ticket"],
    },
  ];

  const filtered = modules.filter(
    (m) =>
      !query ||
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: "100vh", background: t.page.background }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <GlassPanel t={t} sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar>{user.email?.[0]?.toUpperCase?.() || "U"}</Avatar>
              <Box>
                <Typography fontWeight={950}>Choose a module</Typography>
                <Typography sx={{ opacity: 0.7 }}>{user.email}</Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <ThemeToggleIconButton mode={mode} onToggle={toggleMode} t={t} />
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={async () => {
                  await fetch("/api/logout", { method: "POST", credentials: "include" });
                  window.location.assign("/login?logout=1");
                }}
              >
                Sign out
              </Button>
            </Stack>
          </Stack>
        </GlassPanel>

        <TextField
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search modules…"
          sx={{ my: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
            gap: 2,
          }}
        >
          {filtered.map((m) => (
            <ModuleCard
              key={m.key}
              title={m.title}
              subtitle={m.subtitle}
              chips={m.chips}
              icon={m.icon}
              href={moduleUrl(tenant, m.key)}
              t={t}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}

function PortalAppInner() {
  const hostModule = getHostModule();

  // On module hosts, DO NOT redirect to /app.
  // Use the module route as the default “home”.
  const defaultHome = hostModule ? `/${hostModule}` : "/app";

  return (
    <Routes>
      <Route path="/login" element={<CentralLogin />} />

      {/* Tenant landing (portal) */}
      <Route path="/app" element={<PortalHome />} />

      {/* Root → host-aware default */}
      <Route path="/" element={<Navigate to={defaultHome} replace />} />

      {/* Anything unknown → host-aware default */}
      <Route path="*" element={<Navigate to={defaultHome} replace />} />
    </Routes>
  );
}

export default function PortalApp() {
  return (
    <Hi5ThemeProvider>
      <PortalAppInner />
    </Hi5ThemeProvider>
  );
}
