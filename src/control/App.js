import React from "react";
import { CssBaseline, Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import ControlLayout from "./layouts/ControlLayout";

import Devices from "./pages/Devices";
import Reports from "./pages/Reports";
import ControlSettings from "./pages/Settings";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

function App() {
  return (
    <>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", overflow: "auto" }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ControlLayout />}>
            <Route index element={<Home />} />
            <Route path="devices" element={<Devices />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<ControlSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
