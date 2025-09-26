// src/itsm/components/NavbarTabs.js
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";

import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const NAVBAR_HEIGHT = 44;
const DASHBOARD_WIDTH = 120;   // fixed width for pinned Dashboard
const MIN_TAB_WIDTH = 70;      // others never shrink below this

export default function NavbarTabs({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  handleTabReorder = () => {},
  isMobile = false,
  onLogoClick = () => {},
}) {
  // Ensure Dashboard pinned at front
  const ensuredTabs = useMemo(() => {
    const rest = tabs.filter((t) => t.id !== "dashboard" && t.path !== "/dashboard");
    return [
      {
        id: "dashboard",
        path: "/dashboard",
        label: "Dashboard",
        pinned: true,
        faviconUrl: "/favicon.ico",
      },
      ...rest,
    ];
  }, [tabs]);

  const safeActiveIndex =
    tabIndex >= 0 && tabIndex < ensuredTabs.length ? tabIndex : 0;

  const sinmTabs = ensuredTabs.map((t, i) => ({
    id: t.id || t.path || `tab-${i}`,
    title: t.label || "Untitled",
    favicon: t.faviconUrl || "/favicon.ico",
    active: i === safeActiveIndex,
  }));

  // Measure available strip width
  const stripRef = useRef(null);
  const [stripW, setStripW] = useState(0);

  useLayoutEffect(() => {
    if (!stripRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
      setStripW(Math.max(0, Math.floor(w)));
    });
    ro.observe(stripRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (stripRef.current) setStripW(stripRef.current.clientWidth);
  }, [sinmTabs.length]);

  // Calculate width for non-pinned tabs
  const totalOthers = sinmTabs.length - 1;
  let otherWidth = totalOthers > 0 ? (stripW - DASHBOARD_WIDTH) / totalOthers : 0;
  if (otherWidth < MIN_TAB_WIDTH) otherWidth = MIN_TAB_WIDTH;

  const ultraTight = otherWidth <= 90;

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
      {/* Left menu/logo */}
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
      <div
        ref={stripRef}
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
          position: "relative",
          ["--dashWidth"]: `${DASHBOARD_WIDTH}px`,
          ["--otherWidth"]: `${otherWidth}px`,
        }}
        className={ultraTight ? "tabs-ultratight" : "tabs-normal"}
      >
        <Tabs
          draggable
          tabs={sinmTabs}
          onTabActive={(id) => {
            const idx = sinmTabs.findIndex((t) => t.id === id);
            const target = ensuredTabs[idx];
            handleTabChange(null, idx, target?.path || id);
          }}
          onTabClose={(id) => {
            if (id === "dashboard") return; // protect pinned
            const idx = sinmTabs.findIndex((t) => t.id === id);
            const target = ensuredTabs[idx];
            handleTabClose(target?.path || id);
          }}
          onTabReorder={(from, to) => handleTabReorder(from, to)}
        />

        <style>{`
          .chrome-tabs {
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-end;
            height: 100%;
          }

          .chrome-tabs .chrome-tab {
            flex: 0 0 var(--otherWidth) !important;
            max-width: var(--otherWidth) !important;
            min-width: var(--otherWidth) !important;
            height: 88%;
            margin-right: -10px;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 100%, 0% 100%);
            box-sizing: border-box;
          }

          /* First tab (Dashboard) is pinned width */
          .chrome-tabs .chrome-tab:first-child {
            flex: 0 0 var(--dashWidth) !important;
            max-width: var(--dashWidth) !important;
            min-width: var(--dashWidth) !important;
          }

          /* Divider */
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

          /* Close button */
          .chrome-tabs .chrome-tab .chrome-tab-close {
            width: 16px;
            height: 16px;
            opacity: 0;
            transition: opacity .2s ease;
            border-radius: 50%;
          }
          .chrome-tabs .chrome-tab:hover .chrome-tab-close { opacity: 1; }
          .chrome-tabs .chrome-tab .chrome-tab-close svg {
            width: 12px; height: 12px;
          }

          /* Active styling */
          .chrome-tabs .chrome-tab.chrome-tab-active {
            background: #fff;
            border-bottom: 2px solid #2BD3C6;
          }

          /* Hide text if too tight */
          .tabs-ultratight .chrome-tabs .chrome-tab .chrome-tab-title {
            display: none;
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
