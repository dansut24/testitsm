// src/itsm/pages/NewTab.js
import React from "react";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import StorageIcon from "@mui/icons-material/Storage";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate, useParams } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Incidents", path: "/incidents", icon: <ListAltIcon /> },
  { label: "Assets", path: "/assets", icon: <StorageIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

export default function NewTab() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        New Tab {id}
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Choose a page to navigate to:
      </Typography>

      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
