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

import ExternalRedirect from "../common/components/ExternalRedirect";
import { getCentralLoginUrl } from "../common/utils/portalUrl";

// ✅ Shared Hi5 theme
import { useHi5Theme } from "../common/ui/hi5Theme";
import ThemeToggleIconButton from "../common/ui/ThemeToggleIconButton";

// ✅ New single gate
import AuthGate from "./AuthGate";

function App() {
  const centralLogin = getCentralLoginUrl("/control");
  const { mode, tokens: t, toggleMode } = useHi5Theme();

  return (
    <AuthGate>
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
          {/* Floating theme toggle */}
          <Box sx={{ position: "fixed", top: 14, right: 14, zIndex: 2000 }}>
            <ThemeToggleIconButton mode={mode} onToggle={toggleMode} t={t} />
          </Box>

          <Routes>
            {/* Control never renders a local login page */}
            <Route path="/login" element={<ExternalRedirect to={centralLogin} />} />

            <Route path="/" element={<ControlLayout />}>
              <Route index element={<Home />} />
              <Route path="devices" element={<Devices />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<ControlSettings />} />
              <Route path="devices/:deviceId/remote" element={<DeviceRemote />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
      </>
    </AuthGate>
  );
}

export default App;
