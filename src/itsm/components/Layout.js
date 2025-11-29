// src/itsm/layout/Layout.js
import React, { useState, useEffect } from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
  SwipeableDrawer,
  Typography,
  IconButton,
  InputBase,
  Avatar,
  Stack,
  Menu,
  MenuItem,
} from "@mui/material";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import NavbarTabs from "./NavbarTabs";
import Sidebar from "./Sidebar";

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
};

const STATUS_OPTIONS = [
  { key: "Available", color: "success.main" },
  { key: "Busy", color: "error.main" },
  { key: "Away", color: "warning.main" },
  { key: "Offline", color: "text.disabled" },
];

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  const APP_HEADER_HEIGHT = isMobile ? 52 : BASE_APP_HEADER_HEIGHT;
  const TABBAR_HEIGHT = isMobile ? 42 : BASE_TABBAR_HEIGHT;
  const NAVBAR_HEIGHT = APP_HEADER_HEIGHT + TABBAR_HEIGHT;
  const BOTTOM_NAV_HEIGHT = isMobile ? 64 : BASE_BOTTOM_NAV_HEIGHT;

  const [tabs, setTabs] = useState([{ label: "Dashboard", path: "/dashboard" }]);
  const [tabIndex, setTabIndex] = useState(0);

  const [sidebarMode] = useState(localStorage.getItem("sidebarMode") || "pinned");
  const [sidebarPinned, setSidebarPinned] = useState(true);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [drawerType, setDrawerType] = useState(null);

  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [navbarElevated, setNavbarElevated] = useState(false);

  const username = "User";
  const userInitial = username[0]?.toUpperCase() || "U";

  const [userStatus, setUserStatus] = useState(
    () => localStorage.getItem("userStatus") || "Available"
  );

  useEffect(() => {
    localStorage.setItem("userStatus", userStatus);
  }, [userStatus]);

  // vh fix (mainly mobile)
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  const getStatusColor = (statusKey) => {
    const opt = STATUS_OPTIONS.find((o) => o.key === statusKey);
    return opt ? opt.color : "text.disabled";
  };

  const getNavbarAvatarSx = (statusKey, size = 24) => {
    const base = {
      width: size,
      height: size,
      fontSize: size * 0.5,
      transition: "all 0.2s ease",
      bgcolor:
        theme.palette.mode === "dark"
          ? theme.palette.grey[800]
          : theme.palette.grey[200],
      color: theme.palette.text.primary,
    };

    switch (statusKey) {
      case "Available":
        return {
          ...base,
          border: "2px solid",
          borderColor: "success.main",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 0 0 2px rgba(76,175,80,0.25)"
              : "0 0 0 2px rgba(76,175,80,0.35)",
        };
      case "Busy":
        return {
          ...base,
          border: "2px solid",
          borderColor: "error.main",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 0 0 2px rgba(244,67,54,0.35)"
              : "0 0 0 2px rgba(244,67,54,0.45)",
        };
      case "Away":
        return {
          ...base,
          border: "2px solid",
          borderColor: "warning.main",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 0 0 2px rgba(255,179,0,0.25)"
              : "0 0 0 2px rgba(255,179,0,0.35)",
        };
      case "Offline":
      default:
        return {
          ...base,
          border: "1px dashed",
          borderColor: "text.disabled",
          filter: "grayscale(100%)",
          opacity: 0.6,
        };
    }
  };

  const handleStatusChange = (statusKey) => {
    setUserStatus(statusKey);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

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
    if (closingIndex === 0) return;
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
    { label: "Service Requests", icon: <AssignmentIcon /> },
    { label: "Changes", icon: <ChangeCircleIcon /> },
    { label: "Tasks", icon: <AssignmentTurnedInIcon /> },
    { label: "Profile", icon: <PersonIcon /> },
    { label: "Knowledge Base", icon: <ArticleIcon /> },
    { label: "Settings", icon: <SettingsIcon /> },
    { label: "Assets", icon: <StorageIcon /> },
  ];

  const desktopHasSidebar = !isMobile && sidebarMode !== "hidden";
  const sidebarWidth =
    desktopHasSidebar && (sidebarMode === "pinned" || sidebarPinned)
      ? EXPANDED_WIDTH
      : desktopHasSidebar
      ? COLLAPSED_WIDTH
      : 0;

  const handleMainScroll = (e) => {
    const scrolled = e.currentTarget.scrollTop > 4;
    setNavbarElevated(scrolled);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "calc(var(--vh, 1vh) * 100)",
        display: "flex",
        bgcolor: theme.palette.background.default,
        overflow: "hidden", // no global scroll; only main content scrolls
      }}
    >
      {/* Sidebar (desktop) */}
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
            overflow: "hidden",
          }}
        >
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
        </Box>
      )}

      {/* Right-hand column: navbar + scrollable main + bottom nav (mobile) */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          maxWidth: "100%", // never exceed viewport
          display: "grid",
          gridTemplateRows: isMobile
            ? `${NAVBAR_HEIGHT}px 1fr ${BOTTOM_NAV_HEIGHT}px`
            : `${NAVBAR_HEIGHT}px 1fr`,
          height: "100%",
          overflow: "hidden", // clamp children horizontally
        }}
      >
        {/* NAVBAR (header + tabs) */}
        <Box
          sx={{
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            height: NAVBAR_HEIGHT,
            borderBottom: "1px solid",
            borderColor: "divider",
            zIndex: 1400,
            boxShadow: navbarElevated
              ? theme.palette.mode === "dark"
                ? "0 2px 5px rgba(0,0,0,0.45)"
                : "0 2px 5px rgba(0,0,0,0.15)"
              : "none",
            transition: "box-shadow 0.25s ease",
            minWidth: 0,
            maxWidth: "100%",

            // sticky so the navbar doesn't move during mobile bounce/viewport changes
            position: "sticky",
            top: 0,
            // ensure it sits above the main scrolling area
            backdropFilter: "saturate(120%) blur(2px)",
          }}
        >
          {/* Header row */}
          <Box
            sx={{
              height: APP_HEADER_HEIGHT,
              minHeight: APP_HEADER_HEIGHT,
              display: "flex",
              alignItems: "center",
              px: 1,
              gap: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
              pt: isMobile ? 0.5 : 0,
              minWidth: 0,
            }}
          >
            {/* Logo / brand / menu */}
            {!isMobile && sidebarMode === "hidden" ? (
              <IconButton onClick={() => setMobileSidebarOpen(true)} size="small">
                <img
                  src="https://www.bing.com/sa/simg/favicon-2x.ico"
                  alt="Logo"
                  style={{ width: 20, height: 20 }}
                />
              </IconButton>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
                <img src="/logo192.png" alt="Logo" style={{ width: 22, height: 22, borderRadius: 4 }} />
                {!isMobile && (
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, letterSpacing: 0.3, fontSize: 13 }}>
                    Hi5Tech ITSM
                  </Typography>
                )}
              </Box>
            )}

            {/* Search + quick info */}
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 1, mx: 1 }}>
              <Box
                sx={{
                  flex: isMobile ? 1 : 0,
                  minWidth: 0,
                  maxWidth: isMobile ? "100%" : 320,
                  display: "flex",
                  alignItems: "center",
                  bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                  borderRadius: 999,
                  px: isMobile ? 1.4 : 1,
                  py: 0,
                  height: isMobile ? 32 : 26,
                }}
              >
                <SearchIcon sx={{ fontSize: isMobile ? 20 : 16, mr: 1, opacity: 0.7 }} />
                <InputBase placeholder="Search..." sx={{ fontSize: isMobile ? 13 : 12, width: "100%" }} />
              </Box>

              {!isMobile && (
                <>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 999,
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: 10, color: "text.secondary" }}>
                      Tenant:&nbsp;
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 500 }}>
                      Hi5Tech
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 999,
                      bgcolor: theme.palette.mode === "dark" ? "rgba(46, 125, 50, 0.25)" : "rgba(76, 175, 80, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main" }} />
                    <Typography variant="caption" sx={{ fontSize: 10, color: "success.main" }}>
                      All systems operational
                    </Typography>
                  </Box>
                </>
              )}
            </Box>

            {/* Right actions (desktop) */}
            {!isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                <IconButton size="small" onClick={() => setDrawerType("notifications")}>
                  <NotificationsIcon sx={{ fontSize: 18 }} />
                </IconButton>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }} onClick={() => setDrawerType("profile")}>
                  <Box sx={{ position: "relative" }}>
                    <Avatar sx={getNavbarAvatarSx(userStatus, 24)}>{userInitial}</Avatar>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -1,
                        right: -1,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        border: "2px solid",
                        borderColor: "background.paper",
                        bgcolor: getStatusColor(userStatus),
                      }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography variant="caption" sx={{ lineHeight: 1.2, fontWeight: 500, fontSize: 11 }}>
                      {username}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ lineHeight: 1.1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: getStatusColor(userStatus) }} />
                      <Typography variant="caption" sx={{ color: getStatusColor(userStatus), fontSize: 10 }}>
                        {userStatus}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Mobile profile icon + status dropdown */}
            {isMobile && (
              <>
                <IconButton size="small" onClick={(e) => setStatusMenuAnchor(e.currentTarget)}>
                  <Box sx={{ position: "relative", display: "flex" }}>
                    <AccountCircleIcon sx={{ fontSize: 22, opacity: userStatus === "Offline" ? 0.6 : 1 }} />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: -1,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        border: "2px solid",
                        borderColor: "background.paper",
                        bgcolor: getStatusColor(userStatus),
                        boxShadow: userStatus === "Busy" ? "0 0 0 2px rgba(244,67,54,0.4)" : "none",
                      }}
                    />
                  </Box>
                </IconButton>

                <Menu
                  anchorEl={statusMenuAnchor}
                  open={Boolean(statusMenuAnchor)}
                  onClose={() => setStatusMenuAnchor(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem
                      key={opt.key}
                      selected={userStatus === opt.key}
                      onClick={() => {
                        handleStatusChange(opt.key);
                        setStatusMenuAnchor(null);
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: opt.color }} />
                        <Typography variant="body2">{opt.key}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Box>

          {/* Tabs row */}
          <Box sx={{ height: TABBAR_HEIGHT, minHeight: TABBAR_HEIGHT, minWidth: 0, overflowX: "hidden" }}>
            <NavbarTabs
              tabs={tabs}
              tabIndex={tabIndex}
              handleTabChange={handleTabChange}
              handleTabClose={handleTabClose}
              handleTabReorder={handleTabReorder}
              isMobile={isMobile}
            />
          </Box>
        </Box>

        {/* MAIN CONTENT */}
        <Box
          component="main"
          onScroll={handleMainScroll}
          sx={{
            minHeight: 0,
            height: "100%",
            width: "100%",
            overflowY: "auto", // only main content scrolls
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain", // keep bounce contained to main content
            touchAction: "pan-y", // allow vertical pans; reduce accidental horizontal gestures
            px: 2,
            pt: 1,
            pb: isMobile ? 1 : 2,
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </Box>

        {/* Bottom nav row (mobile) */}
        {isMobile && (
          <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
            <MenuIcon onClick={() => setMobileSidebarOpen(true)} />
            <SearchIcon onClick={() => setDrawerType("search")} />
            <NotificationsIcon onClick={() => setDrawerType("notifications")} />
            <AccountCircleIcon onClick={() => setDrawerType("profile")} style={{ cursor: "pointer" }} />
          </Box>
        )}
      </Box>

      {/* Sidebar Drawer (mobile & hidden desktop) */}
      {(isMobile || sidebarMode === "hidden") && (
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

      {/* Desktop right-hand drawer */}
      {!isMobile && (
        <SwipeableDrawer
          anchor="right"
          open={Boolean(drawerType)}
          onClose={() => setDrawerType(null)}
          onOpen={() => {}}
          disableSwipeToOpen
          disableDiscovery
          swipeAreaWidth={0}
          PaperProps={{
            sx: {
              width: 360,
              maxWidth: "100%",
            },
          }}
        >
          {drawerType === "notifications" && <NotificationDrawer />}
          {drawerType === "profile" && (
            <ProfileDrawer status={userStatus} onStatusChange={handleStatusChange} onLogout={handleLogout} showStatus />
          )}
          {drawerType === "search" && (
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Search
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Advanced search coming soon.
              </Typography>
            </Box>
          )}
        </SwipeableDrawer>
      )}

      {/* Bottom action drawer (mobile) */}
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
              height: `calc(50dvh - ${BASE_BOTTOM_NAV_HEIGHT}px)`,
              bottom: `${BASE_BOTTOM_NAV_HEIGHT}px`,
              p: 2,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              pointerEvents: "auto",
            },
          }}
        >
          {drawerType === "search" && (
            <Typography variant="h6" gutterBottom>
              Search
            </Typography>
          )}
          {drawerType === "notifications" && <NotificationDrawer />}
          {drawerType === "profile" && <ProfileDrawer onLogout={handleLogout} showStatus={false} />}
        </SwipeableDrawer>
      )}
    </Box>
  );
};

export default Layout;
