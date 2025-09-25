// NavbarTabs.js
import React from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

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

  // Convert tabs to ChromeTabs format
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
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(200, 200, 200, 0.15)", // semi-transparent grey for theme support
        borderRadius: 8,
        padding: "0 12px",
        backdropFilter: "blur(8px)", // subtle blur for floating effect
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      {/* Left: Logo */}
      <div style={{ display: "flex", alignItems: "center", marginRight: 12 }}>
        <img
          src="/logo192.png"
          alt="Logo"
          style={{
            height: 28,
            objectFit: "contain",
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.3)", // floating highlight
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Tabs
          tabs={chromeTabs}
          onTabActive={onTabActive}
          onTabClose={onTabClose}
          draggable
          className="chrome-tabs"
          tabContentStyle={{ textAlign: "left" }}
          style={{ width: "100%" }}
          tabRenderer={(tab, tabIndex) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                width: `${100 / chromeTabs.length}%`,
                overflow: "hidden",
                padding: "0 8px",
              }}
            >
              {tab.favicon && (
                <img
                  src={tab.favicon}
                  alt="favicon"
                  style={{ width: 16, height: 16, marginRight: 6 }}
                />
              )}
              <span
                style={{
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {tab.title}
              </span>
            </div>
          )}
        />
      </div>

      {/* Right-hand icons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingLeft: 12,
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
