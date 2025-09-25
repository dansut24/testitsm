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
    // tabsReordered is the array returned by the chrome-tabs library (ids only)
    // Map back to your full tab objects (by path/id) in the same order
    handleTabReorder(
      tabsReordered.map((t) => tabs.find((tab) => tab.path === t.id))
    );
  };

  const leftOffset = isMobile ? 0 : sidebarOpen ? sidebarWidth : collapsedWidth;
  const widthCalc = isMobile ? "100%" : `calc(100% - ${leftOffset}px)`;

  // Mobile-friendly min widths
  const tabMinWidth = isMobile ? 80 : 120;

  return (
    <>
      {/* Inline overrides to perfectly align with a 34px navbar and remove underline */}
      <style>{`
        /* Make the bar transparent and remove any bottom line */
        .chrome-tabs {
          background-color: transparent !important;
          border-bottom: none !important;
          height: ${NAVBAR_HEIGHT}px !important;
          --tab-height: ${NAVBAR_HEIGHT}px; /* some themes read this var */
        }

        /* Kill the underline / bottom bar entirely */
        .chrome-tabs-bottom-bar {
          display: none !important;
          height: 0 !important;
        }

        /* Ensure all tab pieces share the same height */
        .chrome-tab,
        .chrome-tab .chrome-tab-content,
        .chrome-tab .chrome-tab-background {
          height: ${NAVBAR_HEIGHT}px !important;
        }

        /* Keep the active tab looking a touch elevated */
        .chrome-tab[active=""] .chrome-tab-background,
        .chrome-tab[active="true"] .chrome-tab-background {
          box-shadow: 0 2px 6px rgba(0,0,0,0.12) !important;
        }

        /* Title vertically centered and left-aligned */
        .chrome-tab-title {
          line-height: ${NAVBAR_HEIGHT}px !important;
          text-align: left !important;
        }

        /* Hide favicon placeholder completely */
        .chrome-tab-favicon {
          display: none !important;
          width: 0 !important;
          margin: 0 !important;
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
          // no border-bottom so tabs visually blend into content
        }}
      >
        {/* Logo (toggles sidebar on mobile) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: 12,
            cursor: isMobile ? "pointer" : "default",
          }}
          onClick={isMobile ? onLogoClick : undefined}
        >
          <img
            src="/logo192.png"
            alt="Logo"
            style={{ height: 28, objectFit: "contain" }}
          />
        </div>

        {/* Tabs (fill available space) */}
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
                  minWidth: tabMinWidth,
                  maxWidth: 320,
                  overflow: "hidden",
                  padding: isMobile ? "0 6px" : "0 12px",
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
