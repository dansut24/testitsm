// NavbarTabs.js
import React, { useRef, useState } from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";

import { routeLabels } from "./Layout";

const REMOTE_FAVICONS = [
  "https://www.google.com/favicon.ico",
  "https://static.xx.fbcdn.net/rsrc.php/yo/r/iRmz9lCMBD2.ico",
  "https://www.bing.com/sa/simg/favicon-2x.ico",
  "https://github.githubassets.com/favicons/favicon.png",
];

const NAVBAR_HEIGHT = 48;

const styles = `
  .navbar-container {
    width: 100%;
    position: relative;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    height: ${NAVBAR_HEIGHT}px;
  }

  .chrome-tabs-bottom-bar { display: none !important; }

  .ctn-bar { flex:1; display:flex; align-items:center; height:100%; }
  .ctn-scroll { flex:1; overflow-x:auto; overflow-y:hidden; }
  .chrome-tabs { height:100%; }
  .chrome-tab { height:100%; }

  .navbar-icons {
    position:absolute;
    right:8px;
    top:0;
    bottom:0;
    display:flex;
    align-items:center;
    gap:12px;
    padding:0 8px;
  }

  .navbar-logo {
    position:absolute;
    left:8px;
    top:0;
    bottom:0;
    display:flex;
    align-items:center;
    padding:0 8px;
    cursor: pointer;
    z-index:10;
  }

  /* Sidebar style */
  .sidebar {
    position: fixed;
    top: ${NAVBAR_HEIGHT}px;
    left: 0;
    bottom: 0;
    background: #fff;
    border-right: 1px solid #ddd;
    overflow-y: auto;
    transition: width 0.3s ease;
  }
  .sidebar.collapsed { width: 48px; }
  .sidebar.expanded { width: 260px; }

  .sidebar .nav-item {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    border-bottom: 1px solid #eee;
  }
  .sidebar .nav-item:hover { background: #f0f0f0; }
  .sidebar .label {
    margin-left: 8px;
    white-space: nowrap;
  }
  .sidebar.collapsed .label { display:none; }
`;

let nextId = 1;

export default function NavbarTabs({
  tabs,
  tabIndex,
  handleTabChange,
  handleTabClose,
  handleTabReorder,
  isMobile,
  sidebarPinned,
  setSidebarPinned,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  activateOrAddTab,
}) {
  const [darkMode] = useState(false);
  const scrollRef = useRef(null);

  const addTab = (
    title = `New Tab ${++nextId}`,
    favicon = REMOTE_FAVICONS[nextId % REMOTE_FAVICONS.length]
  ) => {
    // not directly linked to routes
    activateOrAddTab(title, `/custom-${nextId}`);
  };

  const onTabActive = (id) => {};
  const onTabClose = (id) => handleTabClose(id);

  return (
    <>
      <style>{styles}</style>
      <div className="navbar-container">
        {/* Left Logo toggles sidebar */}
        <div
          className="navbar-logo"
          onClick={() => (isMobile ? setMobileSidebarOpen(true) : setSidebarPinned(!sidebarPinned))}
        >
          <MenuIcon />
        </div>

        {/* Tabs */}
        <div className="ctn-bar">
          <div ref={scrollRef} className="ctn-scroll">
            <Tabs
              darkMode={darkMode}
              onTabClose={onTabClose}
              onTabActive={(id) => handleTabChange(null, tabs.findIndex((t) => t.path === id), id)}
              tabs={tabs.map((t, i) => ({
                id: t.path,
                title: t.label,
                active: i === tabIndex,
                favicon: REMOTE_FAVICONS[i % REMOTE_FAVICONS.length],
              }))}
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="navbar-icons">
          <AddIcon onClick={() => addTab()} style={{ cursor: "pointer" }} />
          {!isMobile && (
            <>
              <SearchIcon style={{ cursor: "pointer" }} />
              <NotificationsIcon style={{ cursor: "pointer" }} />
              <AccountCircleIcon style={{ cursor: "pointer" }} />
            </>
          )}
        </div>
      </div>

      {/* Sidebar */}
      {!isMobile && (
        <div className={`sidebar ${sidebarPinned ? "expanded" : "collapsed"}`}>
          {Object.entries(routeLabels).map(([path, label]) => (
            <div key={path} className="nav-item" onClick={() => activateOrAddTab(label, path)}>
              <span className="icon">📌</span>
              <span className="label">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      {isMobile && mobileSidebarOpen && (
        <div
          className="sidebar expanded"
          style={{ zIndex: 2000 }}
          onClick={() => setMobileSidebarOpen(false)}
        >
          {Object.entries(routeLabels).map(([path, label]) => (
            <div key={path} className="nav-item" onClick={() => activateOrAddTab(label, path)}>
              <span className="icon">📌</span>
              <span className="label">{label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
