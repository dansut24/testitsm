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
        backgroundColor: "transparent",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginRight: 12,
          cursor: isMobile ? "pointer" : "default",
          height: "100%",
        }}
        onClick={isMobile ? onLogoClick : undefined}
      >
        <img src="/logo192.png" alt="Logo" style={{ height: 28 }} />
      </div>

      {/* Tabs */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          height: "100%",
          minWidth: 0,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {ensuredTabs.map((tab, index) => (
          <div
            key={tab.path || index}
            onClick={() => handleTabChange(null, index, tab.path)}
            style={{
              flex: "1 1 auto",
              minWidth: isMobile ? 70 : 120,
              maxWidth: isMobile ? 140 : 200,
              padding: "0 8px",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: index === tabIndex ? "2px solid #1976d2" : "2px solid transparent",
              fontSize: "13px",
              fontWeight: tab.pinned ? "bold" : "normal",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "pointer",
              backgroundColor: index === tabIndex ? "rgba(25,118,210,0.08)" : "transparent",
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
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

      {/* New Tab Button */}
      <AddIcon
        style={{ cursor: "pointer", marginRight: 12 }}
        onClick={() => {
          const newId = Date.now();
          handleTabChange(null, ensuredTabs.length, `/new-tab/${newId}`);
        }}
      />

      {/* Right-hand icons (desktop only) */}
      {!isMobile && (
        <div style={{ display: "flex", gap: 16, paddingRight: 12 }}>
          <SearchIcon style={{ cursor: "pointer" }} />
          <NotificationsIcon style={{ cursor: "pointer" }} />
          <AccountCircleIcon style={{ cursor: "pointer" }} />
        </div>
      )}
    </div>
  );
};

export default NavbarTabs;
