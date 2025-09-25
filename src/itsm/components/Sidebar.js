// Sidebar.js
import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Box,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import ReportIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const menuItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { label: "Incidents", icon: <AssignmentIcon />, path: "/incidents" },
  { label: "Service Requests", icon: <AssignmentIcon />, path: "/service-requests" },
  { label: "Changes", icon: <ChangeCircleIcon />, path: "/changes" },
  { label: "Reports", icon: <ReportIcon />, path: "/reports" },
  { label: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const Sidebar = ({
  sidebarOpen,
  mobileOpen,
  handleSidebarToggle,
  handleMobileSidebarToggle,
  sidebarWidth,
  collapsedWidth,
  isMobile,
}) => {
  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: sidebarOpen ? sidebarWidth : collapsedWidth,
      }}
    >
      {/* Header / Close button for mobile */}
      {isMobile && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            px: 1,
            py: 1,
          }}
        >
          <IconButton onClick={handleMobileSidebarToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      )}

      {/* Menu items */}
      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.label}
            sx={{ px: sidebarOpen ? 2 : 1 }}
            onClick={() => (window.location.href = item.path)}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
            {sidebarOpen && <ListItemText primary={item.label} />}
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Footer icons (mobile only) */}
      {isMobile && (
        <Box sx={{ display: "flex", justifyContent: "space-around", py: 2 }}>
          <SearchIcon />
          <NotificationsIcon />
          <AccountCircleIcon />
        </Box>
      )}
    </Box>
  );

  return isMobile ? (
    <Drawer
      anchor="left"
      open={mobileOpen}
      onClose={handleMobileSidebarToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        "& .MuiDrawer-paper": {
          width: sidebarWidth,
          boxSizing: "border-box",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <Box
      sx={{
        width: sidebarOpen ? sidebarWidth : collapsedWidth,
        transition: "width 0.2s",
        borderRight: "1px solid rgba(0,0,0,0.12)",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        bgcolor: "background.paper",
        zIndex: 1200,
      }}
    >
      {drawerContent}
    </Box>
  );
};

export default Sidebar;
