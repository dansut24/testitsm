// Sidebar.js
import React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BuildIcon from "@mui/icons-material/Build";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import PeopleIcon from "@mui/icons-material/People";
import ReportIcon from "@mui/icons-material/Assessment";

const Sidebar = ({ sidebarPinned, activateOrAddTab, onLogoClick }) => {
  const menuItems = [
    { label: "Dashboard", icon: <DashboardIcon /> },
    { label: "Incidents", icon: <AssignmentIcon /> },
    { label: "Service Requests", icon: <BuildIcon /> },
    { label: "Changes", icon: <BuildIcon /> },
    { label: "Problems", icon: <BuildIcon /> },
    { label: "Assets", icon: <BuildIcon /> },
    { label: "Knowledge Base", icon: <HelpIcon /> },
    { label: "Reports", icon: <ReportIcon /> },
    { label: "Approvals", icon: <PeopleIcon /> },
    { label: "Profile", icon: <PeopleIcon /> },
    { label: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <div
      className={`sidebar ${sidebarPinned ? "expanded" : "collapsed"}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        height: "100vh",
        background: "#fff",
        borderRight: "1px solid rgba(0,0,0,0.12)",
        width: sidebarPinned ? 260 : 48,
        transition: "width 0.3s ease",
        overflowX: "hidden",
        zIndex: 1300,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sidebar Header with Logo */}
      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarPinned ? "flex-start" : "center",
          padding: sidebarPinned ? "0 12px" : 0,
          borderBottom: "1px solid rgba(0,0,0,0.12)",
          cursor: "pointer",
        }}
        onClick={onLogoClick}
      >
        <img
          src="https://www.bing.com/sa/simg/favicon-2x.ico"
          alt="Logo"
          style={{ width: 28, height: 28 }}
        />
        {sidebarPinned && <span style={{ marginLeft: 8, fontWeight: "bold" }}>MyApp</span>}
      </div>

      {/* Menu Items */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {menuItems.map((item) => (
          <div
            key={item.label}
            className="nav-item"
            style={{
              display: "flex",
              alignItems: "center",
              padding: sidebarPinned ? "10px 16px" : "10px 12px",
              whiteSpace: "nowrap",
              cursor: "pointer",
              fontSize: 14,
            }}
            onClick={() => activateOrAddTab(item.label)}
          >
            {item.icon}
            {sidebarPinned && <span style={{ marginLeft: 12 }}>{item.label}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
