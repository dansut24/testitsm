// NavbarTabs.js
import React from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";

const NAVBAR_HEIGHT = 34;
const NAVBAR_PADDING_TOP = 6;
const TAB_DRAW_HEIGHT = 30;

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
    if (isMobile) return;
    handleTabReorder(
      tabsReordered.map((t) => tabs.find((tab) => tab.path === t.id))
    );
  };

  const leftOffset = isMobile ? 0 : sidebarOpen ? sidebarWidth : collapsedWidth;
  const widthCalc = isMobile ? "100%" : `calc(100% - ${leftOffset}px)`;

  return (
    <>
      <style>
        {`
          .chrome-tabs {
            background: transparent !important;
            border-bottom: none !important;
            box-shadow: none !important;
            height: ${NAVBAR_HEIGHT}px !important;
            margin-top: 0 !important;
          }

          .chrome-tabs .chrome-tabs-content {
            height: ${NAVBAR_HEIGHT}px !important;
            align-items: center;
          }

          .chrome-tabs .chrome-tab {
            flex: 1 1 auto;
            min-width: ${isMobile ? 60 : 90}px;
            max-width: ${isMobile ? 120 : 180}px;
            transition: flex-basis .2s ease;
            height: ${TAB_DRAW_HEIGHT}px !important;
          }

          .chrome-tab .chrome-tab-title {
            font-size: ${isMobile ? "12px" : "13px"};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: ${TAB_DRAW_HEIGHT}px !important;
          }

          .chrome-tab .chrome-tab-favicon {
            display: none !important;
          }
        `}
      </style>

      <div
        style={{
          position: "fixed",
          top: NAVBAR_PADDING_TOP,
          left: leftOffset,
          width: widthCalc,
          zIndex: 1500,
          height: NAVBAR_HEIGHT,
          display: "flex",
          alignItems: "center",
          backgroundColor: "transparent",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: 12,
            cursor: isMobile ? "pointer" : "default",
            height: "100%",
          }}
          onClick={isMobile ? onLogoClick : undefined}
        >
          <img src="/logo192.png" alt="Logo" style={{ height: 28 }} />
        </div>

        {/* Tabs */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            height: "100%",
            minWidth: 0,
          }}
        >
          <Tabs
            tabs={chromeTabs}
            onTabActive={onTabActive}
            onTabClose={onTabClose}
            onTabReorder={!isMobile ? onTabReorder : undefined}
            draggable={!isMobile}
            className="chrome-tabs"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* New Tab Button */}
        <AddIcon
          style={{ cursor: "pointer", marginRight: 12 }}
          onClick={() => {
            const newId = Date.now();
            handleTabChange(null, tabs.length, `/new-tab/${newId}`);
          }}
        />

        {/* Right-hand icons (desktop only) */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 16, paddingRight: 12 }}>
            <SearchIcon style={{ cursor: "pointer" }} />
            <NotificationsIcon style={{ cursor: "pointer" }} />
            <AccountCircleIcon style={{ cursor: "pointer" }} />
          </div>
        )}
      </div>
    </>
  );
};

export default NavbarTabs;
