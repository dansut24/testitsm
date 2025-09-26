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
  }

  .navbar-container::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 4px;
    background: #ffffff;
    pointer-events: none;
    z-index: 999;
  }

  .chrome-tabs-bottom-bar { display: none !important; }

  .ctn-bar { display:flex; align-items:center; width:100%; position:relative; background:transparent !important; height:100%; }
  .ctn-scroll { flex:1; overflow-x:auto; overflow-y:hidden; background:transparent !important; height:100%; }
  .ctn-scroll::-webkit-scrollbar { height:6px; }

  .chrome-tabs { background:transparent !important; height:100%; }
  .chrome-tab { background:transparent !important; height:100%; }

  .navbar-icons {
    position:absolute;
    right:8px;
    top:0;
    bottom:0;
    display:flex;
    align-items:center;
    gap:12px;
    padding:0 8px;
    pointer-events:auto;
    z-index:5;
    background:#f8f9fa;
  }

  .navbar-logo {
    position:absolute;
    left:8px;
    top:0;
    bottom:0;
    display:flex;
    align-items:center;
    padding:0 8px;
    z-index:6;
    background:#f8f9fa;
    cursor: pointer;
  }

  .ctn-scroll { padding-right:160px; padding-left:60px; }

  .main-content {
    margin-top: ${NAVBAR_HEIGHT}px;
    padding: 20px;
  }

  @media (max-width: 600px) {
    .ctn-bar { padding: 0 4px; }
    .ctn-scroll { -webkit-overflow-scrolling: touch; }
    .chrome-tab-title { font-size: 12px; max-width: 80px; overflow: hidden; text-overflow: ellipsis; }
  }
`;

let nextId = 1;

export default function ChromeTabsNavbar({ onLogoClick }) {
  const [darkMode, setDarkMode] = useState(false);
  const [tabs, setTabs] = useState([
    { id: "t-welcome", title: "Welcome", active: true, favicon: REMOTE_FAVICONS[0] },
    { id: "t-docs", title: "Docs", favicon: REMOTE_FAVICONS[1] },
    { id: "t-pinned", title: "Pinned", isCloseIconVisible: false, favicon: REMOTE_FAVICONS[2] },
  ]);

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
    setTabs((prev) => [
      ...prev.map((t) => ({ ...t, active: false })),
      { id: newId, title, favicon, active: true },
    ]);
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const newTab = el.querySelector(".chrome-tab.chrome-tab-active");
      scrollElementIntoView(newTab, { inline: "center" });
    });
  };

  const onTabActive = (id) => {
    setTabs((prev) => prev.map((t) => ({ ...t, active: t.id === id })));
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const activeTab = el.querySelector(".chrome-tab.chrome-tab-active");
      if (activeTab) scrollElementIntoView(activeTab, { inline: "center" });
    });
  };

  const onTabClose = (id) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const filtered = prev.filter((t) => t.id !== id);
      if (prev[idx]?.active && filtered.length) {
        const neighbor = filtered[Math.max(0, idx - 1)];
        return filtered.map((t) => ({ ...t, active: t.id === neighbor.id }));
      }
      return filtered;
    });
  };

  const onTabReorder = (tabId, fromIndex, toIndex) => {
    setTabs((prev) => {
      const moving = prev.find((t) => t.id === tabId);
      if (!moving) return prev;
      const rest = prev.filter((t) => t.id !== tabId);
      const clampedTo = Math.max(0, Math.min(toIndex, rest.length));
      rest.splice(clampedTo, 0, moving);
      return rest;
    });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="navbar-container">
        {/* Left Logo (calls onLogoClick from Layout) */}
        <div className="navbar-logo" onClick={onLogoClick}>
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
              draggable
              onTabClose={onTabClose}
              onTabReorder={onTabReorder}
              onTabActive={onTabActive}
              tabs={tabs}
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="navbar-icons">
          <AddIcon
            onClick={() => addTab()}
            style={{ cursor: "pointer", fontSize: 28, fontWeight: "bold" }}
          />
          <SearchIcon style={{ cursor: "pointer" }} />
          <NotificationsIcon style={{ cursor: "pointer" }} />
          <AccountCircleIcon style={{ cursor: "pointer" }} />
        </div>
      </div>
    </>
  );
}
