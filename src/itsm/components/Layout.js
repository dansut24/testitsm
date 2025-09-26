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
// import Sidebar from "./Sidebar";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";

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

  // Tabs state (Dashboard only at start)
  const [tabs, setTabs] = useState([{ label: "Dashboard", path: "/dashboard" }]);
  const [tabIndex, setTabIndex] = useState(0);

  // Desktop sidebar state
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const sidebarWidth = sidebarPinned ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  // Mobile sidebar drawer
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Bottom action drawer (mobile)
  const [drawerType, setDrawerType] = useState(null);

  // Route -> tabs sync
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

  // Persist
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
    // Prevent closing the first tab (Dashboard)
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

  const sidebarItems = Object.values(routeLabels);

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
      {/* Desktop Sidebar (pushes content right) */}
      {!isMobile && (
        <Sidebar
          pinned={sidebarPinned}
          onToggle={() => setSidebarPinned((p) => !p)}
          items={sidebarItems}
          onItemClick={activateOrAddTab}
          widthExpanded={EXPANDED_WIDTH}
          widthCollapsed={COLLAPSED_WIDTH}
          isMobile={false}
        />
      )}

      {/* Main Column */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100vh",
          // Push by sidebar on desktop
          marginLeft: !isMobile ? `${sidebarWidth}px` : 0,
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Mobile: Full-width logo bar on top */}
        {isMobile && (
          <Box
            sx={{
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <img
              src="https://www.bing.com/sa/simg/favicon-2x.ico"
              alt="Logo"
              style={{ width: 28, height: 28 }}
            />
          </Box>
        )}

        {/* Navbar Tabs (no logo inside) */}
        <NavbarTabs
          tabs={tabs}
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          handleTabClose={handleTabClose}
          handleTabReorder={handleTabReorder}
          isMobile={isMobile}
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            px: 2,
            pb: isMobile ? 7 : 0, // leave room for bottom bar on mobile
          }}
        >
          <Outlet />
        </Box>

        {/* Mobile bottom bar (kept) */}
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
            <MenuIcon onClick={() => setMobileSidebarOpen(true)} />
            <SearchIcon onClick={() => setDrawerType("search")} />
            <NotificationsIcon onClick={() => setDrawerType("notifications")} />
            <AccountCircleIcon onClick={() => setDrawerType("profile")} />
          </Box>
        )}
      </Box>

      {/* Mobile Sidebar Drawer (hamburger) */}
      <SwipeableDrawer
        anchor="left"
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        PaperProps={{
          sx: { width: EXPANDED_WIDTH, backgroundColor: theme.palette.background.paper },
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
          isMobile
        />
      </SwipeableDrawer>

      {/* Mobile action drawers */}
      <SwipeableDrawer
        anchor="bottom"
        open={Boolean(drawerType)}
        onClose={() => setDrawerType(null)}
        PaperProps={{
          sx: { height: "50%", p: 2, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
        }}
      >
        {drawerType === "search" && <Typography variant="h6">Search (mobile)</Typography>}
        {drawerType === "notifications" && <Typography variant="h6">Notifications (mobile)</Typography>}
        {drawerType === "profile" && <Typography variant="h6">Profile (mobile)</Typography>}
      </SwipeableDrawer>
    </Box>
  );
};

export default Layout;
