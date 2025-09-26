// Sidebar.js
import React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BuildIcon from "@mui/icons-material/Build";
import StorageIcon from "@mui/icons-material/Storage";
import BookIcon from "@mui/icons-material/Book";
import BarChartIcon from "@mui/icons-material/BarChart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import HelpIcon from "@mui/icons-material/Help";

const Sidebar = ({ sidebarOpen, sidebarPinned, activateOrAddTab }) => {
  const items = [
    { label: "Dashboard", icon: <DashboardIcon />, faviconIndex: 0 },
    { label: "Incidents", icon: <AssignmentIcon />, faviconIndex: 1 },
    { label: "Service Requests", icon: <AssignmentIcon />, faviconIndex: 2 },
    { label: "Changes", icon: <BuildIcon />, faviconIndex: 3 },
    { label: "Problems", icon: <BuildIcon />, faviconIndex: 0 },
    { label: "Assets", icon: <StorageIcon />, faviconIndex: 1 },
    { label: "Knowledge Base", icon: <BookIcon />, faviconIndex: 2 },
    { label: "Reports", icon: <BarChartIcon />, faviconIndex: 3 },
    { label: "Approvals", icon: <CheckCircleIcon />, faviconIndex: 0 },
    { label: "Profile", icon: <PersonIcon />, faviconIndex: 1 },
    { label: "Settings", icon: <SettingsIcon />, faviconIndex: 2 },
    { label: "Help", icon: <HelpIcon />, faviconIndex: 3 },
  ];

  return (
    <div
      className={`sidebar ${sidebarOpen || sidebarPinned ? "open" : ""} ${
        sidebarPinned ? "pinned" : ""
      }`}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="nav-item"
          onClick={() => activateOrAddTab(item.label, item.faviconIndex)}
        >
          <div className="icon">{item.icon}</div>
          <span className="label">{item.label}</span>
        </div>
      ))}

      <style jsx>{`
        .sidebar {
          position: fixed;
          top: 48px; /* sits under navbar */
          left: 0;
          bottom: 0;
          background: #fff;
          border-right: 1px solid rgba(0, 0, 0, 0.12);
          width: ${sidebarOpen ? "260px" : "48px"};
          transition: width 0.3s ease;
          overflow-x: hidden;
          overflow-y: auto;
          z-index: 1000;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 12px;
          cursor: pointer;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .nav-item:hover {
          background: #f5f5f5;
        }

        .icon {
          min-width: 24px;
          margin-right: ${sidebarOpen ? "12px" : "0"};
          display: flex;
          justify-content: center;
        }

        .label {
          font-size: ${sidebarOpen ? "14px" : "10px"};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: opacity 0.2s ease, font-size 0.2s ease;
          opacity: ${sidebarOpen ? "1" : "0.8"};
        }

        .sidebar:not(.open) .label {
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
