// MainContent.js
import React from "react";
import { Box, useTheme } from "@mui/material";
import { Outlet } from "react-router-dom";

const MainContent = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",      // important to include padding inside width
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.default,
        overflowX: "hidden",           // prevents horizontal scroll
        overflowY: "auto",
        px: { xs: 2, md: 3 },          // 16px on mobile, 24px on desktop
        py: 2,                         // consistent vertical padding
      }}
    >
      <Outlet />
    </Box>
  );
};

export default MainContent;
