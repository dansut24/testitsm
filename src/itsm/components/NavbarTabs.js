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
  handleTabAdd = () => {},
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
        backgroundColor: "rgba(200, 200, 200, 0.15)", // theme-ready semi-transparent
        borderRadius: 8,
        padding: "0 12px",
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      {/* Left: Floating Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginRight: 12,
        }}
      >
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
      <div style={{ flex: 1, minWidth: 0 }}>
        <Tabs
          tabs={chromeTabs}
          onTabActive={onTabActive}
          onTabClose={onTabClose}
          draggable
          className="chrome-tabs"
          tabContentStyle={{ textAlign: "left" }}
          style={{ width: "100%" }}
          tabRenderer={(tab, index) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                width: "auto",
                minWidth: 120,
                maxWidth: 300,
                padding: "0 12px",
                borderRadius: 6,
                marginRight: 4,
                boxShadow: tab.active
                  ? "0 2px 6px rgba(0,0,0,0.15)"
                  : "none",
                backgroundColor: tab.active
                  ? "rgba(255,255,255,0.3)"
                  : "transparent",
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
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {tab.title}
              </span>
            </div>
          )}
        />
      </div>

      {/* Right: Add + Button and Icons */}
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
          onClick={handleTabAdd}
          titleAccess="Add New Tab"
        />
        <SearchIcon style={{ cursor: "pointer" }} />
        <NotificationsIcon style={{ cursor: "pointer" }} />
        <AccountCircleIcon style={{ cursor: "pointer" }} />
      </div>

      {/* Inline CSS for chrome-tabs */}
     <style>
  {`
    .chrome-tabs {
      background-color: transparent !important;
      border-bottom: none !important;
    }


    .chrome-tab-title {
    text-align: left;
    }

    /* Make the bottom bar span full width */
    .chrome-tabs-bottom-bar {
      left: 0 !important;
      background-color: rgba(255,255,255,0.3) !important; /* optional highlight for active bar */
    }
  `}
</style>

    </div>
  );
};

export default NavbarTabs;
