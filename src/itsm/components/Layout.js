// Layout.js
import React, { useState, useEffect } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

import NavbarTabs from "./NavbarTabs";
import BackToTop from "./BackToTop";
import BreadcrumbsNav from "./BreadcrumbsNav";

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

  const handleNewTab = () => {
    const newTab = {
      label: "New Tab",
      path: `/new-tab-${Date.now()}`,
    };
    setTabs([...tabs, newTab]);
    const newIndex = tabs.length;
    setTabIndex(newIndex);
    navigate(newTab.path);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%", overflow: "hidden" }}>
      {/* Navbar with tabs */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 36,
          display: "flex",
          alignItems: "center",
          px: 1,
          backgroundColor: "rgba(200,200,200,0.15)", // theme friendly
          backdropFilter: "blur(8px)",
          zIndex: theme.zIndex.appBar,
        }}
      >
        <NavbarTabs
          tabs={tabs}
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          handleTabClose={handleTabClose}
          isMobile={isMobile}
          handleNewTab={handleNewTab}
        />
      </Box>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          mt: "36px", // height of navbar
          overflowY: "auto",
          overflowX: "hidden",
          px: 1,
        }}
      >
        {tabs.length > 0 && <Outlet />}
        <BreadcrumbsNav />
        <BackToTop />
      </Box>
    </Box>
  );
};

export default Layout;
