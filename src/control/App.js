// src/control/App.js
import React from "react";
import { CssBaseline, Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import ControlLayout from "./layouts/ControlLayout";

import Devices from "./pages/Devices";
import Reports from "./pages/Reports";
import ControlSettings from "./pages/Settings";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import DeviceRemote from "./pages/DeviceRemote";

import { getCentralLoginUrl } from "../common/utils/portalUrl";
import ExternalRedirect from "../common/components/ExternalRedirect";

// ✅ New stable auth hook (cookie + /api/session)
import { useSession } from "../common/hooks/useSession";

// ✅ Shared Hi5 theme
import { Hi5ThemeProvider, useHi5Theme } from "../common/ui/hi5Theme";
import ThemeToggleIconButton from "../common/ui/ThemeToggleIconButton";

function ControlInnerApp() {
  const { loading, user } = useSession();
  const centralLogin = getCentralLoginUrl("/control");

  const { mode, tokens: t, toggleMode } = useHi5Theme();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          color: t.page.color,
          background: t.page.background,
          display: "grid",
          placeItems: "center",
          p: 4,
        }}
      >
        <p>Loading session...</p>
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          overflow: "auto",
          color: t.page.color,
          background: t.page.background,
          position: "relative",
        }}
      >
        {/* ✅ Floating theme toggle */}
        <Box sx={{ position: "fixed", top: 14, right: 14, zIndex: 2000 }}>
          <ThemeToggleIconButton mode={mode} onToggle={toggleMode} t={t} />
        </Box>

        <Routes>
          <Route path="/login" element={<ExternalRedirect to={centralLogin} />} />

          <Route
            path="/"
            element={user ? <ControlLayout /> : <ExternalRedirect to={centralLogin} />}
          >
            <Route index element={<Home />} />
            <Route path="devices" element={<Devices />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<ControlSettings />} />
            <Route path="devices/:deviceId/remote" element={<DeviceRemote />} />
          </Route>

          <Route
            path="*"
            element={user ? <NotFound /> : <ExternalRedirect to={centralLogin} />}
          />
        </Routes>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <Hi5ThemeProvider>
      <ControlInnerApp />
    </Hi5ThemeProvider>
  );
}
