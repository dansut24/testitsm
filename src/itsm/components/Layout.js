// src/itsm/components/Layout.js
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
  SwipeableDrawer,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import { useLocation, useNavigate, Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import NavbarTabs from "./NavbarTabs";

import NotificationDrawer from "./NotificationDrawer";
import ProfileDrawer from "./ProfileDrawer";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import StorageIcon from "@mui/icons-material/Storage";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PersonIcon from "@mui/icons-material/Person";
import ArticleIcon from "@mui/icons-material/Article";

import { supabase } from "../../common/utils/supabaseClient";
import { getCentralLoginUrl } from "../../common/utils/portalUrl";

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 60;

const BASE_APP_HEADER_HEIGHT = 38;
const BASE_TABBAR_HEIGHT = 30;
const BASE_BOTTOM_NAV_HEIGHT = 56;

const routeLabels = {
  "/dashboard": "Dashboard",
  "/incidents": "Incidents",
  "/service-requests": "Service Requests",
  "/changes": "Changes",
  "/tasks": "Tasks",
  "/profile": "Profile",
  "/knowledge-base": "Knowledge Base",
  "/settings": "Settings",
  "/assets": "Assets",
  "/new-tab": "New Tab",
};

// -------------------------
// Glass tokens
// -------------------------
function useGlassTokens(theme) {
  const isDark = theme.palette.mode === "dark";

  return useMemo(() => {
    const border = isDark
      ? "1px solid rgba(255,255,255,0.12)"
      : "1px solid rgba(15,23,42,0.10)";

    const divider = isDark
      ? "rgba(255,255,255,0.10)"
      : "rgba(15,23,42,0.08)";

    const bg = isDark
      ? "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))"
      : "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,255,255,0.55))";

    const shadow = isDark
      ? "0 18px 55px rgba(0,0,0,0.35)"
      : "0 18px 55px rgba(2,6,23,0.12)";

    const pageBg = isDark
      ? `
        radial-gradient(1200px 800px at 20% 10%, rgba(124,92,255,.28), transparent 60%),
        radial-gradient(1000px 700px at 85% 25%, rgba(56,189,248,.18), transparent 55%),
        linear-gradient(180deg,#070A12,#0A1022 45%,#0B1633)
      `
      : `
        radial-gradient(1200px 800px at 20% 10%, rgba(124,92,255,.12), transparent 60%),
        radial-gradient(1000px 700px at 85% 25%, rgba(56,189,248,.10), transparent 55%),
        linear-gradient(180deg,#F8FAFF,#EEF3FF 45%,#EAF2FF)
      `;

    return {
      isDark,
      page: { background: pageBg },
      glass: { border, divider, bg, shadow },
      iconFg: isDark ? "rgba(255,255,255,.8)" : "rgba(2,6,23,.7)",
    };
  }, [isDark]);
}

function GlassBar({ children, t }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderBottom: t.glass.border,
        background: t.glass.bg,
        backdropFilter: "blur(14px)",
        boxShadow: "none",
      }}
    >
      {children}
    </Paper>
  );
}

