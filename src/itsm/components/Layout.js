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

  // Sidebar mode/state (desktop)
  const [sidebarMode] = useState(localStorage.getItem("sidebarMode") || "pinned"); // "pinned" | "collapsible" | "hidden"
  const [sidebarPinned, setSidebarPinned] = useState(true); // used only when collapsible

  // Mobile
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [drawerType, setDrawerType] = useState(null); // "search" | "notifications" | "profile" | null

  // Sync tabs with route
  useEffect(() => {
    const currentPath = location.pathname;
    const tabExists = tabs.some((t) => t.path === currentPath);
    if (!tabExists) {
      const label = routeLabels[currentPath] || "Unknown";
      const newTabs = [...tabs, { label, path: currentPath }];
      setTabs(newTabs);
      setTabIndex(newTabs.length - 1);
    } else {
      setTabIndex(tabs.findIndex((t) => t.path === currentPath));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    sessionStorage.setItem("tabs", JSON.stringify(tabs));
    sessionStorage.setItem("tabIndex", tabIndex.toString());
  }, [tabs, tabIndex]);

  const handleTabChange = (_ev, newIndex, path) => {
    setTabIndex(newIndex);
    if (path) navigate(path);
  };

  const handleTabClose = (tabId) => {
    const closingIndex = tabs.findIndex((t) => t.path === tabId);
    if (closingIndex === 0) return; // keep Dashboard
    const newTabs = tabs.filter((t) => t.path !== tabId);
    setTabs(newTabs);
    if (location.pathname === tabId) {
      const fallbackIndex = Math.max(0, closingIndex - 1);
      navigate(newTabs[fallbackIndex]?.path || "/dashboard");
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
      const newTabs = [...tabs, { label, path }];
      setTabs(newTabs);
      setTabIndex(newTabs.length - 1);
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
        height: "100dvh", // prevents iOS toolbar jump
        width: "100%",
        overflow: "hidden",
        bgcolor: theme.palette.background.default,
        // Avoid rubber-band reflows on iOS
        overscrollBehaviorY: "none",
      }}
    >
      {/* Desktop Sidebar (in-flow, never duplicated) */}
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

      {/* Main column */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sticky Navbar (outside the scroll container) */}
        <Box
          sx={{
            position: "sticky",
            top: "env(safe-area-inset-top, 0px)",
            zIndex: 1200,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <NavbarTabs
            tabs={tabs}
            tabIndex={tabIndex}
            handleTabChange={handleTabChange}
            handleTabClose={handleTabClose}
            handleTabReorder={handleTabReorder}
            isMobile={isMobile}
          />
        </Box>

        {/* Scrollable content area */}
        <Box
  component="main"
  sx={{
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    px: 2,
    pb: isMobile ? 7 : 0, // space for bottom nav
    minHeight: `calc(100vh - 48px - ${isMobile ? 56 : 0}px)`,
    // 48px = top navbar, 56px = mobile bottom nav
    boxSizing: "border-box",
  }}
>
  <Outlet />
</Box>
        {/* Mobile bottom nav */}
        {isMobile && (
          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              height: BOTTOM_NAV_HEIGHT,
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
              zIndex: 1500,
              WebkitTapHighlightColor: "transparent",
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
              bgcolor: theme.palette.background.paper,
            },
          }}
          ModalProps={{ keepMounted: true }}
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

      {/* Mobile Action Drawer (no dimming, sits above bottom nav, swipeable down) */}
      {isMobile && (
        <SwipeableDrawer
          anchor="bottom"
          open={Boolean(drawerType)}
          onClose={() => setDrawerType(null)}
          onOpen={() => {}}
          disableBackdropTransition
          keepMounted
          ModalProps={{ keepMounted: true }}
          BackdropProps={{
            invisible: true,
            sx: { backgroundColor: "transparent", pointerEvents: "none" },
          }}
          PaperProps={{
            sx: {
              height: "50%",
              bottom: `${BOTTOM_NAV_HEIGHT}px`, // respect bottom nav
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              p: 2,
            },
          }}
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
