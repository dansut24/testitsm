// NavbarTabs.js
import React, { useState, useEffect } from "react";
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
  const [localTabs, setLocalTabs] = useState(tabs);
  const [activeIndex, setActiveIndex] = useState(tabIndex);

  useEffect(() => {
    setLocalTabs(tabs);
  }, [tabs]);

  useEffect(() => {
    setActiveIndex(tabIndex);
  }, [tabIndex]);

  const onTabActive = (tabId) => {
    const index = localTabs.findIndex((t) => t.path === tabId);
    if (index >= 0) {
      setActiveIndex(index);
      handleTabChange(null, index);
    }
  };

  const onTabClose = (tabId) => {
    handleTabClose(tabId);
  };

  const leftOffset = isMobile ? 0 : sidebarOpen ? sidebarWidth : collapsedWidth;
  const widthCalc = isMobile ? "100%" : `calc(100% - ${leftOffset}px)`;

  // Convert tabs to ChromeTabs format
  const chromeTabs = localTabs.map((tab, index) => ({
    id: tab.path || `tab-${index}`,
    title: tab.label || "Untitled",
    active: index === activeIndex,
    isCloseIconVisible: tab.path !== "/dashboard",
  }));

  return (
    <div
      style={{
        position: "fixed",
        top: 6,
        left: leftOffset,
        width: widthCalc,
        zIndex: 1500,
        height: 34,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        backgroundColor: "rgba(200,200,200,0.15)",
        borderRadius: 4,
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      {/* Left: Logo */}
      <div style={{ display: "flex", alignItems: "center", marginRight: 12 }}>
        <img
          src="/logo192.png"
          alt="Logo"
          style={{
            height: 22,
            objectFit: "contain",
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.3)",
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ flex: 1, display: "flex", minWidth: 0, overflow: "hidden" }}>
        <Tabs
          tabs={chromeTabs}
          onTabActive={onTabActive}
          onTabClose={onTabClose}
          draggable
          className="chrome-tabs"
          tabContentStyle={{ textAlign: "left" }}
          style={{ flex: 1 }}
          tabRenderer={(tab, index) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "0 8px",
                overflow: "hidden",
                borderRadius: tab.active ? 6 : 4,
                boxShadow: tab.active
                  ? "0 2px 6px rgba(0,0,0,0.15)"
                  : "none",
                transition: "all 0.2s ease-in-out",
                backgroundColor: tab.active
                  ? "rgba(255,255,255,0.2)"
                  : "transparent",
              }}
            >
              <span
                style={{
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  paddingRight: 4,
                }}
              >
                {tab.title}
              </span>
            </div>
          )}
        />

        {/* New tab + button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            marginLeft: 4,
            marginRight: 8,
          }}
          onClick={handleAddTab}
        >
          <AddIcon fontSize="small" />
        </div>
      </div>

      {/* Right-hand icons */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <SearchIcon style={{ cursor: "pointer" }} />
        <NotificationsIcon style={{ cursor: "pointer" }} />
        <AccountCircleIcon style={{ cursor: "pointer" }} />
      </div>

      {/* Override chrome-tabs bottom bar */}
      <style>{`
        .chrome-tabs-bottom-bar {
          width: 100% !important;
        }
        .chrome-tab-favicon {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default NavbarTabs;
