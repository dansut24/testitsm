// src/itsm/layout/Layout.js
import React, { useState, useEffect } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar"; // <-- use your Navbar component
import NavbarTabs from "./NavbarTabs";

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 60;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarPinned, setSidebarPinned] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const desktopHasSidebar = !isMobile;
  const sidebarWidth = desktopHasSidebar
    ? sidebarPinned
      ? EXPANDED_WIDTH
      : COLLAPSED_WIDTH
    : 0;

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      {desktopHasSidebar && (
        <Box
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Sidebar
            pinned={sidebarPinned}
            onToggle={() => setSidebarPinned((p) => !p)}
            widthExpanded={EXPANDED_WIDTH}
            widthCollapsed={COLLAPSED_WIDTH}
          />
        </Box>
      )}

      {/* Main content column */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        {/* NAVBAR */}
        <Navbar
          sidebarWidth={EXPANDED_WIDTH}
          collapsedWidth={COLLAPSED_WIDTH}
          sidebarOpen={sidebarPinned}
        />

        {/* Main scrollable area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
            width: "100%",
            px: 2,
            py: 1,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
