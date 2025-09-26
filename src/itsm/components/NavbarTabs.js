// NavbarTabs.js
import React, { useRef, useState } from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const styles = `
  .navbar-container {
    width: 100%;
    position: relative;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    height: 48px;
  }

  .navbar-container::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 8px; /* cuts into curve */
    background: #ffffff;
    pointer-events: none;
    z-index: 9999;
  }

  .chrome-tabs-bottom-bar { display: none !important; }

  .ctn-bar { display:flex; align-items:center; width:100%; position:relative; height:100%; }
  .ctn-scroll { flex:1; overflow-x:auto; overflow-y:hidden; height:100%; }
  .ctn-scroll::-webkit-scrollbar { height:6px; }

  .chrome-tabs { background:transparent !important; height:100%; }
  .chrome-tab { 
    background:transparent !important; 
    height:48px !important;
    margin-top:0 !important; 
    box-shadow:none !important; 
    border-top:none !important;
  }

  /* Tab dividers: shorten them so they don’t clash with underline */
  .chrome-tab-divider {
    top: 4px !important;   /* move divider down slightly */
    bottom: 4px !important; /* make it shorter */
    opacity: 0.6;          /* optional: soften it a bit */
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
    z-index:5;
    background:#f8f9fa;
  }

  .ctn-scroll { padding-right:160px; }

  @media (max-width: 600px) {
    .ctn-scroll { 
      overflow-x:hidden; 
      padding-right:60px; 
      display:flex; 
      justify-content:space-between; 
    }

    .chrome-tabs { display:flex !important; flex:1; }
    .chrome-tab { flex:1 1 auto !important; max-width:none !important; }
    .chrome-tab-title { font-size: 12px; text-align:center; overflow:hidden; text-overflow:ellipsis; }
  }
`;

export default function NavbarTabs({
  tabs,
  tabIndex,
  handleTabChange,
  handleTabClose,
  handleTabReorder,
  isMobile,
}) {
  const scrollRef = useRef(null);

  const scrollElementIntoView = (el, opts = { inline: "center" }) => {
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", ...opts });
    }
  };

  const onTabActive = (id) => {
    const idx = tabs.findIndex((t) => t.id === id || t.path === id);
    if (idx >= 0) {
      handleTabChange(null, idx, tabs[idx].path);
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (!el) return;
        const activeTab = el.querySelector(".chrome-tab.chrome-tab-active");
        scrollElementIntoView(activeTab, { inline: "center" });
      });
    }
  };

  const onTabClose = (id) => {
    const tab = tabs.find((t) => t.id === id || t.path === id);
    if (tab) {
      handleTabClose(tab.path);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="navbar-container">
        {/* Tabs */}
        <div className="ctn-bar" style={{ flex: 1 }}>
          <div ref={scrollRef} className="ctn-scroll">
            <Tabs
              darkMode={false}
              onTabClose={onTabClose}
              onTabActive={onTabActive}
              tabs={tabs.map((t, idx) => ({
                id: t.path,
                title: t.label,
                favicon: t.favicon || "https://www.google.com/favicon.ico",
                active: idx === tabIndex,
                isCloseIconVisible: idx !== 0, // prevent closing first tab
              }))}
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="navbar-icons">
          <AddIcon
            onClick={() => handleTabReorder([...tabs, { label: "New Tab", path: `/tab-${tabs.length + 1}` }])}
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
