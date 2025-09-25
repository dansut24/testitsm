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

  // Inline CSS overrides for ChromeTabs
  const chromeTabsStyle = `
    .chrome-tabs {
      background-color: transparent !important;
      border-bottom: none !important;
      height: 100%;
    }
    .chrome-tab {
      border-bottom: none !important;
      background-color: transparent !important;
      border-radius: 8px 8px 0 0;
      transition: background-color 0.2s, box-shadow 0.2s, transform 0.2s;
    }
    .chrome-tab.chrome-tab--active {
      background-color: rgba(255,255,255,0.25) !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      border-bottom: none !important;
    }
    .chrome-tab:hover {
      transform: translateY(-2px);
    }
  `;

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
    <>
      <style>{chromeTabsStyle}</style>

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
        <div style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", alignItems: "center" }}>
          <Tabs
            tabs={chromeTabs}
            onTabActive={onTabActive}
            onTabClose={onTabClose}
            draggable
            className="chrome-tabs"
            tabContentStyle={{ textAlign: "left", height: "100%" }}
            style={{ width: "100%", height: "100%" }}
            tabRenderer={(tab, tabIndex) => (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  width: `${100 / (chromeTabs.length + 1)}%`,
                  overflow: "hidden",
                  padding: "0 8px",
                  height: "100%",
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

          {/* New tab button */}
          <div
            onClick={handleTabAdd}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              width: 32,
              height: 32,
              marginLeft: 4,
              borderRadius: 6,
              backgroundColor: "rgba(255,255,255,0.2)",
              transition: "background-color 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.35)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")}
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
      </div>
    </>
  );
};

export default NavbarTabs;
