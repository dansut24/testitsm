import React from "react";
import { CssBaseline, Box } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import ControlLayout from "./layouts/ControlLayout";

import Devices from "./pages/Devices";
import Reports from "./pages/Reports";
import ControlSettings from "./pages/Settings";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/ControlLogin";

import { useAuth } from "../common/context/AuthContext";

function App() {
  const { user, authLoading } = useAuth();

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
          <Route path="/login" element={<Login />} />

          {user ? (
            <Route path="/" element={<ControlLayout />}>
              <Route index element={<Home />} />
              <Route path="devices" element={<Devices />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<ControlSettings />} />
            </Route>
          ) : (
            // redirect if not logged in
            <Route path="/*" element={<Navigate to="/login" replace />} />
          )}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
