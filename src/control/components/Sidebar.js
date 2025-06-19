// src/control/components/Sidebar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useMediaQuery, Box, Tooltip } from "@mui/material";
import { Home, Devices, BarChart, Settings } from "@mui/icons-material";

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:600px)");

  const menuItems = [
    { label: "Home", path: "/", icon: <Home /> },
    { label: "Devices", path: "/devices", icon: <Devices /> },
    { label: "Reports", path: "/reports", icon: <BarChart /> },
    { label: "Settings", path: "/settings", icon: <Settings /> },
  ];

  return (
    <Box
      sx={{
        width: isMobile ? 64 : 220,
        bgcolor: "#1f2937",
        color: "#fff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: isMobile ? "center" : "flex-start",
        py: 2,
        px: isMobile ? 0 : 2,
        boxShadow: 4,
        borderRight: "1px solid #333",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1200,
      }}
    >
      {!isMobile && (
        <Box
          component="h2"
          sx={{ color: "#fff", fontSize: 18, fontWeight: 600, mb: 4 }}
        >
          HI5Tech Control
        </Box>
      )}
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        const color = isActive ? "#38bdf8" : "#fff";

        return (
          <Tooltip key={item.path} title={item.label} placement="right">
            <Link
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                color,
                textDecoration: "none",
                margin: isMobile ? "1rem 0" : "0.75rem 0",
                justifyContent: isMobile ? "center" : "flex-start",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Box sx={{ mr: isMobile ? 0 : 1.5 }}>{item.icon}</Box>
              {!isMobile && item.label}
            </Link>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default Sidebar;
