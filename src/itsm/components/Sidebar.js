// Sidebar.js
import React from "react";
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

const Sidebar = ({ sidebarOpen, sidebarPinned, activateOrAddTab, favicons = [] }) => {
  const defaultFavicons = [
    "https://www.google.com/favicon.ico",
    "https://static.xx.fbcdn.net/rsrc.php/yo/r/iRmz9lCMBD2.ico",
    "https://www.bing.com/sa/simg/favicon-2x.ico",
    "https://github.githubassets.com/favicons/favicon.png",
  ];

  const icons = favicons.length ? favicons : defaultFavicons;

  const menuItems = [
    { label: "Dashboard", icon: <DashboardIcon fontSize="small" />, favicon: icons[0] },
    { label: "Incidents", icon: <BugReportIcon fontSize="small" />, favicon: icons[1] },
    { label: "Service Requests", icon: <AssignmentIcon fontSize="small" />, favicon: icons[2] },
    { label: "Changes", icon: <ChangeCircleIcon fontSize="small" />, favicon: icons[3] },
    { label: "Problems", icon: <ReportProblemIcon fontSize="small" />, favicon: icons[0] },
    { label: "Assets", icon: <DevicesIcon fontSize="small" />, favicon: icons[1] },
    { label: "Knowledge Base", icon: <MenuBookIcon fontSize="small" />, favicon: icons[2] },
    { label: "Reports", icon: <BarChartIcon fontSize="small" />, favicon: icons[3] },
    { label: "Approvals", icon: <CheckCircleIcon fontSize="small" />, favicon: icons[0] },
    { label: "Profile", icon: <PersonIcon fontSize="small" />, favicon: icons[1] },
    { label: "Settings", icon: <SettingsIcon fontSize="small" />, favicon: icons[2] },
    { label: "Help", icon: <HelpOutlineIcon fontSize="small" />, favicon: icons[3] },
  ];

  return (
    <div
      className={`sidebar${sidebarOpen || sidebarPinned ? " open" : ""}${
        sidebarPinned ? " pinned" : ""
      }`}
    >
      <div>
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            className="nav-item"
            onClick={() => activateOrAddTab(item.label, item.favicon)}
          >
            {item.icon} <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
