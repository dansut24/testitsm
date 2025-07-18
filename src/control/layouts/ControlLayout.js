// src/control/layouts/ControlLayout.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../common/context/AuthContext";
import Sidebar from "../components/Sidebar";
import { Box, useMediaQuery } from "@mui/material";
import logo from "../../common/assets/865F7924-3016-4B89-8DF4-F881C33D72E6.png";

const ControlLayout = () => {
  const { user, authLoading } = useAuth();
  const isMobile = useMediaQuery("(max-width:600px)");

  if (authLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <p>Loading session...</p>
      </Box>
    );
  }

  // 🔒 Redirect unauthenticated users to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar logo={logo} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: isMobile ? "80px" : "100px",
          p: 3,
          minHeight: "100vh",
          bgcolor: "#f8f9fb",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default ControlLayout;
