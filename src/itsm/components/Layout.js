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
const APP_HEADER_HEIGHT = 38;
const TABBAR_HEIGHT = 30;
const NAVBAR_HEIGHT = APP_HEADER_HEIGHT + TABBAR_HEIGHT;
const BOTTOM_NAV_HEIGHT = 56;

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

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  const [tabs, setTabs] = useState([{ label: "Dashboard", path: "/dashboard" }]);
  const [tabIndex, setTabIndex] = useState(0);

  const [sidebarMode] = useState(localStorage.getItem("sidebarMode") || "pinned");
  const [sidebarPinned, setSidebarPinned] = useState(true);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [drawerType, setDrawerType] = useState(null); // 'search' | 'notifications' | 'profile' | null

  const username = "User";
  const userInitial = username[0]?.toUpperCase() || "U";

  // Logout handler for ProfileDrawer
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  // Fix viewport height for mobile
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

  // Sync tabs with current route
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

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        width: "100%",
        height: "calc(var(--vh, 1vh) * 100)",
        overflow: "hidden",
        bgcolor: theme.palette.background.default,
        overscrollBehavior: "none",
      }}
    >
      {/* Sidebar (desktop) */}
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
        {/* Navbar (header + tabs) */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1200,
            bgcolor: "background.paper",
            display: "grid",
            gridTemplateRows: `${APP_HEADER_HEIGHT}px ${TABBAR_HEIGHT}px`,
            borderBottom: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          {/* Row 1: header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1,
              gap: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* Logo / brand / menu */}
            {!isMobile && sidebarMode === "hidden" ? (
              <IconButton
                onClick={() => setMobileSidebarOpen(true)}
                size="small"
              >
                <img
                  src="https://www.bing.com/sa/simg/favicon-2x.ico"
                  alt="Logo"
                  style={{ width: 20, height: 20 }}
                />
              </IconButton>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                <img
                  src="/logo192.png"
                  alt="Logo"
                  style={{ width: 22, height: 22, borderRadius: 4 }}
                />
                {!isMobile && (
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, letterSpacing: 0.3, fontSize: 13 }}
                  >
                    Hi5Tech ITSM
                  </Typography>
                )}
              </Box>
            )}

            {/* Center: search + quick info (tenant & status) */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 1,
                mx: 1,
              }}
            >
              {/* Search – smaller on desktop */}
              <Box
                sx={{
                  flex: isMobile ? 1 : 0,
                  minWidth: 0,
                  maxWidth: isMobile ? "100%" : 320,
                  display: "flex",
                  alignItems: "center",
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.03)",
                  borderRadius: 999,
                  px: 1,
                  py: 0,
                  height: 26,
                }}
              >
                <SearchIcon sx={{ fontSize: 16, mr: 0.75, opacity: 0.7 }} />
                <InputBase
                  placeholder="Search..."
                  sx={{
                    fontSize: 12,
                    width: "100%",
                  }}
                />
              </Box>

              {/* Extra info chips (desktop only) */}
              {!isMobile && (
                <>
                  {/* Tenant chip */}
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 999,
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontSize: 10, color: "text.secondary" }}
                    >
                      Tenant:&nbsp;
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: 10, fontWeight: 500 }}
                    >
                      Hi5Tech
                    </Typography>
                  </Box>

                  {/* Status chip */}
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 999,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(46, 125, 50, 0.25)"
                          : "rgba(76, 175, 80, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "success.main",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ fontSize: 10, color: "success.main" }}
                    >
                      All systems operational
                    </Typography>
                  </Box>
                </>
              )}
            </Box>

            {/* Right actions */}
            {!isMobile && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setDrawerType("notifications")}
                >
                  <NotificationsIcon sx={{ fontSize: 18 }} />
                </IconButton>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: "pointer",
                  }}
                  onClick={() => setDrawerType("profile")}
                >
                  <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                    {userInitial}
                  </Avatar>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography
                      variant="caption"
                      sx={{ lineHeight: 1.2, fontWeight: 500, fontSize: 11 }}
                    >
                      {username}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        lineHeight: 1.1,
                        color: "text.secondary",
                        fontSize: 10,
                      }}
                    >
                      Admin
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {isMobile && (
              <IconButton
                size="small"
                onClick={() => setDrawerType("profile")}
              >
                <AccountCircleIcon sx={{ fontSize: 20 }} />
              </IconButton>
            )}
          </Box>

          {/* Row 2: Tab strip */}
          <Box sx={{ minWidth: 0 }}>
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

        {/* Main content */}
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

        {/* Bottom nav (mobile only) */}
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
            <NotificationsIcon
              onClick={() => setDrawerType("notifications")}
            />
            <AccountCircleIcon
              onClick={() => setDrawerType("profile")}
            />
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

      {/* Desktop right-hand drawer for notifications/profile */}
      {!isMobile && (
        <SwipeableDrawer
          anchor="right"
          open={Boolean(drawerType)}
          onClose={() => setDrawerType(null)}
          onOpen={() => {}}
          PaperProps={{
            sx: {
              width: 360,
              maxWidth: "100%",
            },
          }}
        >
          {drawerType === "notifications" && <NotificationDrawer />}
          {drawerType === "profile" && (
            <ProfileDrawer onLogout={handleLogout} />
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
              height: `calc(50dvh - ${BOTTOM_NAV_HEIGHT}px)`,
              bottom: `${BOTTOM_NAV_HEIGHT}px`,
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
          {drawerType === "profile" && (
            <ProfileDrawer onLogout={handleLogout} />
          )}
        </SwipeableDrawer>
      )}
    </Box>
  );
};

export default Layout;
