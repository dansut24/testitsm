// NavbarTabs.js
import React from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import logo from "../../assets/logo192.png"; // update path if needed

const NavbarTabs = ({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  sidebarOpen = true,
  sidebarWidth = 240,
  collapsedWidth = 60,
  isMobile = false,
}) => {
  if (!tabs || tabs.length === 0) return null;

  // Convert your tabs array into ChromeTabs format
  const chromeTabs = tabs.map((tab, index) => ({
    id: tab.path || `tab-${index}`,
    title: tab.label || "Untitled",
    favicon: tab.favicon || undefined,
    active: index === tabIndex,
    isCloseIconVisible: tab.path === "/dashboard" ? false : true,
  }));

  const onTabActive = (tabId) => {
    const index = chromeTabs.findIndex((t) => t.id === tabId);
    if (index >= 0) handleTabChange(null, index);
  };

  const onTabClose = (tabId) => {
    const tab = chromeTabs.find((t) => t.id === tabId);
    if (tab && tab.path === "/dashboard") return;
    handleTabClose(tabId);
  };

  const onTabReorder = (tabId, fromIndex, toIndex) => {
    // Optional: implement reorder logic if needed
  };

  // Sidebar offset
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
        height: 41.6, // match Navbar height
        background: "transparent",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #ccc",
        paddingLeft: 8,
        paddingRight: 8,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", marginRight: 12 }}>
        <img
          src={logo}
          alt="Logo"
          style={{ height: 28, objectFit: "contain" }}
        />
      </div>

      {/* Tabs flex container */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Tabs
          tabs={chromeTabs}
          onTabActive={onTabActive}
          onTabClose={onTabClose}
          onTabReorder={onTabReorder}
          draggable
          className="chrome-tabs"
          tabContentStyle={{ textAlign: "left" }}
        />
      </div>

      {/* Right-hand icons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingRight: 16,
        }}
      >
        <SearchIcon style={{ cursor: "pointer" }} />
        <NotificationsIcon style={{ cursor: "pointer" }} />
        <AccountCircleIcon style={{ cursor: "pointer" }} />
      </div>
    </div>
  );
};

export default NavbarTabs;
