// MainContent.js — Gradient background to blend with header/tabs
import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

const MainContent = () => {
  return (
    <Box
      sx={{
        width: "100%",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(to bottom, rgba(255,255,255,0.1), #f4f5f7)",
        pt: { xs: "92px", sm: "92px" },
        minHeight: "100vh",
      }}
    >
      <Outlet />
    </Box>
  );
};

export default MainContent;
