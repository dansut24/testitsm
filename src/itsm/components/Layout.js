// Layout.js
import React, { useState, useEffect } from "react";
import { Box, useTheme, useMediaQuery, IconButton, SwipeableDrawer, List, ListItem, ListItemText } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import NavbarTabs from "./NavbarTabs";
import BackToTop from "./BackToTop";
import BreadcrumbsNav from "./BreadcrumbsNav";

const NAVBAR_HEIGHT = 48;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  const [tabs, setTabs] = useState([{ label: "Dashboard", path: "/dashboard" }]);
  const [tabIndex, setTabIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleTabChange = (ev, newIndex) => {
    setTabIndex(newIndex);
    navigate(tabs[newIndex].path);
  };

  const handleTabClose = (pathToClose) => {
    const closingIndex = tabs.findIndex((t) => t.path === pathToClose);
    const newTabs = tabs.filter((t) => t.path !== pathToClose);
    setTabs(newTabs);
    if (location.pathname === pathToClose) {
      const fallbackIndex = closingIndex === 0 ? 0 : closingIndex - 1;
      const fallbackTab = newTabs[fallbackIndex] || { path: "/dashboard" };
      navigate(fallbackTab.path);
    }
  };

  const menuItems = [
    { text: "Dashboard", path: "/dashboard" },
    { text: "Incidents", path: "/incidents" },
    { text: "Service Requests", path: "/service-requests" },
    { text: "Changes", path: "/changes" },
    { text: "Problems", path: "/problems" },
    { text: "Assets", path: "/assets" },
    { text: "Knowledge Base", path: "/knowledge-base" },
    { text: "Reports", path: "/reports" },
    { text: "Approvals", path: "/approvals" },
    { text: "Profile", path: "/profile" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Navbar */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: NAVBAR_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "background.paper",
          zIndex: theme.zIndex.appBar,
          px: 1,
          boxShadow: 1,
        }}
      >
        {/* Hamburger only on mobile */}
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
        )}

        {/* Navbar Tabs */}
        <NavbarTabs
          tabs={tabs}
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          handleTabClose={handleTabClose}
          sidebarOpen={false} // no sidebar
          isMobile={isMobile}
        />

        {/* Right-hand icons (search/notifications/account) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 16 }}></Box>
      </Box>

      {/* Mobile Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
      >
        <List sx={{ width: 240 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
            >
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </SwipeableDrawer>

      {/* Main content */}
      <Box sx={{ flex: 1, mt: NAVBAR_HEIGHT, overflow: "auto", px: 1 }}>
        <Outlet />
        <BreadcrumbsNav />
        <BackToTop />
      </Box>
    </Box>
  );
};

export default Layout;
