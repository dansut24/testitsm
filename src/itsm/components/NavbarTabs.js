import React, { useRef, useState } from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import HelpIcon from "@mui/icons-material/Help";
import { Tooltip } from "@mui/material";

const REMOTE_FAVICONS = [
  "https://www.google.com/favicon.ico",
  "https://static.xx.fbcdn.net/rsrc.php/yo/r/iRmz9lCMBD2.ico",
  "https://www.bing.com/sa/simg/favicon-2x.ico",
  "https://github.githubassets.com/favicons/favicon.png",
];

const NAVBAR_HEIGHT = 48;
const COLLAPSED_WIDTH = 48;
const EXPANDED_WIDTH = 260;

const styles = `
  .navbar-wrapper {
    display: flex;
    width: 100%;
    height: ${NAVBAR_HEIGHT}px;
    border-bottom: 1px solid #ddd;
    background: #f8f9fa;
  }

  .navbar-left {
    display: flex;
    flex-direction: column;
    width: var(--sidebar-width);
    background: #f8f9fa;
    border-right: 1px solid #ddd;
    transition: width 0.3s ease;
    height: 100vh; /* full vertical */
  }

  .navbar-logo {
    height: ${NAVBAR_HEIGHT}px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
  }

  .navbar-menu {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-top: 8px;
  }

  .navbar-menu-item {
    display: flex;
    align-items: center;
    padding: 8px;
    cursor: pointer;
  }
  .navbar-menu-item:hover {
    background: #eee;
  }

  .navbar-right {
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;
  }

  .ctn-bar { flex: 1; display: flex; align-items: center; height:100%; }
  .ctn-scroll { flex: 1; overflow-x: auto; }
  .chrome-tabs { background: transparent !important; height:100%; }
  .chrome-tab { background: transparent !important; height:100%; }

  .navbar-icons {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 8px;
  }
`;

let nextId = 1;

export default function NavbarTabs({ tabs, tabIndex, handleTabChange, handleTabClose, handleTabReorder }) {
  const [darkMode] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const scrollRef = useRef(null);

  const addTab = (title = `New Tab ${++nextId}`, favicon = REMOTE_FAVICONS[nextId % REMOTE_FAVICONS.length]) => {
    // call handler from Layout
    handleTabChange(null, tabs.length, `/${title.toLowerCase()}`);
  };

  const onMenuClick = (label) => {
    handleTabChange(null, tabs.length, `/${label.toLowerCase()}`);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="navbar-wrapper" style={{ "--sidebar-width": sidebarPinned ? `${EXPANDED_WIDTH}px` : `${COLLAPSED_WIDTH}px` }}>
        {/* Left vertical bar */}
        <div className="navbar-left">
          <div className="navbar-logo" onClick={() => setSidebarPinned(!sidebarPinned)}>
            <img src="https://www.bing.com/sa/simg/favicon-2x.ico" alt="Logo" style={{ width: 28, height: 28 }} />
          </div>
          <div className="navbar-menu">
            <Tooltip title="Dashboard" placement="right" disableHoverListener={sidebarPinned}>
              <div className="navbar-menu-item" onClick={() => onMenuClick("Dashboard")}>
                <DashboardIcon fontSize="small" /> {sidebarPinned && <span>Dashboard</span>}
              </div>
            </Tooltip>
            <Tooltip title="Profile" placement="right" disableHoverListener={sidebarPinned}>
              <div className="navbar-menu-item" onClick={() => onMenuClick("Profile")}>
                <PersonIcon fontSize="small" /> {sidebarPinned && <span>Profile</span>}
              </div>
            </Tooltip>
            <Tooltip title="Settings" placement="right" disableHoverListener={sidebarPinned}>
              <div className="navbar-menu-item" onClick={() => onMenuClick("Settings")}>
                <SettingsIcon fontSize="small" /> {sidebarPinned && <span>Settings</span>}
              </div>
            </Tooltip>
            <Tooltip title="Help" placement="right" disableHoverListener={sidebarPinned}>
              <div className="navbar-menu-item" onClick={() => onMenuClick("Help")}>
                <HelpIcon fontSize="small" /> {sidebarPinned && <span>Help</span>}
              </div>
            </Tooltip>
          </div>
        </div>

        {/* Right horizontal bar */}
        <div className="navbar-right">
          <div className={"ctn-bar" + (darkMode ? " dark" : "")}>
            <div ref={scrollRef} className="ctn-scroll">
              <Tabs
                darkMode={darkMode}
                tabs={tabs}
                onTabClose={handleTabClose}
                onTabActive={(id) => {
                  const idx = tabs.findIndex((t) => t.id === id);
                  if (idx !== -1) handleTabChange(null, idx, tabs[idx].path);
                }}
              />
            </div>
          </div>

          <div className="navbar-icons">
            <AddIcon onClick={() => addTab()} style={{ cursor: "pointer", fontSize: 24 }} />
            <SearchIcon style={{ cursor: "pointer" }} />
            <NotificationsIcon style={{ cursor: "pointer" }} />
            <AccountCircleIcon style={{ cursor: "pointer" }} />
          </div>
        </div>
      </div>
    </>
  );
}
