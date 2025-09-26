// NavbarTabs.js
import React, { useRef, useState } from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

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
    border-bottom: 4px solid #ffffff;
  }

  .chrome-tabs-bottom-bar { display: none !important; }

  .ctn-bar { display:flex; align-items:center; width:100%; height:100%; }
  .ctn-scroll { flex:1; overflow-x:auto; overflow-y:hidden; height:100%; }
  .ctn-scroll::-webkit-scrollbar { height:6px; }

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
    background:#f8f9fa;
    z-index:5;
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
    background:#f8f9fa;
    z-index:6;
  }

  .ctn-scroll { padding-right:160px; padding-left:60px; }

  @media (max-width: 600px) {
    .ctn-bar { padding: 0 4px; }
    .ctn-scroll { -webkit-overflow-scrolling: touch; }
    .chrome-tab-title { font-size: 12px; max-width: 80px; overflow: hidden; text-overflow: ellipsis; }
  }
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
}) {
  const [darkMode] = useState(false);
  const scrollRef = useRef(null);

  const scrollElementIntoView = (el, opts = { inline: "center" }) => {
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", ...opts });
    }
  };

  const addTab = (
    title = `New Tab ${++nextId}`,
    favicon = REMOTE_FAVICONS[nextId % REMOTE_FAVICONS.length]
  ) => {
    const newId = `tab-${nextId}`;
    handleTabChange(null, tabs.length, `/${title.toLowerCase().replace(/\s+/g, "-")}`);
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const newTab = el.querySelector(".chrome-tab.chrome-tab-active");
      scrollElementIntoView(newTab, { inline: "center" });
    });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="navbar-container">
        {/* Left Logo toggles sidebar */}
        <div className="navbar-logo" onClick={() => setSidebarPinned(!sidebarPinned)}>
          <img
            src="https://www.bing.com/sa/simg/favicon-2x.ico"
            alt="Logo"
            style={{ width: 28, height: 28 }}
          />
        </div>

        {/* Tabs */}
        <div className={"ctn-bar" + (darkMode ? " dark" : "")} style={{ flex: 1 }}>
          <div ref={scrollRef} className="ctn-scroll">
            <Tabs
              darkMode={darkMode}
              onTabClose={handleTabClose}
              onTabReorder={handleTabReorder}
              onTabActive={(id) => {
                const index = tabs.findIndex((t) => t.id === id);
                if (index >= 0) handleTabChange(null, index, tabs[index].path);
              }}
              tabs={tabs.map((tab, idx) => ({
                id: tab.path,
                title: tab.label,
                active: idx === tabIndex,
                favicon: REMOTE_FAVICONS[idx % REMOTE_FAVICONS.length],
              }))}
            />
          </div>
        </div>

        {/* Right Icons (hide some on mobile) */}
        <div className="navbar-icons">
          <AddIcon
            onClick={() => addTab()}
            style={{ cursor: "pointer", fontSize: 28, fontWeight: "bold" }}
          />
          {!isMobile && <SearchIcon style={{ cursor: "pointer" }} />}
          {!isMobile && <NotificationsIcon style={{ cursor: "pointer" }} />}
          {!isMobile && <AccountCircleIcon style={{ cursor: "pointer" }} />}
        </div>
      </div>
    </>
  );
}
