import React, { useState, useEffect } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import AppsBar from "./AppsBar";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import BreadcrumbsNav from "./BreadcrumbsNav";
import BackToTop from "./BackToTop";
import AIChat from "./AIChat";

import DashboardIcon from '@mui/icons-material/Dashboard';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BugReportIcon from '@mui/icons-material/BugReport';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 240;
const collapsedWidth = 60;

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
  "/new-incident": "New Incident",
};

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [tabs, setTabs] = useState(() => {
    const stored = sessionStorage.getItem("tabs");
    return stored ? JSON.parse(stored) : [{ label: "Dashboard", path: "/dashboard" }];
  });
  const [tabIndex, setTabIndex] = useState(() => {
    const storedIndex = sessionStorage.getItem("tabIndex");
    return storedIndex ? parseInt(storedIndex, 10) : 0;
  });

  const sidebarWidth = sidebarOpen ? drawerWidth : collapsedWidth;

  useEffect(() => {
    const currentPath = location.pathname;
    const tabExists = tabs.some((tab) => tab.path === currentPath);

    if (!tabExists) {
      const label = routeLabels[currentPath] || "Unknown";
      const newTabs = [...tabs, { label, path: currentPath }];
      setTabs(newTabs);
      setTabIndex(newTabs.length - 1);
    } else {
      const index = tabs.findIndex((tab) => tab.path === currentPath);
      setTabIndex(index);
    }
  }, [location.pathname]);

  useEffect(() => {
    sessionStorage.setItem("tabs", JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    sessionStorage.setItem("tabIndex", tabIndex.toString());
  }, [tabIndex]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setMobileOpen(false);
    } else {
      setSidebarOpen(true);
      setMobileOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const handleScroll = () => {
      setShowNavbar(window.pageYOffset < 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
    navigate(tabs[newIndex].path);
  };

  const handleTabClose = (pathToClose) => {
    const closingIndex = tabs.findIndex((tab) => tab.path === pathToClose);
    const newTabs = tabs.filter((tab) => tab.path !== pathToClose);
    setTabs(newTabs);

    if (location.pathname === pathToClose) {
      const fallbackIndex = closingIndex === 0 ? 0 : closingIndex - 1;
      const fallbackTab = newTabs[fallbackIndex] || { path: "/dashboard" };
      navigate(fallbackTab.path);
    }
  };

  const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);
  const handleMobileSidebarToggle = () => setMobileOpen((prev) => !prev);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon /> },
    { text: "Incidents", icon: <ReportProblemIcon /> },
    { text: "Service Requests", icon: <AssignmentIcon /> },
    { text: "Changes", icon: <AutoFixHighIcon /> },
    { text: "Problems", icon: <BugReportIcon /> },
    { text: "Assets", icon: <DevicesOtherIcon /> },
    { text: "Knowledge Base", icon: <MenuBookIcon /> },
    { text: "Reports", icon: <BarChartIcon /> },
    { text: "Approvals", icon: <HowToVoteIcon /> },
    { text: "Profile", icon: <PersonIcon /> },
    { text: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        mobileOpen={mobileOpen}
        handleSidebarToggle={handleSidebarToggle}
        handleMobileSidebarToggle={handleMobileSidebarToggle}
        sidebarWidth={sidebarWidth}
        collapsedWidth={collapsedWidth}
        tabIndex={tabIndex}
        menuItems={menuItems}
        handleSidebarTabClick={(index) => {
          const path = Object.keys(routeLabels)[index];
          navigate(path);
        }}
        isMobile={isMobile}
      />

      <Box
        sx={{
          marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Fixed Navbar */}
        <Navbar
          sidebarWidth={sidebarWidth}
          showNavbar={showNavbar}
          isMobile={isMobile}
          handleMobileSidebarToggle={handleMobileSidebarToggle}
          sidebarOpen={sidebarOpen}
          collapsedWidth={collapsedWidth}
          handleSidebarToggle={handleSidebarToggle}
        />

        {/* Fixed Tabs bar */}
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

<Box
  sx={{
    flexGrow: 1,
    minHeight: 0,
    overflowY: "auto",
    px: 2,
    pb: 2,
    position: "relative",
    zIndex: 0, // keep content below navbar/appsbar
  }}
>
  {/* 👇 overlay dummy element to force scrollbar to start from the top */}
  <Box
    sx={{
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      width: "17px", // native scrollbar width
      zIndex: (theme) => theme.zIndex.drawer + 10,
      pointerEvents: "none",
    }}
  />
  <MainContent />
  <BreadcrumbsNav />
  <BackToTop />
</Box>

        <AIChat />
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
