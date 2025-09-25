// NavbarTabs.js
import React from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";

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

  // Convert your tabs array into ChromeTabs format
  const chromeTabs = tabs.map((tab, index) => ({
    id: tab.path || `tab-${index}`,
    title: tab.label || "Untitled",
    favicon: tab.favicon || undefined,
    active: index === tabIndex,
    isCloseIconVisible: tab.path === "/dashboard" ? false : true, // Dashboard cannot be closed
  }));

  const onTabActive = (tabId) => {
    const index = chromeTabs.findIndex((t) => t.id === tabId);
    if (index >= 0) handleTabChange(null, index);
  };

  const onTabClose = (tabId) => {
    const tab = chromeTabs.find((t) => t.id === tabId);
    if (tab && tab.path === "/dashboard") return; // Prevent closing Dashboard
    handleTabClose(tabId);
  };

  const onTabReorder = (tabId, fromIndex, toIndex) => {
    // Optional: implement reorder logic if needed
  };

  // Adjust width to account for sidebar
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
        height: 34.6, // Remove extra top padding
        background: "transparent", // Remove grey background
        display: "flex",
        alignItems: "center",
      }}
    >
      <Tabs
        tabs={chromeTabs}
        onTabActive={onTabActive}
        onTabClose={onTabClose}
        onTabReorder={onTabReorder}
        draggable
        className="chrome-tabs"
        tabContentStyle={{ textAlign: "left" }} // Align text left
      />
    </div>
  );
};

export default NavbarTabs;
