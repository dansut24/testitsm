// Layout.js
import React, { useState, useEffect } from "react";
import { Box, useTheme, useMediaQuery, SwipeableDrawer, Typography } from "@mui/material";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import NavbarTabs from "./NavbarTabs";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

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
  const [tabs, setTabs] = useState([{ label: "Dashboard", path: "/dashboard" }]);
  const [tabIndex, setTabIndex] = useState(0);

  // Sidebar state
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const sidebarWidth = sidebarPinned ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  // Mobile drawer state
  const [drawerType, setDrawerType] = useState(null);

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
    if (closingIndex === 0) return; // don’t close first tab
    const newTabs = tabs.filter((t) => t.path !== tabId);
    setTabs(newTabs);

    if (location.pathname === tabId) {
      const fallbackIndex = closingIndex - 1 >= 0 ? closingIndex - 1 : 0;
      const fallbackTab = newTabs[fallbackIndex] || { path: "/dashboard" };
      navigate(fallbackTab.path);
    }
  };

  const handleTabReorder = (tabsReordered) => setTabs(tabsReordered);

  const activateOrAddTab = (label) => {
    const existing = tabs.find((t) => t.label === label);
    if (existing) {
      setTabIndex(tabs.findIndex((t) => t.label === label));
      navigate(existing.path);
    } else {
      const newTab = { label, path: `/${label.toLowerCase().replace(/\s+/g, "-")}` };
      const newTabs = [...tabs, newTab];
      setTabs(newTabs);
      setTabIndex(newTabs.length - 1);
      navigate(newTab.path);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100%" }}>
      {/* Sidebar with logo + items */}
      {!isMobile && (
        <Box
          sx={{
            width: sidebarWidth,
            transition: "width 0.3s ease",
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
            onClick={() => setSidebarPinned((prev) => !prev)}
          >
            <img
              src="https://www.bing.com/sa/simg/favicon-2x.ico"
              alt="Logo"
              style={{ width: 28, height: 28 }}
            />
          </Box>

          {/* Sidebar items */}
          <Box sx={{ flex: 1, p: 1 }}>
            {Object.values(routeLabels).map((label) => (
              <Box
                key={label}
                sx={{
                  py: 1,
                  px: sidebarPinned ? 2 : 1,
                  cursor: "pointer",
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  "&:hover": { backgroundColor: theme.palette.action.hover },
                }}
                onClick={() => activateOrAddTab(label)}
              >
                {label}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Main area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Navbar + Tabs */}
        <NavbarTabs
          tabs={tabs}
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          handleTabClose={handleTabClose}
          handleTabReorder={handleTabReorder}
          isMobile={isMobile}
        />

        {/* Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            px: 2,
            pb: isMobile ? 7 : 0,
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

      {/* Mobile drawers */}
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
