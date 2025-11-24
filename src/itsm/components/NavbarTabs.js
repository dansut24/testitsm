// NavbarTabs.js
import React, { useRef } from "react";
import { useTheme } from "@mui/material/styles";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";

import { Box, IconButton, useMediaQuery } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

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
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const scrollRef = useRef(null);

  const styles = `
    .navbar-container {
      width: 100%;
      max-width: 100%;
      position: relative;
      background: ${theme.palette.background.paper};
      display: flex;
      align-items: stretch;
      height: 40px;
      box-shadow: inset 0 -1px 0 ${theme.palette.divider};
      z-index: 1;
      overflow: hidden; /* keep this bar from widening the page */
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

    /* Middle: scrollable area that contains tabs + plus button */
    .ctn-scroll {
      flex: 1;
      min-width: 0;
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
    }

    .ctn-scroll::-webkit-scrollbar {
      height: 4px;
    }

    .ctn-scroll::-webkit-scrollbar-thumb {
      border-radius: 999px;
    }

    .ctn-inner {
      display: inline-flex;
      align-items: center;
      height: 100%;
    }

    .chrome-tabs {
      background: transparent !important;
      height: 100%;
      /* no min-width: let content define width and scroll inside .ctn-scroll */
    }

    .chrome-tab {
      background: transparent !important;
      height: 40px !important;
      margin-top: 0 !important;
      box-shadow: none !important;
      border-top: none !important;
      font-size: ${isXs ? 11 : 13}px;
      max-width: 200px;
    }

    .chrome-tab.chrome-tab-active .chrome-tab-title {
      font-weight: 600;
    }

    .chrome-tab-title {
      max-width: 130px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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

    /* Plus button styled to sit like Chrome's add button */
    .add-tab-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 0 4px 0 0;
      flex-shrink: 0;
    }

    .add-tab-btn {
      width: 24px;
      height: 24px;
      border-radius: 999px;
      border: 1px solid ${theme.palette.divider};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.9;
      transition: background 0.12s ease, opacity 0.12s ease, transform 0.12s ease;
    }

    .add-tab-btn:hover {
      opacity: 1;
      background: ${theme.palette.action.hover};
      transform: translateY(-1px);
    }

    .add-tab-btn svg {
      font-size: 18px;
    }

    @media (max-width: 600px) {
      .navbar-container {
        height: 40px;
      }

      .chrome-tab {
        max-width: none !important;
      }

      .chrome-tab-title {
        font-size: 11px;
        text-align: center;
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

      // keep active tab visible in the scroll area
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
    const newTabs = [
      ...tabs,
      { label: "New Tab", path: `/new-tab/${tabs.length + 1}` },
    ];
    handleTabReorder(newTabs);

    const newTab = newTabs[newTabs.length - 1];
    handleTabChange(null, newTabs.length - 1, newTab.path);

    // scroll to the right to reveal the new tab + plus button
    requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (container) container.scrollLeft = container.scrollWidth;
    });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="navbar-container">
        {navTrigger && <div className="nav-trigger-wrap">{navTrigger}</div>}

        <div className="ctn-bar">
          {/* Scroll area that contains chrome-tabs + plus button */}
          <div ref={scrollRef} className="ctn-scroll">
            <div className="ctn-inner">
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

              {/* Plus immediately after the last tab, inside scroller */}
              <div className="add-tab-wrap">
                <div className="add-tab-btn" onClick={handleAddTab}>
                  <AddIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
