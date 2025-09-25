// Sidebar.js
import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Sidebar = ({
  sidebarOpen,
  mobileOpen,
  handleSidebarToggle,
  handleMobileSidebarToggle,
  sidebarWidth,
  collapsedWidth,
  isMobile,
}) => {
  const drawerWidth = sidebarOpen ? sidebarWidth : collapsedWidth;

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Incidents", icon: <AssignmentIcon />, path: "/incidents" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  const drawerContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            {sidebarOpen && <ListItemText primary={item.text} />}
          </ListItem>
        ))}
      </List>

      {/* Mobile bottom icons */}
      {isMobile && (
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-around",
            padding: "12px 0",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <SearchIcon style={{ cursor: "pointer" }} />
          <NotificationsIcon style={{ cursor: "pointer" }} />
          <AccountCircleIcon style={{ cursor: "pointer" }} />
        </div>
      )}
    </div>
  );

  return isMobile ? (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleMobileSidebarToggle}
      ModalProps={{ keepMounted: true }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
