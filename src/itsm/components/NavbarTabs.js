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

  .ctn-bar {
    display:flex; align-items:center; width:100%;
    position:relative; background:transparent !important; height:100%;
  }
  .ctn-scroll {
    flex:1; overflow-x:auto; overflow-y:hidden;
    background:transparent !important; height:100%;
  }
  .ctn-scroll::-webkit-scrollbar { height:6px; }

  .chrome-tabs { background:transparent !important; height:100%; }
  .chrome-tab { background:transparent !important; height:100%; }

  .navbar-icons {
    position:absolute; right:8px; top:0; bottom:0;
    display:flex; align-items:center; gap:12px; padding:0 8px;
    pointer-events:auto; z-index:5; background:#f8f9fa;
  }

  .navbar-logo {
    position:absolute; left:8px; top:0; bottom:0;
    display:flex; align-items:center; padding:0 8px;
    z-index:6; background:#f8f9fa;
  }

  /* Leave room for logo and right icons on desktop */
  .ctn-scroll { padding-right:160px; padding-left:60px; }

  /* MOBILE TABS: fill width */
  .mobile-tabs {
    display:none;
  }

  @media (max-width: 600px) {
    /* Hide desktop tab strip on mobile */
    .desktop-tabs-wrap { display: none; }

    /* Show mobile strip */
    .mobile-tabs {
      display:flex;
      align-items:stretch;
      height:100%;
      width:100%;
      padding-left:56px;   /* space for logo */
      padding-right:56px;  /* space for + icon */
      box-sizing:border-box;
      gap:0;
      overflow:hidden; /* no horizontal scrolling; tabs flex to fit */
    }

    .mobile-tab {
      flex: 1 1 0;
      min-width: 0;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:6px;
      padding: 0 8px;
      border: 0;
      background: transparent;
      height: 100%;
      cursor: pointer;
      position: relative;
    }

    .mobile-tab--active {
      background: #ffffff;
      border-bottom: 2px solid #2BD3C6;
    }

    .mobile-tab-favicon {
      width: 14px; height: 14px; flex: 0 0 14px;
    }

    .mobile-tab-title {
      font-size: 12px;
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .mobile-tab-close {
      position:absolute;
      right:6px;
      top:50%;
      transform: translateY(-50%);
      font-size: 12px;
      opacity: 0.7;
      border: none;
      background: transparent;
      cursor: pointer;
    }

    /* On mobile the right icons show only the + button, handled in JSX */
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
    setTabs(prev => [
      ...prev.map(t => ({ ...t, active: false })),
      { id: newId, title, favicon, active: true },
    ]);
    // desktop: make sure the new tab is visible
    if (!isMobile) {
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (!el) return;
        const newTab = el.querySelector(".chrome-tab.chrome-tab-active");
        scrollElementIntoView(newTab, { inline: "center" });
      });
    }
  };

  const setActive = (id) => {
    setTabs(prev => prev.map(t => ({ ...t, active: t.id === id })));
    if (!isMobile) {
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (!el) return;
        const activeTab = el.querySelector(".chrome-tab.chrome-tab-active");
        if (activeTab) scrollElementIntoView(activeTab, { inline: "center" });
      });
    }
  };

  const onTabActive = (id) => setActive(id);

  const onTabClose = (id) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      const filtered = prev.filter(t => t.id !== id);
      if (prev[idx]?.active && filtered.length) {
        const neighbor = filtered[Math.max(0, idx - 1)];
        return filtered.map(t => ({ ...t, active: t.id === neighbor.id }));
      }
      return filtered;
    });
  };

  // Mobile close handler to stop parent click (activation) when pressing X
  const onMobileClose = (e, id) => {
    e.stopPropagation();
    onTabClose(id);
  };

  // Render helpers
  const renderDesktopTabs = () => (
    <div className="desktop-tabs-wrap" style={{ flex: 1 }}>
      <div ref={scrollRef} className="ctn-scroll">
        <Tabs
          darkMode={darkMode}
          onTabClose={onTabClose}
          onTabActive={onTabActive}
          tabs={tabs}
        />
      </div>
    </div>
  );

  const renderMobileTabs = () => (
    <div className="mobile-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`mobile-tab${tab.active ? " mobile-tab--active" : ""}`}
          onClick={() => setActive(tab.id)}
          title={tab.title}
        >
          {tab.favicon && (
            <img className="mobile-tab-favicon" src={tab.favicon} alt="" />
          )}
          <span className="mobile-tab-title">{tab.title}</span>
          {/* show close unless explicitly hidden */}
          {tab.isCloseIconVisible !== false && (
            <span
              className="mobile-tab-close"
              onClick={(e) => onMobileClose(e, tab.id)}
              aria-label="Close tab"
            >
              ×
            </span>
          )}
        </button>
      ))}
    </div>
  );

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

        {/* Tabs: desktop uses library; mobile uses equal-width custom strip */}
        <div className={"ctn-bar" + (darkMode ? " dark" : "")} style={{ flex: 1 }}>
          {isMobile ? renderMobileTabs() : renderDesktopTabs()}
        </div>

        {/* Right Icons */}
        <div className="navbar-icons">
          <AddIcon
            onClick={() => addTab()}
            style={{ cursor: "pointer", fontSize: 28, fontWeight: "bold" }}
          />
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
