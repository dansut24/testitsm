// src/itsm/pages/NewTab.js
import React from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import StorageIcon from "@mui/icons-material/Storage";
import SettingsIcon from "@mui/icons-material/Settings";
import ArticleIcon from "@mui/icons-material/Article";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useNavigate, useParams } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Incidents", path: "/incidents", icon: <ListAltIcon /> },
  { label: "Assets", path: "/assets", icon: <StorageIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

const suggestedShortcuts = [
  { label: "Knowledge Base", path: "/knowledge-base", icon: <ArticleIcon /> },
  { label: "Reports", path: "/reports", icon: <BarChartIcon /> },
];

const recentTabs = [
  { label: "Incident #1024", path: "/incidents/1024" },
  { label: "Asset – Laptop 15” Dell", path: "/assets/42" },
  { label: "Report: Monthly SLA", path: "/reports" },
];

export default function NewTab() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
        gap: 4,
        backgroundColor: (theme) => theme.palette.background.default,
        height: "100%",
      }}
    >
      {/* Header */}
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome to New Tab {id}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Use the quick links below to navigate to key areas of the system.
        </Typography>
      </Box>

      {/* Quick Links Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {navItems.map((item) => (
          <Paper
            key={item.path}
            onClick={() => navigate(item.path)}
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? theme.palette.grey[800]
                    : theme.palette.grey[50],
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, color: "primary.main" }}>
              {item.icon}
            </ListItemIcon>
            <Box>
              <Typography variant="subtitle1" fontWeight="600">
                {item.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Go to {item.label.toLowerCase()} page
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Recent Tabs */}
      <Box>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Recent Tabs
        </Typography>
        <List dense>
          {recentTabs.map((tab) => (
            <ListItem key={tab.path} disablePadding>
              <ListItemButton onClick={() => navigate(tab.path)}>
                <ListItemText
                  primary={tab.label}
                  primaryTypographyProps={{ fontSize: "0.95rem" }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Suggested Shortcuts */}
      <Box>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Suggested Shortcuts
        </Typography>
        <List dense>
          {suggestedShortcuts.map((shortcut) => (
            <ListItem key={shortcut.path} disablePadding>
              <ListItemButton onClick={() => navigate(shortcut.path)}>
                <ListItemIcon sx={{ color: "primary.main" }}>
                  {shortcut.icon}
                </ListItemIcon>
                <ListItemText
                  primary={shortcut.label}
                  primaryTypographyProps={{ fontSize: "0.95rem" }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}
