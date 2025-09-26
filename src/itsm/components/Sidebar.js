// Sidebar.js
import React from "react";
import { Box, Typography } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import ArticleIcon from "@mui/icons-material/Article";
import DevicesIcon from "@mui/icons-material/Devices";

const Sidebar = ({ pinned, activateOrAddTab }) => {
  const items = [
    { label: "Dashboard", icon: <DashboardIcon /> },
    { label: "Incidents", icon: <ArticleIcon /> },
    { label: "Assets", icon: <DevicesIcon /> },
    { label: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <Box
      sx={{
        width: pinned ? 260 : 48,
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        height: "100vh",
        transition: "width 0.3s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: pinned ? "flex-start" : "center",
        pt: 1,
      }}
    >
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            px: pinned ? 2 : 0,
            py: 1,
            cursor: "pointer",
            "&:hover": { bgcolor: "action.hover" },
          }}
          onClick={() => activateOrAddTab(item.label)}
        >
          {item.icon}
          {pinned && (
            <Typography sx={{ ml: 2, fontSize: 14 }}>{item.label}</Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default Sidebar;
