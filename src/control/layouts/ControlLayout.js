// src/control/components/Layout.js
import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { Box, useMediaQuery } from "@mui/material";

const ControlLayout = () => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
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
