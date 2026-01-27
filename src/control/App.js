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

import { useAuth } from "../common/context/AuthContext";
import { getCentralLoginUrl } from "../common/utils/portalUrl";
import ExternalRedirect from "../common/components/ExternalRedirect";

function App() {
  const { authLoading, user } = useAuth();
  const centralLogin = getCentralLoginUrl("/control");

  if (authLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <p>Loading session...</p>
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", overflow: "auto" }}>
        <Routes>
          {/* Control should never render a local login page */}
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

export default App;
