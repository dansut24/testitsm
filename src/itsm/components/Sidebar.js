// Sidebar.js
import React from "react";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
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
import { useNavigate, useLocation } from "react-router-dom";

const defaultMenu = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Incidents", icon: <ReportProblemIcon />, path: "/incidents" },
  { text: "Service Requests", icon: <AssignmentIcon />, path: "/service-requests" },
  { text: "Changes", icon: <AutoFixHighIcon />, path: "/changes" },
  { text: "Problems", icon: <BugReportIcon />, path: "/problems" },
  { text: "Assets", icon: <DevicesOtherIcon />, path: "/assets" },
  { text: "Knowledge Base", icon: <MenuBookIcon />, path: "/knowledge-base" },
  { text: "Reports", icon: <BarChartIcon />, path: "/reports" },
  { text: "Approvals", icon: <HowToVoteIcon />, path: "/approvals" },
  { text: "Profile", icon: <PersonIcon />, path: "/profile" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const Sidebar = ({
  sidebarOpen = true,
  mobileOpen = false,
  handleSidebarToggle = () => {},
  handleMobileSidebarToggle = () => {},
  sidebarWidth = 256,
  collapsedWidth = 48,
  menuItems = defaultMenu,
  isMobile = false,
  navbarOffset = 40, // top offset for mobile overlay so it renders under the navbar
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const items = Array.isArray(menuItems) ? menuItems : defaultMenu;

  // Desktop (fixed) sidebar
  const desktopSidebar = (
    <Box
      sx={{
        width: sidebarOpen ? sidebarWidth : collapsedWidth,
        height: "100vh",
        bgcolor: "background.paper",
        color: "text.primary",
        borderRight: 1,
        borderColor: "divider",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        transition: "width 220ms ease",
        zIndex: 1300, // below navbar which has higher zIndex
        boxShadow: sidebarOpen ? "none" : "none",
      }}
    >
      {/* Toggle */}
      <Box sx={{ px: 1.25, py: 0.5, display: "flex", justifyContent: sidebarOpen ? "flex-end" : "center" }}>
        <IconButton onClick={handleSidebarToggle} size="small" aria-label="Toggle sidebar">
          {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      {/* Menu */}
      <Box sx={{ overflowY: "auto", flex: 1, pb: 2 }}>
        <List>
          {items.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <ListItem
                key={item.text}
                button
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                }}
                sx={{
                  px: sidebarOpen ? 2 : 1,
                  py: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, justifyContent: "center" }}>{item.icon}</ListItemIcon>
                {sidebarOpen && <ListItemText primary={item.text} />}
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* Bottom small icons */}
      <Box sx={{ px: 1.25, py: 1, display: "flex", gap: 1, justifyContent: sidebarOpen ? "flex-end" : "center" }}>
        <IconButton size="small" aria-label="search"><SearchIcon /></IconButton>
        <IconButton size="small" aria-label="notifications"><NotificationsIcon /></IconButton>
        <IconButton size="small" aria-label="profile"><AccountCircleIcon /></IconButton>
      </Box>
    </Box>
  );

  // Mobile: slide-in overlay placed *under* the navbar (top offset)
  const mobileOverlay = (
    <>
      {/* dim backdrop */}
      <Box
        onClick={handleMobileSidebarToggle}
        sx={{
          position: "fixed",
          top: `${navbarOffset}px`,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: mobileOpen ? "rgba(0,0,0,0.36)" : "transparent",
          opacity: mobileOpen ? 1 : 0,
          transition: "opacity 220ms ease",
          zIndex: 1400,
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
      />

      {/* sliding panel */}
      <Box
        sx={{
          position: "fixed",
          top: `${navbarOffset}px`,
          left: 0,
          height: `calc(100vh - ${navbarOffset}px)`,
          width: sidebarWidth,
          transform: mobileOpen ? "translateX(0%)" : "translateX(-100%)",
          transition: "transform 300ms cubic-bezier(.2,.9,.2,1), box-shadow 300ms linear",
          zIndex: 1450,
          bgcolor: "background.paper",
          boxShadow: "0 8px 30px rgba(2,6,23,0.14)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1 }}>
          <IconButton onClick={handleMobileSidebarToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <Box sx={{ overflowY: "auto", flex: 1 }}>
          <List>
            {items.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  handleMobileSidebarToggle();
                }}
                selected={location.pathname === item.path}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider />
        <Box sx={{ display: "flex", justifyContent: "space-around", py: 2 }}>
          <IconButton aria-label="search"><SearchIcon /></IconButton>
          <IconButton aria-label="notifications"><NotificationsIcon /></IconButton>
          <IconButton aria-label="profile"><AccountCircleIcon /></IconButton>
        </Box>
      </Box>
    </>
  );

  return isMobile ? mobileOverlay : desktopSidebar;
};

export default Sidebar;
