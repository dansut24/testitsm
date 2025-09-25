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
  handleNewTab = () => {},
  sidebarOpen = true,
  sidebarWidth = 256,
  collapsedWidth = 48,
  isMobile = false,
}) => {
  if (!tabs || tabs.length === 0) return null;

  // ChromeTabs array
  const chromeTabs = tabs.map((tab, index) => ({
    id: tab.path || `tab-${index}`,
    title: tab.label || "Untitled",
    active: index === tabIndex,
    isCloseIconVisible: tab.path !== "/dashboard",
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
        height: 48,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        backdropFilter: "blur(12px)",
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        zIndex: 1500,
        justifyContent: "space-between",
        transition: "left 0.2s ease",
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
            backgroundColor: "rgba(255,255,255,0.25)",
          }}
        />
      </div>

      {/* Tabs + New Tab button */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <Tabs
          tabs={chromeTabs}
          onTabActive={onTabActive}
          onTabClose={onTabClose}
          draggable
          className="chrome-tabs"
          style={{ flex: 1 }}
          tabContentStyle={{ textAlign: "left", whiteSpace: "nowrap" }}
          tabRenderer={(tab) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "0 12px",
                borderRadius: 6,
                marginRight: 4,
                backgroundColor: tab.active ? "rgba(255,255,255,0.25)" : "transparent",
                boxShadow: tab.active ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                flexShrink: 0,
                transition: "all 0.2s ease",
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {tab.title}
              </span>
            </div>
          )}
        />

        {/* New tab button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            marginLeft: 6,
            borderRadius: 6,
            backgroundColor: "rgba(255,255,255,0.2)",
            cursor: "pointer",
            transition: "background-color 0.2s",
            flexShrink: 0,
          }}
          onClick={handleNewTab}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")
          }
        >
          <AddIcon fontSize="small" />
        </div>
      </div>

      {/* Right-hand icons */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, paddingLeft: 12 }}>
        <SearchIcon style={{ cursor: "pointer" }} />
        <NotificationsIcon style={{ cursor: "pointer" }} />
        <AccountCircleIcon style={{ cursor: "pointer" }} />
      </div>

      {/* ChromeTabs overrides */}
      <style>
        {`
          .chrome-tab-favicon { display: none !important; }
          .chrome-tabs-bottom-bar { width: 100% !important; left: 0 !important; }
        `}
      </style>
    </div>
  );
};

export default NavbarTabs;
