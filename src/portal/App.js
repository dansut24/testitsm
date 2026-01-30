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

// ✅ Shared Hi5 theme (portal only)
import { Hi5ThemeProvider, useHi5Theme } from "../common/ui/hi5Theme";
import GlassPanel from "../common/ui/GlassPanel";
import ThemeToggleIconButton from "../common/ui/ThemeToggleIconButton";

// ✅ Module apps (rendered on their own subdomains)
import ITSMApp from "../itsm/App";
import ControlApp from "../control/App";
import SelfServiceApp from "../selfservice/App";

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
          <Chip
            key={c}
            label={c}
            sx={{
              height: 30,
              borderRadius: 999,
              fontWeight: 900,
              background: t.pill.bg,
              border: t.pill.border,
              color: t.pill.text,
            }}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 2, borderColor: t.glass.divider }} />

      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          endIcon={<KeyboardArrowRightIcon />}
          onClick={() => window.location.assign(href)}
          sx={{
            borderRadius: 999,
            fontWeight: 950,
            textTransform: "none",
          }}
        >
          Open
        </Button>
        <Button
          variant="outlined"
          startIcon={<OpenInNewIcon />}
          onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
          sx={{
            borderRadius: 999,
            fontWeight: 950,
            textTransform: "none",
            borderColor: t.buttonOutlined.borderColor,
            color: t.buttonOutlined.color,
            background: t.buttonOutlined.background,
          }}
        >
          New tab
        </Button>
      </Stack>
    </GlassPanel>
  );
}

// -------------------------
// Portal pages
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
        <Typography sx={{ fontWeight: 950, opacity: 0.85 }}>Loading…</Typography>
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const modules = [
    {
      key: "itsm",
      title: "ITSM",
      subtitle: "Incidents, Requests, Knowledge",
      icon: <ListAltIcon sx={{ opacity: 0.92 }} />,
      chips: ["Tickets", "KB"],
    },
    {
      key: "control",
      title: "Control",
      subtitle: "Devices, Remote Actions",
      icon: <DashboardIcon sx={{ opacity: 0.92 }} />,
      chips: ["Devices", "Remote"],
    },
    {
      key: "self",
      title: "Self Service",
      subtitle: "End-user portal",
      icon: <SupportAgentIcon sx={{ opacity: 0.92 }} />,
      chips: ["Raise ticket"],
    },
  ];

  const q = query.trim().toLowerCase();
  const filtered = modules.filter((m) => {
    if (!q) return true;
    return (
      m.title.toLowerCase().includes(q) ||
      m.subtitle.toLowerCase().includes(q) ||
      m.chips.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <Box sx={{ minHeight: "100vh", background: t.page.background, color: t.page.color }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <GlassPanel t={t} sx={{ p: 2.2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  fontWeight: 950,
                  background:
                    "linear-gradient(135deg, rgba(0,176,255,0.95), rgba(140,90,255,0.95))",
                }}
              >
                {(user.email?.[0] || "U").toUpperCase()}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 950 }} noWrap>
                  Choose a module
                </Typography>
                <Typography sx={{ opacity: 0.7, fontSize: 13 }} noWrap>
                  {user.email}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <ThemeToggleIconButton mode={mode} onToggle={toggleMode} t={t} />

              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={async () => {
                  await fetch("/api/logout", { method: "POST", credentials: "include" });
                  window.location.assign("/login?logout=1");
                }}
                sx={{
                  borderRadius: 999,
                  fontWeight: 950,
                  textTransform: "none",
                  borderColor: t.buttonOutlined.borderColor,
                  color: t.buttonOutlined.color,
                  background: t.buttonOutlined.background,
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
          sx={{
            my: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 999,
              background: t.pill.bg,
              border: t.pill.border,
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
            gap: 16,
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

function PortalOnlyRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<CentralLogin />} />
      <Route path="/app" element={<PortalHome />} />
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

// -------------------------
// Export: Host-aware root app
// -------------------------

export default function PortalApp() {
  const hostModule = getHostModule();

  // If we're on a module subdomain, render that module’s app directly.
  // This is the key change that stops module hosts from ever rendering the portal router.
  if (hostModule === "itsm") return <ITSMApp />;
  if (hostModule === "control") return <ControlApp />;
  if (hostModule === "self") return <SelfServiceApp />;

  // Tenant base host renders the portal (landing) UI with Hi5 theme.
  return (
    <Hi5ThemeProvider>
      <PortalOnlyRoutes />
    </Hi5ThemeProvider>
  );
}
