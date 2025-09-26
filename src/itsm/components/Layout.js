// Layout.js
import React, { useState, useEffect } from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
  SwipeableDrawer,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import NavbarTabs from "./NavbarTabs";
import Sidebar from "./Sidebar";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const NAVBAR_HEIGHT = 34;
const NAVBAR_PADDING_TOP = 6;
const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 48;

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

  // Tabs state
  const [tabs, setTabs] = useState(() => {
    const stored = sessionStorage.getItem("tabs");
    return stored ? JSON.parse(stored) : [{ label: "Dashboard", path: "/dashboard" }];
  });
  const [tabIndex, setTabIndex] = useState(() => {
    const storedIndex = sessionStorage.getItem("tabIndex");
    return storedIndex ? parseInt(storedIndex, 10) : 0;
  });

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);

  // Mobile drawer state
  const [drawerType, setDrawerType] = useState(null); // "search" | "notifications" | "profile"

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

  // Handlers
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

  const handleLogoClick = () => {
    if (isMobile) {
      setSidebarOpen((prev) => !prev);
    } else {
      setSidebarPinned((prev) => !prev);
    }
  };

  const activateOrAddTab = (label, faviconIndex) => {
    const existing = tabs.find((t) => t.label === label);
    if (existing) {
      setTabs((prev) => prev.map((t) => ({ ...t, active: t.label === label })));
      setTabIndex(tabs.findIndex((t) => t.label === label));
    } else {
      const newTab = { label, path: `/${label.toLowerCase().replace(/\s+/g, "-")}` };
      const newTabs = [...tabs.map((t) => ({ ...t, active: false })), newTab];
      setTabs(newTabs);
      setTabIndex(newTabs.length - 1);
      navigate(newTab.path);
    }
  };

  const sidebarWidth = sidebarPinned ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
      {/* Sidebar (desktop or toggleable on mobile) */}
      {!isMobile && (
        <Sidebar
          sidebarOpen={sidebarOpen}
          sidebarPinned={sidebarPinned}
          activateOrAddTab={activateOrAddTab}
        />
      )}

      {/* Main area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100vh",
          position: "relative",
          marginLeft: !isMobile ? `${sidebarWidth}px` : 0,
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Sticky Navbar + Tabs */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1200,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <NavbarTabs
            tabs={tabs}
            tabIndex={tabIndex}
            handleTabChange={handleTabChange}
            handleTabClose={handleTabClose}
            handleTabReorder={handleTabReorder}
            isMobile={isMobile}
            onLogoClick={handleLogoClick}
          />
        </Box>

        {/* Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            px: 1,
            pb: isMobile ? 7 : 0, // leave room for bottom bar on mobile
          }}
        >
          <Outlet />
        </Box>

        {/* Mobile bottom bar */}
        {isMobile && (
          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              borderTop: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              zIndex: 1500,
              height: 56,
            }}
          >
            <SearchIcon onClick={() => setDrawerType("search")} />
            <NotificationsIcon onClick={() => setDrawerType("notifications")} />
            <AccountCircleIcon onClick={() => setDrawerType("profile")} />
          </Box>
        )}
      </Box>

      {/* Swipeable Drawers for mobile actions */}
      <SwipeableDrawer
        anchor="bottom"
        open={Boolean(drawerType)}
        onClose={() => setDrawerType(null)}
        onOpen={() => {}}
        PaperProps={{
          sx: { height: "50%", p: 2, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
        }}
      >
        {drawerType === "search" && <Typography variant="h6">Search (mobile drawer)</Typography>}
        {drawerType === "notifications" && (
          <Typography variant="h6">Notifications (mobile drawer)</Typography>
        )}
        {drawerType === "profile" && <Typography variant="h6">Profile (mobile drawer)</Typography>}
      </SwipeableDrawer>
    </Box>
  );
};

export default Layout;
