// Sidebar.js
import React from "react";
import { Box, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import StorageIcon from "@mui/icons-material/Storage";
import SettingsIcon from "@mui/icons-material/Settings";

const Sidebar = ({ pinned, onToggle, items, onItemClick, widthExpanded, widthCollapsed }) => {
  const width = pinned ? widthExpanded : widthCollapsed;

  return (
    <Box
      sx={{
        width,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(0,0,0,0.12)",
        transition: "width 0.3s ease",
        backgroundColor: "#fff",
      }}
    >      {/* Logo toggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: pinned ? "space-between" : "center",
          height: "48px", // match navbar height
          px: 1,
          backgroundColor: "#f8f9fa", // match Navbar background
          borderBottom: "4px solid #ffffff", // same white underline as Navbar
          borderRight: "none",               // completely remove right outlin
        }}
      >
        <IconButton onClick={onToggle}>
          <img
            src="https://www.bing.com/sa/simg/favicon-2x.ico"
            alt="Logo"
            style={{ width: 28, height: 28 }}
          />
        </IconButton>
        {pinned && <span style={{ fontWeight: "bold" }}>MyApp</span>}
      </Box>

      {/* Menu */}
      <List dense sx={{ flex: 1 }}>
        {items.map(({ label, icon }) => (
          <ListItem
            button
            key={label}
            onClick={() => onItemClick(label)}
            sx={{
              px: pinned ? 2 : 1,
              justifyContent: pinned ? "flex-start" : "center",
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: pinned ? 2 : "auto", justifyContent: "center" }}>
              {icon}
            </ListItemIcon>
            {pinned && <ListItemText primary={label} />}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
