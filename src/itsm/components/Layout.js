// Layout.js
import React, { useState, useEffect } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

import Header from "./Header"; // unified header
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import BreadcrumbsNav from "./BreadcrumbsNav";
import BackToTop from "./BackToTop";
import AIChat from "./AIChat";

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

  const [sidebarOpen, setSidebarOpen] = useState(true); // desktop
  const [mobileOpen, setMobileOpen] = useState(false); // mobile
  const [tabs, setTabs] = useState(() => {
    const stored = sessionStorage.getItem("tabs");
    return stored
      ? JSON.parse(stored)
      : [{ label: "Dashboard", path: "/dashboard" }];
  });
  const [tabIndex, setTabIndex] = useState(() => {
    const storedIndex = sessionStorage.getItem("tabIndex");
    return storedIndex ? parseInt(storedIndex, 10) : 0;
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";

  const sidebarWidth = sidebarOpen ? drawerWidth : collapsedWidth;

  // Update tabs on route change
  useEffect(() => {
    const currentPath = location.pathname;
    const tabExists = tabs.some((tab) => tab.path === currentPath);

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
      const index = tabs.findIndex((tab) => tab.path === currentPath);
      setTabIndex(index);
    }
  }, [location.pathname]);

  // Persist tabs
  useEffect(() => {
    sessionStorage.setItem("tabs", JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    sessionStorage.setItem("tabIndex", tabIndex.toString());
  }, [tabIndex]);

  // Responsive sidebar
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setMobileOpen(false);
    } else {
      setSidebarOpen(true);
      setMobileOpen(false);
    }
  }, [isMobile]);

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
      ? [
          {
            text: "Admin Settings",
            icon: <SettingsIcon />,
            path: "/admin-settings",
          },
        ]
      : [{ text: "Settings", icon: <SettingsIcon />, path: "/settings" }]),
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      {/* Sidebar + Main content container */}
      <Box sx={{ display: "flex", flex: 1 }}>
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

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Header
            tabs={tabs}
            tabIndex={tabIndex}
            handleTabChange={handleTabChange}
            handleTabClose={handleTabClose}
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
            sidebarWidth={sidebarWidth}
            collapsedWidth={collapsedWidth}
            handleSidebarToggle={handleSidebarToggle}
            handleMobileSidebarToggle={handleMobileSidebarToggle}
          />

          <MainContent />
          <AIChat />
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
