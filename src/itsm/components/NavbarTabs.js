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
const DEFAULT_TAB_W = 120;
const MIN_TAB_W = 70;

export default function NavbarTabs({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  handleTabReorder = () => {},
  isMobile = false,
  onLogoClick = () => {},
}) {
  // Insert Dashboard tab as the first item, but let it behave like the others
  const ensuredTabs = useMemo(() => {
    const rest = tabs.filter((t) => t.id !== "dashboard" && t.path !== "/dashboard");
    return [
      {
        id: "dashboard",
        path: "/dashboard",
        title: "Dashboard",
        pinned: true, // can’t be closed
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
      {/* Left logo/menu */}
      <button
        type="button"
        aria-label="Menu"
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
            if (id === "dashboard") return; // Dashboard can’t be closed
            const idx = sinmTabs.findIndex((t) => t.id === id);
            handleTabClose(ensuredTabs[idx]?.path || id);
          }}
          onTabReorder={(from, to) => handleTabReorder(from, to)}
        />
        <style>{`
          /* Let library do positioning, but control widths */
          .chrome-tabs {
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-end;
            height: 100%;
          }

          .chrome-tabs .chrome-tab {
            width: ${DEFAULT_TAB_W}px;
            min-width: ${MIN_TAB_W}px;
            height: 88%;
            margin-right: -10px;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 100%, 0% 100%);
            box-sizing: border-box;
          }

          /* Divider line */
          .chrome-tabs .chrome-tab:not(.chrome-tab-active)::before {
            content: "";
            position: absolute;
            left: 0;
            top: 6px;
            bottom: 6px;
            width: 1px;
            background: rgba(0,0,0,0.1);
            pointer-events: none;
          }

          /* Close button hover */
          .chrome-tabs .chrome-tab .chrome-tab-close {
            width: 14px;
            height: 14px;
            opacity: 0;
            transition: opacity .2s ease;
            border-radius: 50%;
          }
          .chrome-tabs .chrome-tab:hover .chrome-tab-close {
            opacity: 1;
          }
          .chrome-tabs .chrome-tab .chrome-tab-close svg {
            width: 12px; height: 12px;
          }

          /* Active tab highlight */
          .chrome-tabs .chrome-tab.chrome-tab-active {
            background: #fff;
            border-bottom: 2px solid #2BD3C6;
          }
        `}</style>
      </div>

      {/* Right side icons */}
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
