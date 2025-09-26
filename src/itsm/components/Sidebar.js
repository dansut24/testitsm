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

const Sidebar = ({ sidebarOpen, sidebarPinned, activateOrAddTab, favicons }) => {
  const menuItems = [
    { label: "Dashboard", icon: <DashboardIcon />, favicon: favicons[0] },
    { label: "Incidents", icon: <BugReportIcon />, favicon: favicons[1] },
    { label: "Service Requests", icon: <AssignmentIcon />, favicon: favicons[2] },
    { label: "Changes", icon: <ChangeCircleIcon />, favicon: favicons[3] },
    { label: "Problems", icon: <ReportProblemIcon />, favicon: favicons[0] },
    { label: "Assets", icon: <DevicesIcon />, favicon: favicons[1] },
    { label: "Knowledge Base", icon: <MenuBookIcon />, favicon: favicons[2] },
    { label: "Reports", icon: <BarChartIcon />, favicon: favicons[3] },
    { label: "Approvals", icon: <CheckCircleIcon />, favicon: favicons[0] },
    { label: "Profile", icon: <PersonIcon />, favicon: favicons[1] },
    { label: "Settings", icon: <SettingsIcon />, favicon: favicons[2] },
    { label: "Help", icon: <HelpOutlineIcon />, favicon: favicons[3] },
  ];

  return (
    <div
      className={`sidebar${sidebarOpen || sidebarPinned ? " open" : ""}${
        sidebarPinned ? " pinned" : ""
      }`}
    >
      <div className="sidebar-content">
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            className="nav-item"
            onClick={() => activateOrAddTab(item.label, item.favicon)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .sidebar {
          position: fixed;
          top: 48px; /* match navbar height */
          left: 0;
          bottom: 0;
          width: 220px;
          background: #ffffff;
          border-right: 1px solid rgba(0, 0, 0, 0.12);
          transform: translateX(-100%);
          transition: transform 0.3s ease, width 0.3s ease;
          z-index: 2000;
          overflow: hidden;
        }
        .sidebar.open {
          transform: translateX(0);
        }
        .sidebar.pinned {
          transform: translateX(0);
          width: 60px;
        }
        .sidebar.pinned:hover {
          width: 220px;
        }
        .sidebar-content {
          display: flex;
          flex-direction: column;
          padding-top: 8px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
          transition: background 0.2s, color 0.2s;
        }
        .nav-item:hover {
          background: #f4f6f8;
          color: #1976d2;
        }
        .nav-icon {
          margin-right: 12px;
          display: flex;
          align-items: center;
          font-size: 20px;
        }
        .sidebar.pinned .nav-label {
          display: none;
        }
        .sidebar.pinned:hover .nav-label {
          display: inline;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
