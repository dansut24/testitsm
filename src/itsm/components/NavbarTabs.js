import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";

const NAVBAR_HEIGHT = 44;
const DEFAULT_TAB_W = 120;
const GAP_X = 0; // no gap, flicks handle spacing
const PAD_X = 8;

export default function NavbarTabs({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  isMobile = false,
  onLogoClick = () => {},
}) {
  const ensuredTabs = useMemo(
    () => [{ label: "Dashboard", path: "/dashboard", pinned: true, favicon: "📊" }, ...tabs.filter(t => t.path !== "/dashboard")],
    [tabs]
  );

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
  }, [ensuredTabs.length]);

  const tabCount = ensuredTabs.length || 1;
  const totalGaps = GAP_X * Math.max(0, tabCount - 1);
  let computed = DEFAULT_TAB_W;
  if (stripW > 0) {
    const maxPossible = (stripW - totalGaps) / tabCount;
    if (maxPossible < DEFAULT_TAB_W) {
      computed = Math.floor(maxPossible);
    }
  }
  if (tabCount === 1) computed = DEFAULT_TAB_W;

  const labelFontSize = computed < 70 ? 10 : 12;

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
      {/* Left menu */}
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
        }}
      >
        {ensuredTabs.map((tab, idx) => {
          const isActive = idx === tabIndex;
          return (
            <div
              key={tab.path || idx}
              onClick={() => handleTabChange(null, idx, tab.path)}
              style={{
                flex: "0 0 auto",
                width: `${computed}px`,
                height: "90%", // a bit shorter for flick illusion
                marginRight: "-12px", // overlap for angled edges
                padding: `0 ${PAD_X}px`,
                background: isActive ? "#fff" : "#e9ecef",
                border: "1px solid rgba(0,0,0,0.2)",
                borderBottom: isActive ? "2px solid #2BD3C6" : "1px solid rgba(0,0,0,0.2)",
                borderRadius: "8px 8px 0 0",
                clipPath:
                  "polygon(12px 0, calc(100% - 12px) 0, 100% 100%, 0% 100%)", // angled flicks
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxSizing: "border-box",
                cursor: "pointer",
                transition: "background 0.15s ease",
                zIndex: isActive ? 2 : 1,
              }}
            >
              {/* Favicon + label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  overflow: "hidden",
                }}
              >
                <span style={{ fontSize: 14 }}>{tab.favicon || "📄"}</span>
                <span
                  style={{
                    fontSize: labelFontSize,
                    fontWeight: tab.pinned ? 600 : 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={tab.label}
                >
                  {tab.label}
                </span>
              </div>

              {/* Close icon */}
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
