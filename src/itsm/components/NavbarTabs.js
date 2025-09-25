// NavbarTabs.js
import React from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";

const NavbarTabs = ({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  handleAddTab = () => {},
  sidebarOpen = true,
  sidebarWidth = 256,
  collapsedWidth = 48,
  isMobile = false,
}) => {
  if (!tabs || tabs.length === 0) return null;

  const chromeTabs = tabs.map((tab, index) => ({
    id: tab.path || `tab-${index}`,
    title: tab.label || `Tab ${index + 1}`,
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

  const leftOffset = isMobile
    ? 0
    : sidebarOpen
    ? sidebarWidth + 48 // sidebar + logo padding
    : collapsedWidth + 48;

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
        backgroundColor: "rgba(200, 200, 200, 0.15)",
        borderRadius: 8,
        padding: "0 12px",
        backdropFilter: "blur(8px)",
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
            backgroundColor: "rgba(255,255,255,0.3)",
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
        <style>
          {`
            .chrome-tabs {
              background-color: transparent !important;
              border-bottom: none !important;
            }
            .chrome-tabs__tab-indicator {
              left: ${leftOffset}px !important;
              width: calc(100% - ${leftOffset}px) !important;
              transition: transform 0.3s ease, width 0.3s ease !important;
            }
            .chrome-tabs__tab {
              border-radius: 6px 6px 0 0;
            }
            .chrome-tabs__tab--active {
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            }
          `}
        </style>

        <Tabs
          tabs={chromeTabs}
          onTabActive={onTabActive}
          onTabClose={onTabClose}
          draggable
          className="chrome-tabs"
          tabContentStyle={{ textAlign: "left" }}
          style={{ width: "100%" }}
          tabRenderer={(tab) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "0 12px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {tab.favicon && (
                <img
                  src={tab.favicon}
                  alt="favicon"
                  style={{ width: 16, height: 16, marginRight: 6 }}
                />
              )}
              <span>{tab.title}</span>
            </div>
          )}
        />
      </div>

      {/* Right-hand icons + New Tab */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingLeft: 12,
        }}
      >
        <AddIcon
          style={{ cursor: "pointer" }}
          onClick={handleAddTab}
          title="New Tab"
        />
        <SearchIcon style={{ cursor: "pointer" }} />
        <NotificationsIcon style={{ cursor: "pointer" }} />
        <AccountCircleIcon style={{ cursor: "pointer" }} />
      </div>
    </div>
  );
};

export default NavbarTabs;
