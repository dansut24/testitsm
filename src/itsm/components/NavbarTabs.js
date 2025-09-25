// NavbarTabs.js
import React from "react";
import ChromeTabs from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/chrome-tabs.css";
import "@sinm/react-chrome-tabs/chrome-tabs-dark-theme.css";

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
  }));

  const onTabActive = (tabId) => {
    const index = chromeTabs.findIndex((t) => t.id === tabId);
    if (index >= 0) handleTabChange(null, index);
  };

  const onTabClose = (tabId) => {
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
        paddingTop: 7,
        height: 34.6 + 7,
        background: "#fff",
        borderBottom: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
      }}
    >
      <ChromeTabs
        tabs={chromeTabs}
        onTabActive={onTabActive}
        onTabClose={onTabClose}
        onTabReorder={onTabReorder}
        draggable
      />
    </div>
  );
};

export default NavbarTabs;
