// Layout.js
import React, { useState, useEffect } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

import Header from "./Header";
import AppsBar from "./AppsBar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import MainContent from "./MainContent";
import BreadcrumbsNav from "./BreadcrumbsNav";
import BackToTop from "./BackToTop";
import AIChat from "./AIChat";

// Icons
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

const drawerWidth = 220;   // slightly smaller sidebar
const collapsedWidth = 60; 
const HEADER_HEIGHT = 44;  // compact header
const APPSBAR_HEIGHT = 32; // compact tabs
const FOOTER_HEIGHT = 28;  
const TOP_OFFSET = HEADER_HEIGHT + APPSBAR_HEIGHT;

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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "user";

  const sidebarWidth = sidebarOpen ? drawerWidth : collapsedWidth;

  // Update tabs on route change
  useEffect(() => {
    const currentPath = location.pathname;
    const tabExists = tabs.some((t) => t.path === currentPath);

    if (!tabExists) {
      const fetchLabel = async () => {
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
      };
      fetchLabel();
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

  // Sidebar responsive
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setMobileOpen(false);
    } else {
      setSidebarOpen(true);
      setMobileOpen(false);
    }
  }, [isMobile]);

  const handleTabChange = (_ev, newIndex) => {
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
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Fixed Top Header + Tabs */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <Header
          tabs={tabs}
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          handleTabClose={handleTabClose}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          sidebarWidth={sidebarWidth}
          collapsedWidth={collapsedWidth}
        />
        <AppsBar
          tabs={tabs}
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          handleTabClose={handleTabClose}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          sidebarWidth={sidebarWidth}
          collapsedWidth={collapsedWidth}
        />
      </Box>

      <Box sx={{ display: "flex", flex: 1, mt: `${TOP_OFFSET}px`, overflow: "hidden" }}>
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          mobileOpen={mobileOpen}
          handleSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          handleMobileSidebarToggle={() => setMobileOpen((prev) => !prev)}
          sidebarWidth={sidebarWidth}
          collapsedWidth={collapsedWidth}
          menuItems={menuItems}
          isMobile={isMobile}
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            height: `calc(100vh - ${FOOTER_HEIGHT}px - ${TOP_OFFSET}px)`,
            overflowY: "auto",
            overflowX: "hidden",
            px: 2,
            py: 1,
          }}
        >
          <MainContent />
          <BreadcrumbsNav />
          <BackToTop />
        </Box>
      </Box>

      {/* Footer fixed */}
      <Footer sx={{ height: `${FOOTER_HEIGHT}px`, flexShrink: 0 }} />

      {/* Optional floating chat */}
      <AIChat />
    </Box>
  );
};

export default Layout;
