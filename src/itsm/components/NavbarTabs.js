// NavbarTabs.js
import React from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";
import AddIcon from "@mui/icons-material/Add";

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
  handleMobileSidebarToggle = () => {},
}) => {
  if (!tabs || tabs.length === 0) return null;

  const chromeTabs = tabs.map((tab, index) => ({
    id: tab.path || `tab-${index}`,
    title: tab.label || "Untitled",
    active: index === tabIndex,
    isCloseIconVisible: tab.path !== "/dashboard",
  }));

  const onTabActive = (tabId) => {
    const index = chromeTabs.findIndex((t) => t.id === tabId);
    if (index >= 0) handleTabChange(null, index, tabs[index].path);
  };

  const onTabClose = (tabId) => handleTabClose(tabId);

  const onTabReorder = (tabsReordered) => {
    handleTabReorder(
      tabsReordered.map((t) => tabs.find((tab) => tab.path === t.id))
    );
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
        height: 34,
        paddingTop: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "transparent",
      }}
    >
      {/* Logo (acts as sidebar toggle on mobile) */}
      <div
        style={{ display: "flex", alignItems: "center", marginRight: 12, cursor: "pointer" }}
        onClick={isMobile ? handleMobileSidebarToggle : undefined}
      >
        <img src="/logo192.png" alt="Logo" style={{ height: 28, objectFit: "contain" }} />
      </div>

      {/* Tabs */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Tabs
          tabs={chromeTabs}
          onTabActive={onTabActive}
          onTabClose={onTabClose}
          onTabReorder={onTabReorder}
          draggable
          className="chrome-tabs"
          tabContentStyle={{ textAlign: "left" }}
          style={{ width: "100%" }}
          tabRenderer={(tab) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: isMobile ? 60 : 120,
                maxWidth: isMobile ? 120 : 300,
                padding: isMobile ? "0 6px" : "0 12px",
                overflow: "hidden",
                borderRadius: tab.active ? 6 : 4,
                backgroundColor: tab.active ? "rgba(255,255,255,0.2)" : "transparent",
              }}
            >
              <span
                style={{
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  fontSize: isMobile ? "0.75rem" : "0.9rem",
                }}
              >
                {tab.title}
              </span>
            </div>
          )}
        />
      </div>

      {/* New Tab Button */}
      {!isMobile && (
        <AddIcon
          style={{ cursor: "pointer", marginRight: 12 }}
          onClick={() =>
            handleTabChange(null, tabs.length, `/new-tab-${Date.now()}`)
          }
        />
      )}
    </div>
  );
};

export default NavbarTabs;
