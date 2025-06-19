// src/control/components/Sidebar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useMediaQuery, Box, Tooltip, Typography } from "@mui/material";
import { Home, Devices, BarChart, Settings } from "@mui/icons-material";
import logo from "../../assets/logo512.png"; // Replace with your tenant logo

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:600px)");

  const menuItems = [
    { label: "Home", path: "/", icon: <Home fontSize="large" /> },
    { label: "Devices", path: "/devices", icon: <Devices fontSize="large" /> },
    { label: "Reports", path: "/reports", icon: <BarChart fontSize="large" /> },
    { label: "Settings", path: "/settings", icon: <Settings fontSize="large" /> },
  ];

  return (
    <Box
      sx={{
        width: isMobile ? 80 : 100,
        bgcolor: "#1f2937",
        color: "#fff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
        boxShadow: 4,
        borderRight: "1px solid #333",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1200,
      }}
    >
      {/* Logo */}
      <Box sx={{ mb: 4 }}>
        <img src={logo} alt="Logo" style={{ width: 40, height: 40 }} />
      </Box>

      {/* Menu items */}
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        const color = isActive ? "#38bdf8" : "#fff";

        return (
          <Tooltip key={item.path} title={item.label} placement="right">
            <Link
              to={item.path}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color,
                textDecoration: "none",
                marginBottom: "2rem",
              }}
            >
              {item.icon}
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.65rem",
                  mt: 0.5,
                  color,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}
              </Typography>
            </Link>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default Sidebar;
