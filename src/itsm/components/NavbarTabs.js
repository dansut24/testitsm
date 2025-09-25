// NavbarTabs.js
import React from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";

/**
 * NavbarTabs
 *
 * Props:
 *  - tabs: array of { label, path, favicon? }
 *  - tabIndex: active tab index
 *  - handleTabChange(ev, newIndex, path)
 *  - handleAddTab(path)  <-- adds a tab and navigates
 *  - handleTabClose(tabPath)
 *  - handleTabReorder(newTabsArray)
 *  - sidebarOpen, sidebarWidth, collapsedWidth
 *  - isMobile
 *  - handleMobileSidebarToggle (for logo toggling on mobile)
 *  - handleSidebarToggle (for desktop clicking logo to toggle collapse)
 *  - navbarOffset (top offset so chrome-tabs visuals can align if needed)
 */

const NavbarTabs = ({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleAddTab = () => {},
  handleTabClose = () => {},
  handleTabReorder = () => {},
  sidebarOpen = true,
  sidebarWidth = 256,
  collapsedWidth = 48,
  isMobile = false,
  handleMobileSidebarToggle = () => {},
  handleSidebarToggle = () => {},
  navbarOffset = 40,
}) => {
  if (!tabs || tabs.length === 0) return null;

  // Build chrome tabs model (id uses the path)
  const chromeTabs = tabs.map((t, i) => ({
    id: t.path || `tab-${i}`,
    title: t.label || "Untitled",
    active: i === tabIndex,
    // keep close visible for non-dashboard
    isCloseIconVisible: t.path !== "/dashboard",
  }));

  // override CSS (injected) to:
  // - make chrome-tabs background transparent
  // - hide icon placeholder
  // - style bottom bar to full width
  // - style active tab with soft shadow & rounded corners
  const overrideCss = `
    /* make chrome-tabs blend with our navbar */
    .chrome-tabs {
      background: transparent !important;
      border-bottom: none !important;
      box-shadow: none !important;
    }
    /* hide the favicon placeholder element entirely */
    .chrome-tab-favicon { display: none !important; }
    /* ensure bottom bar spans full width of the navbar */
    .chrome-tabs .chrome-tabs-bottom-bar {
      left: 0 !important;
      width: 100% !important;
      right: 0 !important;
      transform: none !important;
      height: 2px !important;
      background: transparent !important;
    }
    /* small tweaks to tabs */
    .chrome-tabs .chrome-tab {
      transition: transform 180ms cubic-bezier(.2,.9,.2,1), box-shadow 180ms ease, background-color 180ms ease;
      min-width: 120px;
      max-width: 420px;
      padding: 0 !important;
      margin: 0 6px 0 0 !important;
    }
    .chrome-tabs .chrome-tab .chrome-tab-title {
      font-size: 0.92rem;
      padding: 6px 8px;
      display: inline-block;
    }
    .chrome-tabs .chrome-tab.chrome-tab-active {
      box-shadow: 0 8px 20px rgba(2,6,23,0.12);
      border-radius: 8px;
      background: rgba(255,255,255,0.02);
    }
    /* remove the default close icon styles if you prefer our look */
    .chrome-tab .chrome-tab-close { opacity: 0.85; }
  `;

  // When chrome-tabs calls onTabActive it passes the tab id string
  const onTabActive = (tabId) => {
    const index = chromeTabs.findIndex((t) => t.id === tabId);
    if (index >= 0) {
      const path = tabs[index]?.path;
      handleTabChange(null, index, path);
    }
  };

  // When user closes a tab (chrome-tabs passes id)
  const onTabClose = (tabId) => {
    // disallow closing dashboard
    if (tabId === "/dashboard") return;
    handleTabClose(tabId);
  };

  // react-chrome-tabs calls onTabReorder(tabId, fromIndex, toIndex)
  const onTabReorder = (tabId, fromIndex, toIndex) => {
    // build a new tabs array using the existing tabs (by matching ids)
    const id = tabId;
    const currentIndex = tabs.findIndex((t) => t.path === id);
    if (currentIndex === -1) return;
    const newTabs = [...tabs];
    const [moved] = newTabs.splice(currentIndex, 1);
    // insert at toIndex (clamp)
    const insertAt = Math.max(0, Math.min(toIndex, newTabs.length));
    newTabs.splice(insertAt, 0, moved);
    // pass new array up to layout
    handleTabReorder(newTabs);
  };

  const leftOffset = isMobile ? 0 : sidebarOpen ? sidebarWidth : collapsedWidth;
  const widthCalc = isMobile ? "100%" : `calc(100% - ${leftOffset}px)`;

  // click on logo behaviour: on mobile toggle slide-in sidebar; on desktop toggle collapsed state
  const onLogoClick = (ev) => {
    if (isMobile) handleMobileSidebarToggle();
    else handleSidebarToggle();
  };

  // new tab handler (calls layout-provided add function)
  const onAddTab = () => {
    const newPath = `/new-tab-${Date.now()}`;
    const newLabel = "New Tab";
    handleAddTab(newLabel, newPath);
  };

  return (
    <>
      {/* Inject CSS overrides so we can tweak the chrome-tabs look without editing package CSS */}
      <style>{overrideCss}</style>

      <div
        style={{
          position: "fixed",
          top: NAVBAR_TOP_STYLE(navbarOffset),
          left: leftOffset,
          width: widthCalc,
          zIndex: 2000, // keep navbar above the sidebar overlay (sidebar uses zIndex < 2000)
          height: 34,
          paddingTop: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "transparent",
          // subtle backdrop to help the logo float:
          pointerEvents: "auto",
        }}
      >
        {/* Logo (clickable) */}
        <div
          onClick={onLogoClick}
          role="button"
          aria-label="Toggle sidebar"
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: 12,
            cursor: "pointer",
            transition: "transform 160ms ease, box-shadow 160ms ease",
            transform: isMobile && false ? "scale(0.98)" : "none",
            // when mobile open we'll nudge it — but we need mobileOpen prop to read; Layout controls mobileOpen
          }}
        >
          <img
            src="/logo192.png"
            alt="Logo"
            style={{
              height: 28,
              objectFit: "contain",
              borderRadius: 4,
              background: "rgba(255,255,255,0.04)",
              padding: 2,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          />
        </div>

        {/* Tabs area */}
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
            tabRenderer={(tab) => {
              // tab is the TabProperties object from chrome-tabs library
              const active = !!tab.active;
              return (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: isMobile ? 72 : 120,
                    maxWidth: isMobile ? 160 : 420,
                    padding: isMobile ? "0 8px" : "0 12px",
                    overflow: "hidden",
                    borderRadius: active ? 8 : 6,
                    boxShadow: active ? "0 6px 14px rgba(2,6,23,0.08)" : "none",
                    transition: "all 160ms ease",
                    background: active ? "rgba(255,255,255,0.02)" : "transparent",
                  }}
                >
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      fontSize: isMobile ? "0.78rem" : "0.9rem",
                      lineHeight: "1.8rem",
                    }}
                  >
                    {tab.title}
                  </span>
                </div>
              );
            }}
            // pinnedRight lets us provide the add button inside the tabs area
            pinnedRight={
              <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                <div
                  onClick={onAddTab}
                  role="button"
                  aria-label="New Tab"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    padding: "0 8px",
                    cursor: "pointer",
                  }}
                >
                  <AddIcon fontSize="small" />
                </div>
              </div>
            }
          />
        </div>

        {/* right-hand icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingLeft: 12 }}>
          <SearchIcon style={{ cursor: "pointer" }} />
          <NotificationsIcon style={{ cursor: "pointer" }} />
          <AccountCircleIcon style={{ cursor: "pointer" }} />
        </div>
      </div>
    </>
  );
};

// helper to compute top style: the browser layout expects numeric px; this returns a px value.
// kept as function so it's easier to tweak centrally.
function NAVBAR_TOP_STYLE(navbarOffset) {
  // We want nav visual top to be 0 but the tabs area to have a small top padding — Layout already offsets main content.
  // return string suitable for top property.
  return `${Math.max(0, navbarOffset - 34)}px`;
}

export default NavbarTabs;
