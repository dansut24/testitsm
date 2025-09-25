// NavbarTabs.js
import React from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const NavbarTabs = ({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  handleNewTab = () => {},
  handleTabReorder = () => {},
  sidebarOpen = true,
  sidebarWidth = 256,
  collapsedWidth = 48,
  isMobile = false,
}) => {
  if (!tabs || tabs.length === 0) return null;

  // Map tabs to chrome-tabs format
  const chromeTabs = tabs.map((tab, index) => ({
    id: tab.path || `tab-${index}`,
    title: tab.label || "Untitled",
    active: index === tabIndex,
    isCloseIconVisible: tab.path === "/dashboard" ? false : true,
  }));

  const leftOffset = isMobile ? 0 : sidebarOpen ? sidebarWidth : collapsedWidth;
  const widthCalc = isMobile ? "100%" : `calc(100% - ${leftOffset}px)`;

  const onTabActive = (tabId) => {
    const index = chromeTabs.findIndex((t) => t.id === tabId);
    if (index >= 0) handleTabChange(null, index);
  };

  const onTabClose = (tabId) => {
    const tab = chromeTabs.find((t) => t.id === tabId);
    if (!tab || tab.path === "/dashboard") return;
    handleTabClose(tabId);
  };

  const onTabReorder = (tabId, fromIndex, toIndex) => {
    handleTabReorder(fromIndex, toIndex);
  };

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
        backgroundColor: "rgba(200,200,200,0.15)",
        borderRadius: 8,
        padding: "0 12px",
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      {/* Logo */}
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

      {/* Tabs container */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
        <Tabs
          tabs={chromeTabs}
          onTabActive={onTabActive}
          onTabClose={onTabClose}
          onTabReorder={onTabReorder}
          draggable
          className="chrome-tabs"
          tabContentStyle={{ textAlign: "left" }}
          style={{ width: "100%" }}
          tabRenderer={(tab, tabIdx) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "0 12px",
                borderRadius: 6,
                margin: "0 4px",
                boxShadow: tab.active
                  ? "0 1px 3px rgba(0,0,0,0.2)"
                  : "none",
                backgroundColor: tab.active
                  ? "rgba(255,255,255,0.2)"
                  : "transparent",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "all 0.2s ease",
              }}
            >
              {tab.title}
            </div>
          )}
        />

        {/* New tab button */}
        <div
          onClick={handleNewTab}
          style={{
            cursor: "pointer",
            marginLeft: 4,
            padding: "4px 8px",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.1)",
            transition: "all 0.2s ease",
            height: 32,
          }}
          title="New Tab"
        >
          <AddIcon fontSize="small" />
        </div>
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

      {/* Inline CSS for chrome-tabs background */}
      <style>
        {`
          .chrome-tabs {
            background-color: transparent !important;
            border-bottom: none !important;
          }
          .chrome-tabs-bottom-bar {
            width: 100% !important;
          }
          .chrome-tab-favicon {
            display: none !important;
          }
        `}
      </style>
    </div>
  );
};

export default NavbarTabs;