const Layout = () => {
  const theme = useTheme();
  const t = useGlassTokens(theme);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();
  const location = useLocation();

  const APP_HEADER_HEIGHT = isMobile ? 52 : BASE_APP_HEADER_HEIGHT;
  const TABBAR_HEIGHT = isMobile ? 42 : BASE_TABBAR_HEIGHT;
  const NAVBAR_HEIGHT = APP_HEADER_HEIGHT + TABBAR_HEIGHT;

  const [tabs, setTabs] = useState([{ label: "Dashboard", path: "/dashboard" }]);
  const [tabIndex, setTabIndex] = useState(0);

  const [sidebarPinned, setSidebarPinned] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [drawerType, setDrawerType] = useState(null);

  const [navbarElevated, setNavbarElevated] = useState(false);
  const [userStatus, setUserStatus] = useState("Available");

  // -------------------------
  // ✅ FIXED LOGOUT
  // -------------------------
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }

    const central = getCentralLoginUrl("/itsm");
    const sep = central.includes("?") ? "&" : "?";

    window.location.replace(`${central}${sep}logout=1&ts=${Date.now()}`);
  };

  // -------------------------
  // Tabs sync
  // -------------------------
  useEffect(() => {
    const path = location.pathname;
    const exists = tabs.some((t) => t.path === path);

    if (!exists) {
      const label = routeLabels[path] || "Unknown";
      const newTabs = [...tabs, { label, path }];
      setTabs(newTabs);
      setTabIndex(newTabs.length - 1);
    } else {
      setTabIndex(tabs.findIndex((t) => t.path === path));
    }
  }, [location.pathname]); // eslint-disable-line

  const activateOrAddTab = (label) => {
    const path = `/${label.toLowerCase().replace(/\s+/g, "-")}`;
    const existing = tabs.find((t) => t.path === path);
    if (existing) {
      navigate(existing.path);
    } else {
      setTabs((t) => [...t, { label, path }]);
      navigate(path);
    }
  };

  const sidebarItems = [
    { label: "Dashboard", icon: <DashboardIcon /> },
    { label: "Incidents", icon: <ListAltIcon /> },
    { label: "Service Requests", icon: <AssignmentIcon /> },
    { label: "Changes", icon: <ChangeCircleIcon /> },
    { label: "Tasks", icon: <AssignmentTurnedInIcon /> },
    { label: "Profile", icon: <PersonIcon /> },
    { label: "Knowledge Base", icon: <ArticleIcon /> },
    { label: "Settings", icon: <SettingsIcon /> },
    { label: "Assets", icon: <StorageIcon /> },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        background: t.page.background,
      }}
    >
      {/* Sidebar */}
      <Paper
        elevation={0}
        sx={{
          width: sidebarPinned ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          borderRight: t.glass.border,
          background: t.glass.bg,
          backdropFilter: "blur(14px)",
        }}
      >
        <Sidebar
          pinned
          items={sidebarItems}
          onItemClick={activateOrAddTab}
        />
      </Paper>

      {/* Main column */}
      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateRows: `${NAVBAR_HEIGHT}px 1fr ${
            isMobile ? BASE_BOTTOM_NAV_HEIGHT : 0
          }px`,
        }}
      >
        {/* Navbar */}
        <GlassBar t={t}>
          <Navbar
            isMobile={isMobile}
            userStatus={userStatus}
            setDrawerType={setDrawerType}
          />

          <NavbarTabs
            tabs={tabs}
            tabIndex={tabIndex}
            handleTabChange={(_, i, p) => p && navigate(p)}
            handleNewTab={() => activateOrAddTab("New Tab")}
          />
        </GlassBar>

        {/* Content */}
        <Box
          component="main"
          onScroll={(e) => setNavbarElevated(e.currentTarget.scrollTop > 4)}
          sx={{ overflowY: "auto", p: 2 }}
        >
          <Outlet />
        </Box>

        {/* Mobile bottom bar */}
        {isMobile && (
          <Paper
            elevation={0}
            sx={{
              borderTop: t.glass.border,
              background: t.glass.bg,
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <IconButton onClick={() => setMobileSidebarOpen(true)}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={() => setDrawerType("notifications")}>
              <NotificationsIcon />
            </IconButton>
            <IconButton onClick={() => setDrawerType("profile")}>
              <AccountCircleIcon />
            </IconButton>
          </Paper>
        )}
      </Box>

      {/* Right drawers */}
      <SwipeableDrawer
        anchor="right"
        open={drawerType === "profile"}
        onClose={() => setDrawerType(null)}
      >
        <ProfileDrawer
          status={userStatus}
          onLogout={handleLogout}
        />
      </SwipeableDrawer>

      <SwipeableDrawer
        anchor="right"
        open={drawerType === "notifications"}
        onClose={() => setDrawerType(null)}
      >
        <NotificationDrawer />
      </SwipeableDrawer>
    </Box>
  );
};

export default Layout;
