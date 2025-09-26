// src/itsm/components/NavbarTabs.js
import React, { useMemo } from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";

import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const NAVBAR_HEIGHT = 44;

export default function NavbarTabs({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  handleTabReorder = () => {},
  isMobile = false,
  onLogoClick = () => {},
}) {
  // Always keep Dashboard pinned
  const ensuredTabs = useMemo(() => {
    const rest = tabs.filter((t) => t.id !== "dashboard" && t.path !== "/dashboard");
    return [
      {
        id: "dashboard",
        path: "/dashboard",
        title: "Dashboard",
        pinned: true,
        favicon: "/favicon.ico",
      },
      ...rest,
    ];
  }, [tabs]);

  const sinmTabs = ensuredTabs.map((t, i) => ({
    id: t.id || t.path || `tab-${i}`,
    title: t.title || "Untitled",
    favicon: t.favicon || "/favicon.ico",
    active: i === tabIndex,
  }));

  const onNewTab = () => {
    const newId = Date.now().toString();
    handleTabChange(null, ensuredTabs.length, `/new-tab/${newId}`);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: NAVBAR_HEIGHT,
        zIndex: 1500,
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        background: "#f8f9fa",
        borderBottom: "1px solid rgba(0,0,0,0.15)",
      }}
    >
      {/* Menu/Logo */}
      <button
        onClick={onLogoClick}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 6px",
          marginRight: 6,
        }}
      >
        <MenuIcon />
      </button>

      {/* Tab strip */}
      <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
        <Tabs
          draggable
          tabs={sinmTabs}
          onTabActive={(id) => {
            const idx = sinmTabs.findIndex((t) => t.id === id);
            handleTabChange(null, idx, ensuredTabs[idx]?.path || id);
          }}
          onTabClose={(id) => {
            if (id === "dashboard") return;
            const idx = sinmTabs.findIndex((t) => t.id === id);
            handleTabClose(ensuredTabs[idx]?.path || id);
          }}
          onTabReorder={(from, to) => handleTabReorder(from, to)}
        />
        <style>{`
          /* Let the library position tabs inline */
          .chrome-tabs .chrome-tab {
            width: 120px; /* default width */
          }
          /* Dashboard pinned width */
          .chrome-tabs .chrome-tab:first-child {
            width: 120px !important;
          }
          /* Other tabs shrink gracefully */
          .chrome-tabs .chrome-tab:not(:first-child) {
            min-width: 70px;
          }
          /* Hover close button small */
          .chrome-tabs .chrome-tab .chrome-tab-close {
            width: 14px;
            height: 14px;
            opacity: 0;
            transition: opacity .2s ease;
          }
          .chrome-tabs .chrome-tab:hover .chrome-tab-close {
            opacity: 1;
          }
        `}</style>
      </div>

      {/* Right icons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
          marginLeft: 8,
        }}
      >
        <AddIcon onClick={onNewTab} style={{ cursor: "pointer" }} />
        {!isMobile && (
          <>
            <SearchIcon style={{ cursor: "pointer" }} />
            <NotificationsIcon style={{ cursor: "pointer" }} />
            <AccountCircleIcon style={{ cursor: "pointer" }} />
          </>
        )}
      </div>
    </div>
  );
}
