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

const drawerWidth = 240;
const collapsedWidth = 60;
const NAVBAR_HEIGHT = 41.6; // matches NavbarTabs height

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
  }, [tabs]);
  useEffect(() => {
    sessionStorage.setItem("tabIndex", tabIndex.toString());
  }, [tabIndex]);

  // Responsive sidebar initial state
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setMobileOpen(false);
    } else {
      setSidebarOpen(true);
      setMobileOpen(false);
    }
  }, [isMobile]);

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
        {/* Navbar with Chrome Tabs integrated */}
        <NavbarTabs
          tabs={tabs}
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          handleTabClose={handleTabClose}
          sidebarOpen={sidebarOpen}
          sidebarWidth={sidebarWidth}
          collapsedWidth={collapsedWidth}
          isMobile={isMobile}
        />

        {/* Main content area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            mt: `${NAVBAR_HEIGHT}px`,
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
