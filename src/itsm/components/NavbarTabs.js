// NavbarTabs.js
import React from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";

const NAVBAR_HEIGHT = 34;       // container height
const NAVBAR_PADDING_TOP = 6;   // top offset from layout
const TAB_HEIGHT = 28;          // actual tab height (smaller than navbar)

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
    // tabsReordered is an array of { id } in the new order
    handleTabReorder(
      tabsReordered.map((t) => tabs.find((tab) => tab.path === t.id))
    );
  };

  const leftOffset = isMobile ? 0 : sidebarOpen ? sidebarWidth : collapsedWidth;
  const widthCalc = isMobile ? "100%" : `calc(100% - ${leftOffset}px)`;

  // mobile-friendly widths to fit ~6 tabs in portrait
  const tabMinWidth = isMobile ? 76 : 120;
  const tabPaddingX = isMobile ? 6 : 12;

  // vertical centering of the tabs inside the 34px navbar
  const tabsTopOffset = (NAVBAR_HEIGHT - TAB_HEIGHT) / 2; // = 3px

  return (
    <>
      {/* Inline overrides: shorter tabs than navbar + remove underline */}
      <style>{`
        .chrome-tabs {
          background-color: transparent !important;
          border-bottom: none !important;
          height: ${TAB_HEIGHT}px !important;
          margin-top: ${tabsTopOffset}px !important;    /* center vertically */
        }
        .chrome-tabs-bottom-bar {
          display: none !important;
          height: 0 !important;
        }
        .chrome-tab,
        .chrome-tab .chrome-tab-content,
        .chrome-tab .chrome-tab-background {
          height: ${TAB_HEIGHT}px !important;
        }
        .chrome-tab-title {
          line-height: ${TAB_HEIGHT}px !important;
          text-align: left !important;
        }
        /* Remove favicon placeholder completely */
        .chrome-tab-favicon {
          display: none !important;
          width: 0 !important;
          margin: 0 !important;
        }
        /* Subtle emphasis on active tab */
        .chrome-tab[active=""], .chrome-tab[active="true"] {
          filter: drop-shadow(0 1px 3px rgba(0,0,0,0.12));
        }
      `}</style>

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
          justifyContent: "space-between",
          backgroundColor: "transparent",
        }}
      >
        {/* Logo (toggles sidebar on mobile) */}
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
          <img
            src="/logo192.png"
            alt="Logo"
            style={{ height: 28, objectFit: "contain" }}
          />
        </div>

        {/* Tabs */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Tabs
            tabs={chromeTabs}
            onTabActive={onTabActive}
            onTabClose={onTabClose}
            onTabReorder={isMobile ? undefined : onTabReorder}
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
                  minWidth: tabMinWidth,
                  maxWidth: 320,
                  overflow: "hidden",
                  padding: `0 ${tabPaddingX}px`,
                  borderRadius: tab.active ? 6 : 4,
                  backgroundColor: tab.active
                    ? "rgba(0,0,0,0.06)"
                    : "transparent",
                  transition: "background-color .15s ease",
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

        {/* Right-hand icons (desktop only) */}
        {!isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              paddingRight: 12,
              height: "100%",
            }}
          >
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
