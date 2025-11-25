// src/itsm/layout/NavbarTabs.js
import React, { useRef, useState, useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";

import AddIcon from "@mui/icons-material/Add";

export default function NavbarTabs({
  tabs,
  tabIndex,
  handleTabChange,
  handleTabClose,
  handleTabReorder,
  isMobile,
}) {
  const theme = useTheme();
  const scrollRef = useRef(null);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const styles = `
    .navbar-tabs-root {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: stretch;
      background: ${theme.palette.background.paper};
      box-shadow: inset 0 -1px 0 ${theme.palette.divider};
      position: relative;
      overflow: hidden;
    }

    .tabs-scroll {
      flex: 1;
      min-width: 0;
      height: 100%;
    }

    .tabs-inner {
      display: inline-flex;
      align-items: stretch;
      height: 100%;
    }

    .chrome-tabs {
      background: transparent !important;
      height: 100%;
    }

    .chrome-tab {
      background: transparent !important;
      height: 100% !important;
      margin-top: 0 !important;
      box-shadow: none !important;
      border-top: none !important;
      font-size: 13px;
      padding: 0 4px !important;
    }

    /* Hide favicon area completely */
    .chrome-tab-favicon {
      display: none !important;
      width: 0 !important;
      margin-right: 0 !important;
    }

    /* Title styling */
    .chrome-tab-title {
      font-size: 13px;
      padding: 0 10px;
      white-space: nowrap;
    }

    /* Active tab: subtle background + bottom border */
    .chrome-tab.chrome-tab-active .chrome-tab-title {
      font-weight: 600;
      color: ${theme.palette.text.primary};
    }

    .chrome-tab.chrome-tab-active {
      background: ${
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.05)"
          : "rgba(0,0,0,0.03)"
      } !important;
      border-radius: 0 !important;
      box-shadow: inset 0 -2px 0 ${theme.palette.primary.main} !important;
    }

    .chrome-tab:not(.chrome-tab-active):hover {
      background: ${
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.02)"
          : "rgba(0,0,0,0.015)"
      } !important;
    }

    .chrome-tab-divider {
      top: 6px !important;
      bottom: 6px !important;
      opacity: 0.2;
    }

    .chrome-tab-background::before,
    .chrome-tab-background::after {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }

    .nav-arrow {
      display: flex;
      align-items: center;
      justifyContent: center;
      width: 22px;
      cursor: pointer;
      user-select: none;
      font-size: 16px;
      opacity: 0.7;
      transition: opacity 0.15s ease, transform 0.15s ease;
    }

    .nav-arrow:hover {
      opacity: 1;
      transform: translateY(-1px);
    }

    .nav-arrow.disabled {
      opacity: 0;
      pointer-events: none;
    }

    .add-tab-button {
      margin-right: 4px;
    }

    .add-tab-button svg {
      font-size: 22px;
    }

    @media (max-width: 600px) {
      .navbar-tabs-root {
        box-shadow: inset 0 -1px 0 ${theme.palette.divider};
      }

      .chrome-tab {
        flex: 0 0 auto !important;
        max-width: none !important;
      }

      .chrome-tab-title {
        font-size: 12px;
        padding: 0 8px;
      }
    }
  `;

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el || isMobile) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScrollLeft = scrollWidth - clientWidth;
    setShowLeftArrow(scrollLeft > 4);
    setShowRightArrow(scrollLeft < maxScrollLeft - 4);
  };

  useEffect(() => {
    updateArrows();
  }, [tabs.length, isMobile]);

  const handleScroll = () => {
    if (!isMobile) updateArrows();
  };

  const scrollByOffset = (delta) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  const scrollActiveTabIntoView = () => {
    const el = scrollRef.current;
    if (!el) return;
    const activeTab = el.querySelector(".chrome-tab.chrome-tab-active");
    if (!activeTab) return;

    const containerRect = el.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();

    if (tabRect.left < containerRect.left) {
      el.scrollBy({
        left: tabRect.left - containerRect.left - 16,
        behavior: "smooth",
      });
    } else if (tabRect.right > containerRect.right) {
      el.scrollBy({
        left: tabRect.right - containerRect.right + 16,
        behavior: "smooth",
      });
    }
  };

  const onTabActive = (id) => {
    const idx = tabs.findIndex((t) => t.id === id || t.path === id);
    if (idx >= 0) {
      handleTabChange(null, idx, tabs[idx].path);
      requestAnimationFrame(scrollActiveTabIntoView);
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
    const newIndex = newTabs.length - 1;
    handleTabChange(null, newIndex, newTabs[newIndex].path);
    requestAnimationFrame(scrollActiveTabIntoView);
  };

  return (
    <>
      <style>{styles}</style>
      <Box className="navbar-tabs-root">
        {/* Left arrow – desktop only */}
        {!isMobile && (
          <Box
            className={`nav-arrow ${showLeftArrow ? "" : "disabled"}`}
            onClick={() => scrollByOffset(-140)}
          >
            ‹
          </Box>
        )}

        {/* Scrollable tab strip (tabs + + button) */}
        <Box
          ref={scrollRef}
          className="tabs-scroll"
          onScroll={handleScroll}
          sx={{
            overflowX: isMobile ? "auto" : "hidden",
            overflowY: "hidden",
            WebkitOverflowScrolling: isMobile ? "touch" : "auto",
            msOverflowStyle: isMobile ? "none" : "auto",
            scrollbarWidth: isMobile ? "none" : "auto",
            "&::-webkit-scrollbar": {
              display: isMobile ? "none" : "initial",
            },
          }}
        >
          <Box className="tabs-inner">
            <Tabs
              darkMode={theme.palette.mode === "dark"}
              onTabClose={onTabClose}
              onTabActive={onTabActive}
              tabs={tabs.map((t, idx) => ({
                id: t.path,
                title: t.label,
                // no favicon: clean text-only tabs
                active: idx === tabIndex,
                isCloseIconVisible: idx !== 0,
              }))}
            />
            <IconButton
              size="small"
              className="add-tab-button"
              onClick={handleAddTab}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Right arrow – desktop only */}
        {!isMobile && (
          <Box
            className={`nav-arrow ${showRightArrow ? "" : "disabled"}`}
            onClick={() => scrollByOffset(140)}
          >
            ›
          </Box>
        )}
      </Box>
    </>
  );
}
