// NavbarTabs.js
import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const NAVBAR_HEIGHT = 34;
const NAVBAR_PADDING_TOP = 6;

const NavbarTabs = ({
  tabs = [],
  tabIndex = 0,
  handleTabChange = () => {},
  handleTabClose = () => {},
  sidebarOpen = true,
  sidebarWidth = 240,
  collapsedWidth = 60,
  isMobile = false,
  onLogoClick = () => {},
}) => {
  // Ensure Dashboard is always the first tab
  const ensuredTabs = [
    { label: "Dashboard", path: "/dashboard", pinned: true },
    ...tabs.filter((t) => t.path !== "/dashboard"),
  ];

  const leftOffset = isMobile ? 0 : sidebarOpen ? sidebarWidth : collapsedWidth;
  const widthCalc = isMobile ? "100%" : `calc(100% - ${leftOffset}px)`;

  return (
    <div
      style={{
        position: "fixed",
        top: NAVBAR_PADDING_TOP,
        left: leftOffset,
        width: widthCalc,
        zIndex: 1500,
        height: NAVBAR_HEIGHT,
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f1f3f4", // Chrome-like background
        borderBottom: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginRight: 8,
          cursor: isMobile ? "pointer" : "default",
          height: "100%",
          padding: "0 6px",
        }}
        onClick={isMobile ? onLogoClick : undefined}
      >
        <img src="/logo192.png" alt="Logo" style={{ height: 24 }} />
      </div>

      {/* Tabs */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          height: "100%",
          minWidth: 0,
        }}
      >
        {ensuredTabs.map((tab, index) => (
          <div
            key={tab.path || index}
            onClick={() => handleTabChange(null, index, tab.path)}
            style={{
              flex: "1 1 0", // 🚀 all tabs share space equally
              minWidth: isMobile ? 60 : 90,
              maxWidth: isMobile ? 120 : 180,
              margin: "0 2px",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 8px",
              borderRadius: index === tabIndex ? "6px 6px 0 0" : "6px 6px 0 0",
              backgroundColor:
                index === tabIndex ? "#ffffff" : "transparent",
              border: index === tabIndex
                ? "1px solid rgba(0,0,0,0.2)"
                : "1px solid transparent",
              borderBottom: index === tabIndex ? "none" : "1px solid rgba(0,0,0,0.1)",
              fontSize: "13px",
              fontWeight: tab.pinned ? "bold" : "normal",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (index !== tabIndex) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)";
            }}
            onMouseLeave={(e) => {
              if (index !== tabIndex) e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                flex: 1,
              }}
            >
              {tab.label}
            </span>
            {!tab.pinned && (
              <CloseIcon
                fontSize="small"
                style={{
                  marginLeft: 6,
                  cursor: "pointer",
                  opacity: 0.6,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClose(tab.path);
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* New Tab Button */}
      <AddIcon
        style={{
          cursor: "pointer",
          marginRight: 12,
          color: "#444",
        }}
        onClick={() => {
          const newId = Date.now();
          handleTabChange(null, ensuredTabs.length, `/new-tab/${newId}`);
        }}
      />

      {/* Right-hand icons (desktop only) */}
      {!isMobile && (
        <div style={{ display: "flex", gap: 16, paddingRight: 12 }}>
          <SearchIcon style={{ cursor: "pointer", color: "#444" }} />
          <NotificationsIcon style={{ cursor: "pointer", color: "#444" }} />
          <AccountCircleIcon style={{ cursor: "pointer", color: "#444" }} />
        </div>
      )}
    </div>
  );
};

export default NavbarTabs;
