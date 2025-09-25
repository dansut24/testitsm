// Layout.js
import React, { useState, useEffect } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

import Sidebar from "./Sidebar";
import NavbarTabs from "./NavbarTabs";
import BackToTop from "./BackToTop";
import BreadcrumbsNav from "./BreadcrumbsNav";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import BugReportIcon from "@mui/icons-material/BugReport";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BarChartIcon from "@mui/icons-material/BarChart";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";

const expandedWidth = 256;
const collapsedWidth = 48;
const NAVBAR_HEIGHT = 34; // visual height
const NAVBAR_PADDING_TOP = 6; // top padding (so top offset = 40)

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

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [tabs, setTabs] = useState(() => {
    const stored = sessionStorage.getItem("tabs");
    return stored ? JSON.parse(stored) : [{ label: "Dashboard", path: "/dashboard" }];
  });
  const [tabIndex, setTabIndex] = useState(() => {
    const storedIndex = sessionStorage.getItem("tabIndex");
    return storedIndex ? parseInt(storedIndex, 10) : 0;
  });

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const role = user?.role || "user";

  const sidebarWidth = sidebarOpen ? expandedWidth : collapsedWidth;
  const navbarOffset = NAVBAR_HEIGHT + NAVBAR_PADDING_TOP; // 40

  // Update tabs on route change (keeps your existing behavior)
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

  // Responsive sidebar defaults
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setMobileOpen(false);
    } else {
      setSidebarOpen(true);
      setMobileOpen(false);
    }
  }, [isMobile]);

  const handleTabChange = (ev, newIndex, path) => {
    // If the index equals current tabs length, user intends to open a new tab (we provide handleAddTab instead)
    setTabIndex(newIndex);
    if (typeof path === "string") navigate(path);
  };

  const handleAddTab = (label = "New Tab", path = `/new-tab-${Date.now()}`) => {
    // add tab and navigate straight away
    setTabs((prev) => {
      const newTabs = [...prev, { label, path }];
      setTabIndex(newTabs.length - 1);
      // Navigate after updating state
      navigate(path);
      return newTabs;
    });
  };

  const handleTabClose = (tabId) => {
    const closingIndex = tabs.findIndex((t) => t.path === tabId);
    const newTabs = tabs.filter((t) => t.path !== tabId);
    setTabs(newTabs);

    if (location.pathname === tabId) {
      const fallbackIndex = closingIndex === 0 ? 0 : closingIndex - 1;
      const fallbackTab = newTabs[fallbackIndex] || { path: "/dashboard" };
      navigate(fallbackTab.path);
    } else {
      // If we closed a tab to the left of current tabIndex, shift selected index down by 1
      if (closingIndex >= 0 && closingIndex < tabIndex) {
        setTabIndex((i) => Math.max(0, i - 1));
      }
    }
  };

  const handleTabReorder = (newTabsArray) => {
    // newTabsArray is expected to be an array of tab objects in the new order
    // keep current path active but adjust tabIndex to its new position
    if (!Array.isArray(newTabsArray)) return;
    setTabs(newTabsArray);
    const currentPath = location.pathname;
    const newIndex = newTabsArray.findIndex((t) => t.path === currentPath);
    if (newIndex >= 0) setTabIndex(newIndex);
    else setTabIndex(0);
  };

  const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);
  const handleMobileSidebarToggle = () => setMobileOpen((prev) => !prev);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {
      text: "Incidents",
      icon: <ReportProblemIcon />,
      children: [
        { text: "View Incidents", path: "/incidents" },
        { text: "Raise Incident", path: "/new-incident" },
      ],
    },
    {
      text: "Service Requests",
      icon: <AssignmentIcon />,
      children: [
        { text: "View Requests", path: "/service-requests" },
        { text: "Raise Request", path: "/new-service-request" },
      ],
    },
    {
      text: "Changes",
      icon: <AutoFixHighIcon />,
      children: [
        { text: "View Changes", path: "/changes" },
        { text: "Raise Change", path: "/new-change" },
      ],
    },
    {
      text: "Problems",
      icon: <BugReportIcon />,
      children: [
        { text: "View Problems", path: "/problems" },
        { text: "Raise Problem", path: "/new-problem" },
      ],
    },
    { text: "Assets", icon: <DevicesOtherIcon />, path: "/assets" },
    { text: "Knowledge Base", icon: <MenuBookIcon />, path: "/knowledge-base" },
    { text: "Reports", icon: <BarChartIcon />, path: "/reports" },
    { text: "Approvals", icon: <HowToVoteIcon />, path: "/approvals" },
    { text: "Profile", icon: <PersonIcon />, path: "/profile" },
    ...(role === "admin"
      ? [{ text: "Admin Settings", icon: <SettingsIcon />, path: "/admin-settings" }]
      : [{ text: "Settings", icon: <SettingsIcon />, path: "/settings" }]),
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        mobileOpen={mobileOpen}
        handleSidebarToggle={handleSidebarToggle}
        handleMobileSidebarToggle={handleMobileSidebarToggle}
        sidebarWidth={sidebarWidth}
        collapsedWidth={collapsedWidth}
        menuItems={menuItems}
        isMobile={isMobile}
        navbarOffset={navbarOffset}
      />

      {/* Main column */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          marginLeft: !isMobile ? `${sidebarWidth}px` : 0,
          height: "100vh",
          position: "relative",
        }}
      >
        {/* Navbar + Tabs */}
        <NavbarTabs
          tabs={tabs}
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          handleAddTab={handleAddTab}
          handleTabClose={handleTabClose}
          handleTabReorder={handleTabReorder}
          sidebarOpen={sidebarOpen}
          sidebarWidth={sidebarWidth}
          collapsedWidth={collapsedWidth}
          isMobile={isMobile}
          handleMobileSidebarToggle={handleMobileSidebarToggle}
          handleSidebarToggle={handleSidebarToggle}
          navbarOffset={navbarOffset}
        />

        {/* Main content area (under navbar; navbar offset is navbarOffset) */}
        <Box
          component="main"
          sx={{
            flex: 1,
            mt: `${NAVBAR_HEIGHT + NAVBAR_PADDING_TOP}px`,
            overflowY: "auto",
            overflowX: "hidden",
            px: 1,
          }}
        >
          <Outlet />
          <BreadcrumbsNav />
          <BackToTop />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
