// Layout.js
import React, { useState, useEffect } from "react";
import { Box, useTheme, useMediaQuery, IconButton, SwipeableDrawer, List, ListItem, ListItemText } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

import NavbarTabs from "./NavbarTabs";
import BackToTop from "./BackToTop";
import BreadcrumbsNav from "./BreadcrumbsNav";

const NAVBAR_HEIGHT = 34;
const NAVBAR_PADDING = 7;

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
  "/admin-settings": "Admin Settings",
  "/new-incident": "New Incident",
};

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  const [tabs, setTabs] = useState(() => {
    const stored = sessionStorage.getItem("tabs");
    return stored ? JSON.parse(stored) : [{ label: "Dashboard", path: "/dashboard" }];
  });
  const [tabIndex, setTabIndex] = useState(() => {
    const storedIndex = sessionStorage.getItem("tabIndex");
    return storedIndex ? parseInt(storedIndex, 10) : 0;
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const role = user?.role || "user";

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

  // Update tabs on route change
  useEffect(() => {
    const currentPath = location.pathname;
    const tabExists = tabs.some((t) => t.path === currentPath);

    if (!tabExists) {
      const fetchLabel = async () => {
        try {
          let label = routeLabels[currentPath] || "Unknown";
          if (currentPath.startsWith("/incidents/")) {
            const id = currentPath.split("/")[2];
            const { data } = await supabase
              .from("incidents")
              .select("reference")
              .eq("id", id)
              .maybeSingle();
            if (data?.reference) label = data.reference;
          }
          const newTabs = [...tabs, { label, path: currentPath }];
          setTabs(newTabs);
          setTabIndex(newTabs.length - 1);
        } catch (err) {
          console.error("Failed to fetch tab label:", err);
        }
      };
      fetchLabel();
    } else {
      const index = tabs.findIndex((t) => t.path === currentPath);
      setTabIndex(index);
    }
  }, [location.pathname]); // eslint-disable-line

  // Persist tabs
  useEffect(() => {
    if (tabs.length > 0) sessionStorage.setItem("tabs", JSON.stringify(tabs));
  }, [tabs]);
  useEffect(() => {
    sessionStorage.setItem("tabIndex", tabIndex.toString());
  }, [tabIndex]);

  // Drawer menu items (optional sections for mobile)
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
    ...(role === "admin" ? [{ text: "Admin Settings", path: "/admin-settings" }] : [{ text: "Settings", path: "/settings" }]),
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%", overflow: "hidden" }}>
      {/* Top Navbar */}
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
          px: NAVBAR_PADDING,
          boxShadow: 1,
        }}
      >
        {/* Hamburger / Logo */}
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { xs: "block", sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Navbar Tabs */}
        <NavbarTabs
          tabs={tabs}
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          handleTabClose={handleTabClose}
          sidebarOpen={false} // no sidebar
          isMobile={isMobile}
        />

        {/* Right Icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Keep your Search, Notifications, Account icons here */}
        </Box>
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

      {/* Main Content */}
      <Box sx={{ flex: 1, mt: NAVBAR_HEIGHT, overflow: "auto", px: 1 }}>
        <Outlet />
        <BreadcrumbsNav />
        <BackToTop />
      </Box>
    </Box>
  );
};

export default Layout;
