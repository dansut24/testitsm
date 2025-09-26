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
const DEFAULT_TAB_W = 120;
const MIN_TAB_W = 90; // keep enough room for favicon + text

export default function NavbarTabs({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  handleTabReorder = () => {},
  isMobile = false,
  onLogoClick = () => {},
}) {
  // Always keep Dashboard at front, but shrink with others
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

  // Measure available width
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

  // Dynamic width calc
  const count = sinmTabs.length || 1;
  let computed = DEFAULT_TAB_W;
  if (stripW > 0) {
    computed = Math.floor(stripW / count);
    if (computed < MIN_TAB_W) computed = MIN_TAB_W;
  }
  if (count === 1) computed = DEFAULT_TAB_W;

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
      {/* Logo/menu */}
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
      <div
        ref={stripRef}
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          position: "relative",
          ["--tabWidth"]: `${computed}px`,
        }}
      >
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
          .chrome-tabs {
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-end;
            height: 100%;
          }

          /* Tabs: fixed equal width */
          .chrome-tabs .chrome-tab {
            flex: 0 0 var(--tabWidth) !important;
            max-width: var(--tabWidth) !important;
            min-width: var(--tabWidth) !important;
            height: 100%;
            margin-right: -10px;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 100%, 0% 100%);
            box-sizing: border-box;
          }

          /* Title centered properly */
          .chrome-tabs .chrome-tab .chrome-tab-title {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            height: 100%;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0 6px;
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

          /* Close button hover */
          .chrome-tabs .chrome-tab .chrome-tab-close {
            width: 14px;
            height: 14px;
            opacity: 0;
            transition: opacity .2s ease;
            border-radius: 50%;
            margin-left: 4px;
          }
          .chrome-tabs .chrome-tab:hover .chrome-tab-close {
            opacity: 1;
          }
          .chrome-tabs .chrome-tab .chrome-tab-close svg {
            width: 10px; height: 10px;
          }

          /* Active tab highlight */
          .chrome-tabs .chrome-tab.chrome-tab-active {
            background: #fff;
            border-bottom: 2px solid #2BD3C6;
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
