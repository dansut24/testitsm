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
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import StorageIcon from "@mui/icons-material/Storage";
import SettingsIcon from "@mui/icons-material/Settings";

const NAVBAR_HEIGHT = 48;
const BOTTOM_NAV_HEIGHT = 56;

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 48;

const routeLabels = {
  "/dashboard": "Dashboard",
  "/incidents": "Incidents",
  "/assets": "Assets",
  "/settings": "Settings",
};

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  // Tabs
  const [tabs, setTabs] = useState([{ label: "Dashboard", path: "/dashboard" }]);
  const [tabIndex, setTabIndex] = useState(0);

  // Sidebar prefs
  const [sidebarMode] = useState(localStorage.getItem("sidebarMode") || "pinned"); // pinned | collapsible | hidden
  const [sidebarPinned, setSidebarPinned] = useState(true); // used when mode === 'collapsible'

  // Mobile UI
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [drawerType, setDrawerType] = useState(null); // search | notifications | profile

  // Keep tabs in sync with route
  useEffect(() => {
    const currentPath = location.pathname;
    const tabExists = tabs.some((t) => t.path === currentPath);
    if (!tabExists) {
      const label = routeLabels[currentPath] || "Unknown";
      const next = [...tabs, { label, path: currentPath }];
      setTabs(next);
      setTabIndex(next.length - 1);
    } else {
      setTabIndex(tabs.findIndex((t) => t.path === currentPath));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    sessionStorage.setItem("tabs", JSON.stringify(tabs));
    sessionStorage.setItem("tabIndex", String(tabIndex));
  }, [tabs, tabIndex]);

  const handleTabChange = (_ev, newIndex, path) => {
    setTabIndex(newIndex);
    if (path) navigate(path);
  };

  const handleTabClose = (tabId) => {
    const closingIndex = tabs.findIndex((t) => t.path === tabId);
    if (closingIndex === 0) return; // keep Dashboard
    const next = tabs.filter((t) => t.path !== tabId);
    setTabs(next);
    if (location.pathname === tabId) {
      const fallbackIndex = Math.max(0, closingIndex - 1);
      navigate(next[fallbackIndex]?.path || "/dashboard");
    }
  };

  const handleTabReorder = (tabsReordered) => setTabs(tabsReordered);

  const activateOrAddTab = (label) => {
    const path = `/${label.toLowerCase().replace(/\s+/g, "-")}`;
    const existing = tabs.find((t) => t.path === path);
    if (existing) {
      const idx = tabs.findIndex((t) => t.path === path);
      setTabIndex(idx);
      navigate(existing.path);
    } else {
      const next = [...tabs, { label, path }];
      setTabs(next);
      setTabIndex(next.length - 1);
      navigate(path);
    }
  };

  const sidebarItems = [
    { label: "Dashboard", icon: <DashboardIcon /> },
    { label: "Incidents", icon: <ListAltIcon /> },
    { label: "Assets", icon: <StorageIcon /> },
    { label: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        height: "100dvh",               // stable viewport height on mobile
        width: "100%",
        overflow: "hidden",             // prevent body scroll; we control scroll inside <main>
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Desktop Sidebar (flow-in) */}
      {!isMobile && sidebarMode !== "hidden" && (
        <Sidebar
          pinned={sidebarMode === "pinned" ? true : sidebarPinned}
          onToggle={() => {
            if (sidebarMode === "collapsible") setSidebarPinned((p) => !p);
          }}
          items={sidebarItems}
          onItemClick={activateOrAddTab}
          widthExpanded={EXPANDED_WIDTH}
          widthCollapsed={COLLAPSED_WIDTH}
        />
      )}

      {/* Column (not scrollable) */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100dvh",           // fill viewport
          minWidth: 0,
        }}
      >
        {/* Navbar stays in place because the column itself does not scroll */}
        <NavbarTabs
          tabs={tabs}
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          handleTabClose={handleTabClose}
          handleTabReorder={handleTabReorder}
          isMobile={isMobile}
        />

        {/* The ONLY scroll container */}
        <Box
          component="main"
          sx={{
            height: `calc(100dvh - ${NAVBAR_HEIGHT}px)`, // don’t subtract bottom bar; it’s fixed
            overflowY: "auto",
            overflowX: "hidden",
            px: 2,
            pb: isMobile ? `${BOTTOM_NAV_HEIGHT + 8}px` : 2, // keep content clear of the fixed bottom bar
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </Box>

        {/* Mobile bottom nav (fixed overlay) */}
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
              height: BOTTOM_NAV_HEIGHT,
            }}
          >
            <MenuIcon onClick={() => setMobileSidebarOpen(true)} />
            <SearchIcon onClick={() => setDrawerType("search")} />
            <NotificationsIcon onClick={() => setDrawerType("notifications")} />
            <AccountCircleIcon onClick={() => setDrawerType("profile")} />
          </Box>
        )}
      </Box>

      {/* Mobile Sidebar Drawer (overlay) */}
      {isMobile && (
        <SwipeableDrawer
          anchor="left"
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          PaperProps={{
            sx: {
              width: EXPANDED_WIDTH,
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          <Sidebar
            pinned
            onToggle={() => {}}
            items={sidebarItems}
            onItemClick={(label) => {
              activateOrAddTab(label);
              setMobileSidebarOpen(false);
            }}
            widthExpanded={EXPANDED_WIDTH}
            widthCollapsed={COLLAPSED_WIDTH}
          />
        </SwipeableDrawer>
      )}

      {/* Mobile Action Drawer (bottom) */}
      {isMobile && (
        <SwipeableDrawer
          anchor="bottom"
          open={Boolean(drawerType)}
          onClose={() => setDrawerType(null)}
          disableSwipeToOpen={false}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              // Keep visible above bottom nav without changing page height
              height: `calc(60dvh - ${BOTTOM_NAV_HEIGHT}px)`,
              mb: `${BOTTOM_NAV_HEIGHT}px`,
              p: 2,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            },
          }}
          hideBackdrop
        >
          {drawerType === "search" && <Typography variant="h6">Search</Typography>}
          {drawerType === "notifications" && <Typography variant="h6">Notifications</Typography>}
          {drawerType === "profile" && <Typography variant="h6">Profile</Typography>}
        </SwipeableDrawer>
      )}
    </Box>
  );
};

export default Layout;
