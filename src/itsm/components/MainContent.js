import React from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";

const MainContent = () => {
  const theme = useTheme();
  const isMobilePortrait = useMediaQuery(theme.breakpoints.down("sm"));

  const headerHeight = 48; // AppBar
  const tabsHeight = 36;   // Tabs
  const footerHeight = 48; // Approximate footer
  const aiChatHeight = 60; // AI Chat box height

  return (
    <Box
      sx={{
        width: "100%",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F4F5F7", // Professional light background
        pt: isMobilePortrait ? `${headerHeight + tabsHeight}px` : "92px",
        pb: isMobilePortrait ? `${footerHeight + aiChatHeight + 16}px` : "16px",
        minHeight: "100vh",
      }}
    >
      <Outlet />
    </Box>
  );
};

export default MainContent;
