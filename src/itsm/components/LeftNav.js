// LeftNav.js
import React from "react";
import { Box, IconButton, Tooltip, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import HelpIcon from "@mui/icons-material/Help";

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 48;

const menuItems = [
  { label: "Dashboard", icon: <DashboardIcon /> },
  { label: "Profile", icon: <PersonIcon /> },
  { label: "Settings", icon: <SettingsIcon /> },
  { label: "Help", icon: <HelpIcon /> },
];

export default function LeftNav({ pinned, setPinned, activateOrAddTab }) {
  const width = pinned ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <Box
      sx={{
        width,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        transition: "width 0.3s ease",
      }}
    >
      {/* Logo button */}
      <Box
        sx={{
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          cursor: "pointer",
        }}
        onClick={() => setPinned(!pinned)}
      >
        <img
          src="https://www.bing.com/sa/simg/favicon-2x.ico"
          alt="Logo"
          style={{ width: 28, height: 28 }}
        />
      </Box>

      {/* Sidebar menu */}
      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.label}
            onClick={() => activateOrAddTab(item.label)}
            sx={{ px: pinned ? 2 : 1 }}
          >
            <Tooltip title={!pinned ? item.label : ""} placement="right">
              <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
            </Tooltip>
            {pinned && <ListItemText primary={item.label} />}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
