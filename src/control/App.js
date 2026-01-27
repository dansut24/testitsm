import React from "react";
import { CssBaseline, Box } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";

import ControlLayout from "./layouts/ControlLayout";
import Devices from "./pages/Devices";
import Reports from "./pages/Reports";
import ControlSettings from "./pages/Settings";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import DeviceRemote from "./pages/DeviceRemote";

import { useAuth } from "../common/context/AuthContext";
import { getCentralLoginUrl } from "../common/utils/portalUrl";

function App() {
  const { authLoading, user } = useAuth();

  if (authLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <p>Loading session...</p>
      </Box>
    );
  }

  const centralLogin = getCentralLoginUrl("/control");

  return (
    <>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", overflow: "auto" }}>
        <Routes>
          {/* IMPORTANT: never show a control login page now */}
          <Route path="/login" element={<Navigate to={centralLogin} replace />} />

          <Route
            path="/"
            element={user ? <ControlLayout /> : <Navigate to={centralLogin} replace />}
          >
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
  );
}

export default App;
