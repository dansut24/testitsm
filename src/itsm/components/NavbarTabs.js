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
    position: sticky;
    top: 0;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    height: ${NAVBAR_HEIGHT}px;
    z-index: 1200;
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

  .ctn-bar { display:flex; align-items:center; width:100%; position:relative; height:100%; }
  .ctn-scroll { flex:1; overflow-x:auto; overflow-y:hidden; height:100%; }
  .ctn-scroll::-webkit-scrollbar { height:6px; }

  .chrome-tabs {
    background:transparent !important;
    height:100%;
    display:flex !important;
    flex:1 1 auto !important;
    width:100% !important;
  }

  .chrome-tab {
    flex:1 1 auto !important;
    max-width:none !important;
    height:100%;
    transition:flex 0.2s ease;
  }

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
    z-index:6;
    background:#f8f9fa;
  }

  .ctn-scroll { padding-right:160px; padding-left:60px; }

  @media (max-width: 600px) {
    .ctn-bar { padding: 0 4px; }
    .ctn-scroll { -webkit-overflow-scrolling: touch; }
    .chrome-tab-title { font-size: 12px; max-width: 80px; overflow: hidden; text-overflow: ellipsis; }
  }
`;

let nextId = 1;

export default function ChromeTabsNavbar({ isMobile }) {
  const [darkMode] = useState(false);
  const [tabs, setTabs] = useState([
    { id: "t-welcome", title: "Welcome", active: true, favicon: REMOTE_FAVICONS[0] },
    { id: "t-docs", title: "Docs", favicon: REMOTE_FAVICONS[1] },
    { id: "t-pinned", title: "Pinned", isCloseIconVisible: false, favicon: REMOTE_FAVICONS[2] },
  ]);

  const scrollRef = useRef(null);

  const scrollElementIntoView = (el, opts = { inline: "center" }) => {
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", ...opts });
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
      if (newTab) scrollElementIntoView(newTab, { inline: "center" });
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

    // ✅ Force instant resize/reflow
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="navbar-container">
        {/* Left Logo */}
        <div className="navbar-logo">
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
              onTabClose={onTabClose}
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
          {/* Only show these icons on desktop */}
          {!isMobile && (
            <>
              <SearchIcon style={{ cursor: "pointer" }} />
              <NotificationsIcon style={{ cursor: "pointer" }} />
              <AccountCircleIcon style={{ cursor: "pointer" }} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
