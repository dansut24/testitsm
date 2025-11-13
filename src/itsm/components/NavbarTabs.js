// NavbarTabs.js
import React, { useRef } from "react";
import { useTheme } from "@mui/material/styles";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function NavbarTabs({
  tabs,
  tabIndex,
  handleTabChange,
  handleTabClose,
  handleTabReorder,
  isMobile,
  navTrigger,
}) {
  const theme = useTheme();
  const scrollRef = useRef(null);

  const styles = `
    .navbar-container {
      width: 100%;
      position: relative;
      background: ${theme.palette.background.paper};
      display: flex;
      align-items: stretch;
      height: 40px;
      box-shadow: inset 0 -1px 0 ${theme.palette.divider};
      z-index: 1;
    }

    .chrome-tabs-bottom-bar {
      display: none !important;
    }

    .ctn-bar {
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .nav-trigger-wrap {
      display: flex;
      align-items: center;
      padding: 0 8px;
      border-right: 1px solid ${theme.palette.divider};
      flex-shrink: 0;
    }

    .ctn-scroll {
      flex: 1;
      min-width: 0;
      overflow-x: auto;
      overflow-y: hidden;
      height: 100%;
    }

    .ctn-scroll::-webkit-scrollbar {
      height: 4px;
    }

    .ctn-scroll::-webkit-scrollbar-thumb {
      border-radius: 999px;
    }

    .chrome-tabs {
      background: transparent !important;
      height: 100%;
    }

    .chrome-tab {
      background: transparent !important;
      height: 40px !important;
      margin-top: 0 !important;
      box-shadow: none !important;
      border-top: none !important;
      font-size: 13px;
    }

    .chrome-tab.chrome-tab-active .chrome-tab-title {
      font-weight: 600;
    }

    .chrome-tab-divider {
      top: 6px !important;
      bottom: 6px !important;
      opacity: 0.6;
    }

    .chrome-tab-background::before,
    .chrome-tab-background::after {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }

    .navbar-icons {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 8px;
      border-left: 1px solid ${theme.palette.divider};
      flex-shrink: 0;
      background: linear-gradient(
        to right,
        ${theme.palette.background.paper},
        ${theme.palette.background.default}
      );
    }

    .navbar-icons svg {
      font-size: 20px;
    }

    .navbar-icons .add-tab-icon {
      font-size: 24px;
    }

    .navbar-icons-icon {
      cursor: pointer;
      transition: transform 0.12s ease, opacity 0.12s ease;
      opacity: 0.9;
    }

    .navbar-icons-icon:hover {
      transform: translateY(-1px);
      opacity: 1;
    }

    @media (max-width: 600px) {
      .navbar-container {
        height: 40px;
      }

      .ctn-scroll {
        overflow-x: hidden;
      }

      .chrome-tabs {
        display: flex !important;
        flex: 1;
      }

      .chrome-tab {
        flex: 1 1 auto !important;
        max-width: none !important;
      }

      .chrome-tab-title {
        font-size: 11px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .navbar-icons {
        gap: 4px;
        padding-right: 6px;
      }
    }
  `;

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
        const container = scrollRef.current;
        if (!container) return;
        const activeTab = container.querySelector(".chrome-tab.chrome-tab-active");
        if (!activeTab) return;
        scrollElementIntoView(activeTab, { inline: "center" });
      });
    }
  };

  const onTabClose = (id) => {
    const tab = tabs.find((t) => t.id === id || t.path === id);
    if (tab) handleTabClose(tab.path);
  };

  const handleAddTab = () => {
    // Keep your existing API: use handleTabReorder as a generic "update tabs" handler
    const newTabs = [
      ...tabs,
      { label: "New Tab", path: `/new-tab/${tabs.length + 1}` },
    ];
    handleTabReorder(newTabs);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="navbar-container">
        {navTrigger && <div className="nav-trigger-wrap">{navTrigger}</div>}

        <div className="ctn-bar">
          <div ref={scrollRef} className="ctn-scroll">
            <Tabs
              darkMode={theme.palette.mode === "dark"}
              onTabClose={onTabClose}
              onTabActive={onTabActive}
              tabs={tabs.map((t, idx) => ({
                id: t.path,
                title: t.label,
                favicon: t.favicon || "https://www.google.com/favicon.ico",
                active: idx === tabIndex,
                isCloseIconVisible: idx !== 0,
              }))}
            />
          </div>

          {/* Right Icons */}
          <div className="navbar-icons">
            <AddIcon
              className="navbar-icons-icon add-tab-icon"
              onClick={handleAddTab}
            />
            {!isMobile && (
              <>
                <SearchIcon className="navbar-icons-icon" />
                <NotificationsIcon className="navbar-icons-icon" />
                <AccountCircleIcon className="navbar-icons-icon" />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
