// NavbarTabs.js
import React, { useState, useEffect } from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";
import AddIcon from "@mui/icons-material/Add";

const NavbarTabs = ({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  isMobile = false,
}) => {
  const [localTabs, setLocalTabs] = useState(tabs);
  const [activeIndex, setActiveIndex] = useState(tabIndex);

  // Sync local tabs with props
  useEffect(() => {
    setLocalTabs(tabs);
    setActiveIndex(tabIndex);
  }, [tabs, tabIndex]);

  // ChromeTabs format
  const chromeTabs = localTabs.map((tab, index) => ({
    id: tab.path || `tab-${index}`,
    title: tab.label || "Untitled",
    active: index === activeIndex,
    isCloseIconVisible: true,
  }));

  // Handle tab activation
  const onTabActive = (tabId) => {
    const index = chromeTabs.findIndex((t) => t.id === tabId);
    if (index >= 0) {
      setActiveIndex(index);
      handleTabChange(null, index);
    }
  };

  // Handle tab close
  const onTabClose = (tabId) => {
    const index = chromeTabs.findIndex((t) => t.id === tabId);
    if (index >= 0) {
      const closingTab = localTabs[index];
      const newTabs = localTabs.filter((_, i) => i !== index);
      setLocalTabs(newTabs);

      // Set active tab
      const newActiveIndex = index === 0 ? 0 : index - 1;
      setActiveIndex(newActiveIndex);
      handleTabClose(closingTab.path);
    }
  };

  // Handle new tab
  const handleNewTab = () => {
    const newTab = {
      label: "New Tab",
      path: `/new-tab-${Date.now()}`,
    };
    const newTabs = [...localTabs, newTab];
    setLocalTabs(newTabs);
    const newIndex = newTabs.length - 1;
    setActiveIndex(newIndex);
    handleTabChange(null, newIndex);
  };

  // Tab reordering
  const onTabReorder = (tabId, fromIndex, toIndex) => {
    const reordered = [...localTabs];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setLocalTabs(reordered);
    if (activeIndex === fromIndex) setActiveIndex(toIndex);
    else if (activeIndex > fromIndex && activeIndex <= toIndex) setActiveIndex(activeIndex - 1);
    else if (activeIndex < fromIndex && activeIndex >= toIndex) setActiveIndex(activeIndex + 1);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
      <Tabs
        tabs={chromeTabs}
        onTabActive={onTabActive}
        onTabClose={onTabClose}
        onTabReorder={onTabReorder}
        draggable
        tabContentStyle={{ textAlign: "left" }}
        style={{
          flex: 1,
          minWidth: 0,
          background: "transparent",
          boxShadow: "none",
        }}
        tabRenderer={(tab, index) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              width: `${100 / (chromeTabs.length + 1)}%`, // +1 for new tab button
              overflow: "hidden",
              padding: "4px 8px",
              borderRadius: 6,
              boxShadow: tab.active ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
              backgroundColor: tab.active ? "rgba(255,255,255,0.15)" : "transparent",
              transition: "all 0.2s ease",
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

      {/* New tab button */}
      <div
        onClick={handleNewTab}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 6,
          backgroundColor: "rgba(255,255,255,0.1)",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <AddIcon style={{ fontSize: 20 }} />
      </div>
    </div>
  );
};

export default NavbarTabs;
