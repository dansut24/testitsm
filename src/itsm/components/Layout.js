// src/itsm/components/Layout.js
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

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 48;
const NAVBAR_HEIGHT = 48;
const BOTTOM_NAV_HEIGHT = 56;

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

  // Sidebar mode & state
  const [sidebarMode] = useState(localStorage.getItem("sidebarMode") || "pinned"); // "pinned" | "collapsible" | "hidden"
  const [sidebarPinned, setSidebarPinned] = useState(true); // only for "collapsible"

  // Mobile
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [drawerType, setDrawerType] = useState(null); // "search" | "notifications" | "profile" | null

  // 🔹 Fix viewport jumps on mobile (handles rotation aggressively)
  useEffect(() => {
    const setViewportVars = () => {
      const vh = window.innerHeight * 0.01;
      const vw = window.innerWidth * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      document.documentElement.style.setProperty("--vw", `${vw}px`);
    };
    const bump = () => {
      setViewportVars();
      requestAnimationFrame(setViewportVars);
      setTimeout(setViewportVars, 250);
      setTimeout(setViewportVars, 750);
    };
    setViewportVars();
    window.addEventListener("resize", bump);
    window.addEventListener("orientationchange", bump);
    window.addEventListener("visibilitychange", bump);
    return () => {
      window.removeEventListener("resize", bump);
      window.removeEventListener("orientationchange", bump);
      window.removeEventListener("visibilitychange", bump);
    };
  }, []);

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
        position: "fixed",
        inset: 0,
        display: "flex",
        width: "100%",
        maxWidth: "100vw", // prevent horizontal overflow after rotation
        height: "calc(var(--vh, 1vh) * 100)",
        overflow: "hidden",
        bgcolor: theme.palette.background.default,
        overscrollBehavior: "none",
      }}
    >
      {/* Desktop Sidebar (inline; never duplicates) */}
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

      {/* Main grid */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "grid",
          gridTemplateRows: isMobile
            ? `${NAVBAR_HEIGHT}px 1fr ${BOTTOM_NAV_HEIGHT}px`
            : `${NAVBAR_HEIGHT}px 1fr`,
          height: "100%",
        }}
      >
        {/* Navbar row */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1200,
            bgcolor: theme.palette.background.paper,
            // leave space for favicon if sidebar is hidden
            pl: sidebarMode === "hidden" ? 5 : 0, // ~40px
          }}
        >
          {/* ✅ Bing favicon as logo (only when sidebar is hidden) */}
          {sidebarMode === "hidden" && (
            <Box
              component="img"
              src="https://www.bing.com/sa/simg/favicon-2x.ico"
              alt="Logo"
              onClick={() => navigate("/dashboard")}
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                width: 24,
                height: 24,
                borderRadius: 2,
                cursor: "pointer",
                zIndex: 1300,
              }}
            />
          )}

          <NavbarTabs
            tabs={tabs}
            tabIndex={tabIndex}
            handleTabChange={handleTabChange}
            handleTabClose={handleTabClose}
            handleTabReorder={handleTabReorder}
            isMobile={isMobile}
          />
        </Box>

        {/* Scrollable content row */}
        <Box
          component="main"
          sx={{
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            px: 2,
            pt: 1,
            pb: isMobile ? 1 : 2,
          }}
        >
          <Outlet />
        </Box>

        {/* Bottom nav row (mobile only) */}
        {isMobile && (
          <Box
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
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

      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <SwipeableDrawer
          anchor="left"
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          onOpen={() => setMobileSidebarOpen(true)}
          ModalProps={{ keepMounted: true }}
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

      {/* Mobile Action Drawer (no dim; offset above bottom nav) */}
      {isMobile && (
        <SwipeableDrawer
          anchor="bottom"
          open={Boolean(drawerType)}
          onClose={() => setDrawerType(null)}
          onOpen={() => {}}
          ModalProps={{
            keepMounted: true,
            BackdropProps: {
              sx: { backgroundColor: "transparent", pointerEvents: "none" },
            },
          }}
          PaperProps={{
            sx: {
              height: `calc(50dvh - ${BOTTOM_NAV_HEIGHT}px)`,
              bottom: `${BOTTOM_NAV_HEIGHT}px`,
              p: 2,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              pointerEvents: "auto",
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
