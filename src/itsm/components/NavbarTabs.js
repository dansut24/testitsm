// NavbarTabs.js — deterministic tab widths (120px default, shrink-only), no scroll
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";

const NAVBAR_HEIGHT = 44;          // a touch taller, matches your Halo snippet nicely
const DEFAULT_TAB_W = 120;         // desired/tab width on desktop
const MIN_TAB_W = 56;              // how small we’re willing to go (keep labels readable)
const GAP_X = 4;                   // horizontal gap between tabs (px)
const PAD_X = 10;                  // left/right padding inside each tab

export default function NavbarTabs({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  isMobile = false,
  onLogoClick = () => {},
}) {
  // 1) Pin Dashboard at index 0, uncloseable
  const ensuredTabs = useMemo(
    () => [{ label: "Dashboard", path: "/dashboard", pinned: true }, ...tabs.filter(t => t.path !== "/dashboard")],
    [tabs]
  );

  // 2) Refs to measure available width for the tab strip only (NOT the icons)
  const stripRef = useRef(null);
  const [stripW, setStripW] = useState(0);

  // 3) Observe size of the tab strip
  useLayoutEffect(() => {
    if (!stripRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
      setStripW(Math.max(0, Math.floor(w)));
    });
    ro.observe(stripRef.current);
    return () => ro.disconnect();
  }, []);

  // Also recompute when tab count changes
  useEffect(() => {
    if (!stripRef.current) return;
    setStripW(stripRef.current.clientWidth);
  }, [ensuredTabs.length]);

  // 4) Compute the per-tab width: start at 120, shrink evenly to fit, never scroll
  const tabCount = ensuredTabs.length || 1;
  const totalGaps = GAP_X * Math.max(0, tabCount - 1);
  let computed = DEFAULT_TAB_W;

  if (stripW > 0) {
    // Available width minus inter-tab gaps, split across tabs
    const per = (stripW - totalGaps) / tabCount;
    // We cap between MIN_TAB_W and DEFAULT_TAB_W
    computed = Math.max(MIN_TAB_W, Math.min(DEFAULT_TAB_W, Math.floor(per)));
  }

  // Slight text scaling for very narrow tabs (keeps labels readable)
  const labelFontSize = computed <= 70 ? 11 : 13;

  // 5) Handlers
  const onNewTab = () => {
    const newId = Date.now();
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
      {/* Left Menu / Logo */}
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

      {/* Center: Tab strip we measure (only this area shrinks/expands) */}
      <div
        ref={stripRef}
        style={{
          flex: 1,
          minWidth: 0,            // critical: allows the strip to actually shrink
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: `${GAP_X}px`,
          overflow: "hidden",      // no scroll, ever
        }}
      >
        {ensuredTabs.map((tab, idx) => {
          const isActive = idx === tabIndex;
          return (
            <div
              key={tab.path || idx}
              onClick={() => handleTabChange(null, idx, tab.path)}
              style={{
                flex: "0 0 auto",                   // fixed-width cell
                width: `${computed}px`,             // <- deterministic width
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: `0 ${PAD_X}px`,
                borderRadius: "6px 6px 0 0",
                background: isActive ? "#fff" : "transparent",
                border: isActive ? "1px solid rgba(0,0,0,0.18)" : "1px solid transparent",
                borderBottom: isActive ? "2px solid #2BD3C6" : "2px solid transparent",
                cursor: "pointer",
                boxSizing: "border-box",
                transition: "background-color .15s ease, border-color .15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "rgba(0,0,0,0.05)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                style={{
                  fontSize: labelFontSize,
                  fontWeight: tab.pinned ? 600 : 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: `${NAVBAR_HEIGHT}px`,
                  paddingRight: tab.pinned ? 0 : 6,
                }}
                title={tab.label}
              >
                {tab.label}
              </span>

              {!tab.pinned && (
                <CloseIcon
                  fontSize="small"
                  style={{ opacity: 0.7 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTabClose(tab.path);
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Right section: + and icons (never shrinks, never overlapped) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0, // <- ensures the strip shrinks, not this section
          marginLeft: 8,
        }}
      >
        <AddIcon
          onClick={onNewTab}
          style={{ cursor: "pointer", color: "#444" }}
          titleAccess="New Tab"
        />
        {!isMobile && (
          <>
            <SearchIcon style={{ cursor: "pointer", color: "#444" }} titleAccess="Search" />
            <NotificationsIcon style={{ cursor: "pointer", color: "#444" }} titleAccess="Notifications" />
            <AccountCircleIcon style={{ cursor: "pointer", color: "#444" }} titleAccess="Profile" />
          </>
        )}
      </div>
    </div>
  );
}
