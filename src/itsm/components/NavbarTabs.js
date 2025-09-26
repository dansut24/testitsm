// src/itsm/components/NavbarTabs.js
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css"; // required base styles
// Optional dark theme:
// import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";

import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const NAVBAR_HEIGHT = 44;
const DEFAULT_TAB_W = 120;
const SAFE_ICON_SPACE = 24; // space to ensure favicon always visible
const PAD_X = 8;

export default function NavbarTabs({
  // Expect your app-level tabs as [{ id, path, label, faviconUrl?, pinned? }, ...]
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  handleTabReorder = () => {},
  isMobile = false,
  onLogoClick = () => {},
}) {
  // 1) Ensure a pinned Dashboard tab at the front
  const ensuredTabs = useMemo(() => {
    const rest = tabs.filter((t) => t.path !== "/dashboard" && t.id !== "dashboard");
    return [
      {
        id: "dashboard",
        path: "/dashboard",
        label: "Dashboard",
        pinned: true,
        faviconUrl: "/favicon.ico", // make sure this is a valid URL
      },
      ...rest,
    ];
  }, [tabs]);

  // 2) Compute which tab is active safely
  const safeActiveIndex =
    tabIndex >= 0 && tabIndex < ensuredTabs.length ? tabIndex : 0;

  // 3) Map to sinm TabProperties (IMPORTANT: favicon must be an image URL)
  const sinmTabs = ensuredTabs.map((t, i) => ({
    id: t.id || t.path || `tab-${i}`,
    title: t.label || t.title || "Untitled",
    favicon: t.faviconUrl || "/favicon.ico",
    active: i === safeActiveIndex,
  }));

  // 4) Measure the center strip (between menu and right icons) to size tabs
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

  // 5) Deterministic width per tab (no overlap with right icons, no scroll)
  const count = sinmTabs.length || 1;
  let computed = DEFAULT_TAB_W;
  if (stripW > 0) {
    computed = Math.floor((stripW - 0) / count);
    if (computed < SAFE_ICON_SPACE + 8) {
      computed = SAFE_ICON_SPACE + 8; // keep favicon space
    }
  }
  if (count === 1) computed = DEFAULT_TAB_W; // no full-width single tab

  const labelFontSize = computed < 70 ? 10 : 12;
  const ultraTight = computed <= SAFE_ICON_SPACE + 30; // hide text at tiny widths

  const onNewTab = () => {
    const newId = Date.now().toString();
    // You likely push a new tab in your parent state; we just signal selection target:
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
      {/* Left menu / logo */}
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

      {/* Tab strip (center) */}
      <div
        ref={stripRef}
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
          // Expose sizing + states as CSS vars/classes for styling below
          ["--tabWidth"]: `${computed}px`,
          ["--tabFontSize"]: `${labelFontSize}px`,
          position: "relative",
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
            // prevent closing pinned dashboard
            if (id === "dashboard") return;
            const idx = sinmTabs.findIndex((t) => t.id === id);
            const target = ensuredTabs[idx];
            handleTabClose(target?.path || id);
          }}
          onTabReorder={(from, to) => {
            handleTabReorder(from, to);
          }}
        />

        {/* Style overrides — kept local to this component */}
        <style>{`
          /* Fix widths deterministically */
          .chrome-tabs .chrome-tab {
            flex: 0 0 var(--tabWidth) !important;
            width: var(--tabWidth) !important;
            height: 88%;
            margin-right: -10px;              /* overlap for the flick illusion */
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            position: relative;
            clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 100%, 0% 100%);
            box-sizing: border-box;
          }
          .chrome-tabs .chrome-tab .chrome-tab-title {
            font-size: var(--tabFontSize);
            padding: 0 ${PAD_X}px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          /* Divider between tabs (inactive ones) */
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

          /* Hover-only, small close button */
          .chrome-tabs .chrome-tab .chrome-tab-close {
            width: 16px;
            height: 16px;
            opacity: 0;
            transition: opacity .2s ease, background .2s ease;
            border-radius: 50%;
            margin-right: ${PAD_X}px;
          }
          .chrome-tabs .chrome-tab:hover .chrome-tab-close { opacity: 1; }
          .chrome-tabs .chrome-tab .chrome-tab-close svg {
            width: 12px; height: 12px;
          }
          .chrome-tabs .chrome-tab .chrome-tab-close:hover {
            background: rgba(0,0,0,0.10);
          }

          /* Make active tab pop */
          .chrome-tabs .chrome-tab.chrome-tab-active {
            background: #fff;
            border-bottom: 2px solid #2BD3C6;
          }

          /* Hide titles when ultra tight, keep favicon visible */
          .tabs-ultratight .chrome-tabs .chrome-tab .chrome-tab-title {
            display: none;
          }

          /* Tooltips: mirror the title string on hover using native title attribute already set by the lib on the tab title node (fallback with attr) */
          .chrome-tabs .chrome-tab .chrome-tab-title[title] {
            /* native browser tooltip will show the full string */
          }
        `}</style>
      </div>

      {/* Right section (never shrinks) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
          marginLeft: 8,
        }}
      >
        <AddIcon onClick={onNewTab} style={{ cursor: "pointer" }} titleAccess="New Tab" />
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
