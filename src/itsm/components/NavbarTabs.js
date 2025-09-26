// NavbarTabs.js – Halo style with shrink + scroll fallback
import React, { useRef } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";

const NAVBAR_HEIGHT = 44;
const MIN_TAB_WIDTH = 90;
const MAX_TAB_WIDTH = 200;

const NavbarTabs = ({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  onLogoClick = () => {},
}) => {
  const tabStripRef = useRef(null);

  // Ensure Dashboard pinned
  const ensuredTabs = [
    { label: "Dashboard", path: "/dashboard", pinned: true },
    ...tabs.filter((t) => t.path !== "/dashboard"),
  ];

  return (
    <div
      className="nhd-nav"
      style={{
        display: "flex",
        alignItems: "center",
        height: NAVBAR_HEIGHT,
        borderBottom: "1px solid rgba(0,0,0,0.15)",
        backgroundColor: "#f8f9fa",
        padding: "0 6px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1500,
      }}
    >
      {/* Left menu button */}
      <button
        type="button"
        aria-label="Menu"
        onClick={onLogoClick}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          marginRight: 8,
        }}
      >
        <MenuIcon />
      </button>

      {/* Tab strip */}
      <div
        ref={tabStripRef}
        className="tab-container"
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          height: "100%",
          minWidth: 0,
          overflowX: "auto",
          scrollbarWidth: "thin",
        }}
      >
        {ensuredTabs.map((tab, index) => (
          <div
            key={tab.path || index}
            onClick={() => handleTabChange(null, index, tab.path)}
            className={`tab ${index === tabIndex ? "tabactive" : ""}`}
            style={{
              flex: "1 1 auto",
              minWidth: MIN_TAB_WIDTH,
              maxWidth: MAX_TAB_WIDTH,
              padding: "0 12px",
              marginRight: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              backgroundColor: index === tabIndex ? "#fff" : "transparent",
              border: "1px solid rgba(0,0,0,0.1)",
              borderBottom:
                index === tabIndex ? "2px solid #2BD3C6" : "2px solid transparent",
              fontWeight: tab.pinned ? "bold" : "normal",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              borderRadius: "6px 6px 0 0",
            }}
          >
            <span
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {tab.label}
            </span>
            {!tab.pinned && (
              <CloseIcon
                fontSize="small"
                style={{ marginLeft: 6, cursor: "pointer", opacity: 0.7 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClose(tab.path);
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* New tab button */}
      <button
        type="button"
        aria-label="New Tab"
        onClick={() => {
          const newId = Date.now();
          handleTabChange(null, ensuredTabs.length, `/new-tab/${newId}`);
        }}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          margin: "0 8px",
        }}
      >
        <AddIcon />
      </button>

      {/* Right icons */}
      <div
        className="nhd-nav-rightAlign"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <SearchIcon style={{ cursor: "pointer" }} />
        <NotificationsIcon style={{ cursor: "pointer" }} />
        <AccountCircleIcon style={{ cursor: "pointer" }} />
        <button
          className="nhd-button glow-btn"
          style={{
            backgroundColor: "#2BD3C6",
            border: "none",
            borderRadius: 4,
            padding: "6px 12px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          + New Ticket
        </button>
      </div>
    </div>
  );
};

export default NavbarTabs;
