// Sidebar.js
import React from "react";
import { Box, Divider } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BugReportIcon from "@mui/icons-material/BugReport";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import DevicesIcon from "@mui/icons-material/Devices";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BarChartIcon from "@mui/icons-material/BarChart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const DEFAULT_FAVICONS = [
  "https://www.google.com/favicon.ico",
  "https://static.xx.fbcdn.net/rsrc.php/yo/r/iRmz9lCMBD2.ico",
  "https://www.bing.com/sa/simg/favicon-2x.ico",
  "https://github.githubassets.com/favicons/favicon.png",
];

export default function Sidebar({
  open = false,
  pinned = false,
  topOffset = 34, // match your NAVBAR_HEIGHT in Layout
  activateOrAddTab,
  favicons = DEFAULT_FAVICONS,
}) {
  const width = pinned ? 48 : 260;

  const items = [
    { label: "Dashboard", icon: <DashboardIcon fontSize="small" />, favicon: favicons[0] },
    { label: "Incidents", icon: <BugReportIcon fontSize="small" />, favicon: favicons[1] },
    { label: "Service Requests", icon: <AssignmentIcon fontSize="small" />, favicon: favicons[2] },
    { label: "Changes", icon: <ChangeCircleIcon fontSize="small" />, favicon: favicons[3] },
    { label: "Problems", icon: <ReportProblemIcon fontSize="small" />, favicon: favicons[0] },
    { label: "Assets", icon: <DevicesIcon fontSize="small" />, favicon: favicons[1] },
    { label: "Knowledge Base", icon: <MenuBookIcon fontSize="small" />, favicon: favicons[2] },
    { label: "Reports", icon: <BarChartIcon fontSize="small" />, favicon: favicons[3] },
    { label: "Approvals", icon: <CheckCircleIcon fontSize="small" />, favicon: favicons[0] },
    { label: "Profile", icon: <PersonIcon fontSize="small" />, favicon: favicons[1] },
    { label: "Settings", icon: <SettingsIcon fontSize="small" />, favicon: favicons[2] },
    { label: "Help", icon: <HelpOutlineIcon fontSize="small" />, favicon: favicons[3] },
  ];

  return (
    <>
      {/* Sidebar panel */}
      <Box
        className="app-sidebar"
        sx={{
          position: "fixed",
          top: topOffset,
          left: 0,
          bottom: 0,
          width,
          bgcolor: "#fff",
          borderRight: 1,
          borderColor: "divider",
          zIndex: 2000,
          overflow: "hidden",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease, width 0.2s ease",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", py: 1 }}>
          {items.map((it) => (
            <Box
              key={it.label}
              onClick={() => activateOrAddTab(it.label, it.favicon)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 2,
                py: 1.25,
                cursor: "pointer",
                color: "text.primary",
                "&:hover": { bgcolor: "action.hover", color: "primary.main" },
              }}
              title={it.label}
            >
              <Box sx={{ minWidth: 20, display: "flex", justifyContent: "center" }}>{it.icon}</Box>
              {!pinned && <Box component="span" sx={{ fontSize: 14, fontWeight: 500 }}>{it.label}</Box>}
            </Box>
          ))}
        </Box>
        <Divider />
      </Box>

      {/* Optional scrim on mobile when open (click to close) — handled by parent if you want */}
    </>
  );
}
