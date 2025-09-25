// NavbarTabs.js
import React from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import Logo from "../../assets/logo.png"; // adjust your logo path

const NavbarTabs = ({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  handleTabReorder = () => {},
  sidebarOpen = true,
  sidebarWidth = 240,
  collapsedWidth = 60,
  isMobile = false,
}) => {
  if (!tabs || tabs.length === 0) return null;

  const chromeTabs = tabs.map((tab, index) => ({
    id: tab.path || `tab-${index}`,
    title: tab.label || "Untitled",
    favicon: tab.favicon || undefined,
    active: index === tabIndex,
  }));

  const onTabActive = (tabId) => {
    const index = chromeTabs.findIndex((t) => t.id === tabId);
    if (index >= 0) handleTabChange(null, index);
  };

  const onTabClose = (tabId) => handleTabClose(tabId);

  // Adjust width for sidebar
  const leftOffset = isMobile ? 0 : sidebarOpen ? sidebarWidth : collapsedWidth;
  const widthCalc = isMobile ? "100%" : `calc(100% - ${leftOffset}px)`;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: leftOffset,
        width: widthCalc,
        zIndex: 1500,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        height: 48,
        background: "#fff",
        borderBottom: "1px solid #ccc",
        justifyContent: "space-between",
      }}
    >
      {/* Left: Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src={Logo} alt="Logo" style={{ height: 32 }} />
      </div>

      {/* Middle: Chrome-style tabs */}
      <div style={{ flex: 1, margin: "0 16px" }}>
        <Tabs
          tabs={chromeTabs}
          draggable
          onTabActive={onTabActive}
          onTabClose={onTabClose}
          onTabReorder={handleTabReorder}
        />
      </div>

      {/* Right: Icons */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <SearchIcon style={{ cursor: "pointer" }} />
        <NotificationsIcon style={{ cursor: "pointer" }} />
        <AccountCircleIcon style={{ cursor: "pointer" }} />
      </div>
    </div>
  );
};

export default NavbarTabs;
