// NavbarTabs.js (Halo-style implementation)
import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";

const NAVBAR_HEIGHT = 44; // a bit taller like in your snippet

const NavbarTabs = ({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  isMobile = false,
  onLogoClick = () => {},
}) => {
  // Ensure Dashboard is pinned
  const ensuredTabs = [
    { label: "Dashboard", path: "/dashboard", pinned: true },
    ...tabs.filter((t) => t.path !== "/dashboard"),
  ];

  return (
    <div
      className="halo-nav"
      style={{
        display: "flex",
        alignItems: "center",
        height: NAVBAR_HEIGHT,
        borderBottom: "1px solid rgba(0,0,0,0.15)",
        backgroundColor: "#f8f9fa",
        padding: "0 8px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1500,
      }}
    >
      {/* Left Menu Button */}
      <button
        type="button"
        title="Menu"
        aria-label="Menu"
        onClick={isMobile ? onLogoClick : undefined}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          marginRight: 12,
        }}
      >
        <MenuIcon />
      </button>

      {/* Tabs strip */}
      <div
        className="tab-container"
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          height: "100%",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {ensuredTabs.map((tab, index) => (
          <div
            key={tab.path || index}
            onClick={() => handleTabChange(null, index, tab.path)}
            className={`tab ${index === tabIndex ? "tabactive" : ""}`}
            style={{
              flex: "1 1 0",
              minWidth: 80,
              maxWidth: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 12px",
              height: "100%",
              cursor: "pointer",
              backgroundColor: index === tabIndex ? "#fff" : "transparent",
              borderTop: index === tabIndex
                ? "2px solid #2BD3C6"
                : "2px solid transparent",
              borderLeft: "1px solid rgba(0,0,0,0.1)",
              borderRight: "1px solid rgba(0,0,0,0.1)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: tab.pinned ? "bold" : "normal",
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
                style={{ marginLeft: 6, cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClose(tab.path);
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* New Tab button */}
      <button
        type="button"
        title="New Tab"
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          marginLeft: 8,
          marginRight: 12,
        }}
        onClick={() => {
          const newId = Date.now();
          handleTabChange(null, ensuredTabs.length, `/new-tab/${newId}`);
        }}
      >
        <AddIcon />
      </button>

      {/* Right section (icons) */}
      {!isMobile && (
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
        </div>
      )}
    </div>
  );
};

export default NavbarTabs;
