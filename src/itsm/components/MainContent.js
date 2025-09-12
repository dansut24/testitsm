// MainContent.js
import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

const MainContent = () => {
  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
        overflowX: "hidden",   // 🚫 prevents horizontal scrollbars
        overflowY: "auto",     // ✅ allows vertical scrolling when needed
        boxSizing: "border-box",
        p: { xs: 1, md: 2 },   // responsive padding
      }}
    >
      <Outlet />
    </Box>
  );
};

export default MainContent;
