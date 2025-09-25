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
  handleTabReorder = () => {},
  sidebarOpen = true,
  sidebarWidth = 240,
  collapsedWidth = 60,
  isMobile = false,
  onLogoClick = () => {},
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
        top: 6,
        left: leftOffset,
        width: widthCalc,
        zIndex: 1500,
        height: 34,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "transparent",
      }}
    >
      {/* Logo (toggles sidebar on mobile) */}
      <div
        style={{ display: "flex", alignItems: "center", marginRight: 12, cursor: "pointer" }}
        onClick={isMobile ? onLogoClick : undefined}
      >
        <img src="/logo192.png" alt="Logo" style={{ height: 28, objectFit: "contain" }} />
      </div>

      {/* Tabs */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Tabs
          tabs={chromeTabs}
          onTabActive={onTabActive}
          onTabClose={onTabClose}
          onTabReorder={isMobile ? undefined : onTabReorder} // disable drag on mobile
          draggable={!isMobile}
          className="chrome-tabs"
          tabContentStyle={{ textAlign: "left" }}
          style={{ width: "100%" }}
          tabRenderer={(tab) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                minWidth: isMobile ? 80 : 120,
                maxWidth: 300,
                overflow: "hidden",
                padding: isMobile ? "0 6px" : "0 12px",
                borderRadius: tab.active ? 6 : 4,
                boxShadow: tab.active ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                backgroundColor: tab.active ? "rgba(255,255,255,0.2)" : "transparent",
              }}
            >
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

      {/* New Tab Button */}
      <AddIcon
        style={{ cursor: "pointer", marginRight: 12 }}
        onClick={() =>
          handleTabChange(null, tabs.length, `/new-tab-${Date.now()}`)
        }
      />

      {/* Right-hand icons */}
      {!isMobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, paddingRight: 12 }}>
          <SearchIcon style={{ cursor: "pointer" }} />
          <NotificationsIcon style={{ cursor: "pointer" }} />
          <AccountCircleIcon style={{ cursor: "pointer" }} />
        </div>
      )}
    </div>
  );
};

export default NavbarTabs;
