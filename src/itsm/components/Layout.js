// Layout.js
import React, { useState, useEffect } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NavbarTabs from "./NavbarTabs";

const expandedWidth = 256;
const collapsedWidth = 48;
const NAVBAR_HEIGHT = 34;
const NAVBAR_PADDING_TOP = 6;

const routeLabels = {
  "/dashboard": "Dashboard",
  "/incidents": "Incidents",
  "/service-requests": "Service Requests",
  "/changes": "Changes",
  "/problems": "Problems",
  "/assets": "Assets",
  "/knowledge-base": "Knowledge Base",
  "/reports": "Reports",
  "/approvals": "Approvals",
  "/profile": "Profile",
  "/settings": "Settings",
};

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [tabs, setTabs] = useState(() => {
    const stored = sessionStorage.getItem("tabs");
    return stored
      ? JSON.parse(stored)
      : [{ label: "Dashboard", path: "/dashboard" }];
  });

  const [tabIndex, setTabIndex] = useState(() => {
    const storedIndex = sessionStorage.getItem("tabIndex");
    return storedIndex ? parseInt(storedIndex, 10) : 0;
  });

  const sidebarWidth = sidebarOpen ? expandedWidth : collapsedWidth;

  // Update tabs on route change
  useEffect(() => {
    const currentPath = location.pathname;
    const tabExists = tabs.some((t) => t.path === currentPath);

    if (!tabExists) {
      const label = routeLabels[currentPath] || "Unknown";
      const newTabs = [...tabs, { label, path: currentPath }];
      setTabs(newTabs);
      setTabIndex(newTabs.length - 1);
    } else {
      const index = tabs.findIndex((t) => t.path === currentPath);
      setTabIndex(index);
    }
  }, [location.pathname]); // eslint-disable-line

  // Persist tabs
  useEffect(() => {
    sessionStorage.setItem("tabs", JSON.stringify(tabs));
    sessionStorage.setItem("tabIndex", tabIndex.toString());
  }, [tabs, tabIndex]);

  const handleTabChange = (ev, newIndex, path) => {
    setTabIndex(newIndex);
    if (path) navigate(path);
  };

  const handleTabClose = (tabId) => {
    const closingIndex = tabs.findIndex((t) => t.path === tabId);
    const newTabs = tabs.filter((t) => t.path !== tabId);
    setTabs(newTabs);

    if (location.pathname === tabId) {
      const fallbackIndex = closingIndex === 0 ? 0 : closingIndex - 1;
      const fallbackTab = newTabs[fallbackIndex] || { path: "/dashboard" };
      navigate(fallbackTab.path);
    }
  };

  const handleTabReorder = (tabsReordered) => {
    setTabs(tabsReordered);
  };

  const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);
  const handleMobileSidebarToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        mobileOpen={mobileOpen}
        handleSidebarToggle={handleSidebarToggle}
        handleMobileSidebarToggle={handleMobileSidebarToggle}
        sidebarWidth={sidebarWidth}
        collapsedWidth={collapsedWidth}
        isMobile={isMobile}
      />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          marginLeft: !isMobile ? `${sidebarWidth}px` : 0,
          height: "100vh",
          position: "relative",
        }}
      >
        <NavbarTabs
          tabs={tabs}
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          handleTabClose={handleTabClose}
          handleTabReorder={handleTabReorder}
          sidebarOpen={sidebarOpen}
          sidebarWidth={sidebarWidth}
          collapsedWidth={collapsedWidth}
          isMobile={isMobile}
          onLogoClick={handleMobileSidebarToggle}
        />

        <Box
          component="main"
          sx={{
            flex: 1,
            mt: `${NAVBAR_HEIGHT + NAVBAR_PADDING_TOP}px`,
            overflowY: "auto",
            overflowX: "hidden",
            px: 1,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
