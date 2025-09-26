// src/itsm/components/NavbarTabs.js
import React, { useEffect, useState, useRef } from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const NAVBAR_HEIGHT = 44;
const DEFAULT_TAB_W = 120;
const MIN_TAB_W = 60;

export default function NavbarTabs({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  isMobile = false,
  onLogoClick = () => {},
}) {
  // Force a pinned Dashboard tab at the front
  const ensuredTabs = [
    { id: "dashboard", title: "Dashboard", favicon: "📊", pinned: true },
    ...tabs.filter((t) => t.id !== "dashboard"),
  ];

  const [stripW, setStripW] = useState(0);
  const stripRef = useRef(null);

  useEffect(() => {
    if (!stripRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
      setStripW(Math.max(0, Math.floor(w)));
    });
    ro.observe(stripRef.current);
    return () => ro.disconnect();
  }, []);

  // Dynamic tab width calc
  const tabCount = ensuredTabs.length || 1;
  const computed =
    stripW > 0 ? Math.max(MIN_TAB_W, Math.floor(stripW / tabCount)) : DEFAULT_TAB_W;

  // Add new tab
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

      {/* Chrome Tabs container */}
      <div
        ref={stripRef}
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <Tabs
          tabs={ensuredTabs.map((t, idx) => ({
            id: t.id,
            title: t.title,
            favicon: t.favicon,
            active: idx === tabIndex,
            // Our custom render per tab
            render: ({ tab, onClose }) => (
              <div
                title={tab.title} // tooltip on hover
                style={{
                  flex: "0 0 auto",
                  width: `${computed}px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 8px",
                  cursor: "pointer",
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  background: tab.active ? "#fff" : "#e5e7eb",
                  border: "1px solid rgba(0,0,0,0.2)",
                  borderBottom: tab.active
                    ? "2px solid #2BD3C6"
                    : "1px solid rgba(0,0,0,0.15)",
                  clipPath:
                    "polygon(10px 0, calc(100% - 10px) 0, 100% 100%, 0% 100%)",
                  fontSize: computed < 70 ? 10 : 12,
                  position: "relative",
                }}
                onClick={() => handleTabChange(null, idx, t.path || t.id)}
              >
                <span style={{ marginRight: 6 }}>{tab.favicon || "📄"}</span>
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.title}
                </span>
                {!t.pinned && (
                  <span
                    className="tab-close-btn"
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 16,
                      height: 16,
                      marginLeft: 4,
                      borderRadius: "50%",
                      cursor: "pointer",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose?.();
                      handleTabClose(t.path || t.id);
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "1")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.opacity = "0")
                    }
                  >
                    <CloseIcon style={{ fontSize: 12 }} />
                  </span>
                )}
              </div>
            ),
          }))}
          onTabClose={(tab) => handleTabClose(tab.id)}
          onTabSelect={(tab) =>
            handleTabChange(null, ensuredTabs.findIndex((t) => t.id === tab.id), tab.id)
          }
          onTabAdd={onNewTab}
        />
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
