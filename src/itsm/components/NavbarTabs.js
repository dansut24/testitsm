// src/itsm/layout/NavbarTabs.js
import React, { useRef, useState, useEffect } from "react";
import { Box, Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

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
  const tabHeight = isMobile ? 48 : 30;

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // long-press close on mobile
  const longPressRef = useRef({ timerId: null, index: null });

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScrollLeft = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(maxScrollLeft > 2 && scrollLeft < maxScrollLeft - 2);
  };

  useEffect(() => {
    updateScrollButtons();
  }, [tabs.length]);

  useEffect(() => {
    const handleResize = () => updateScrollButtons();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleScroll = () => updateScrollButtons();

  const scrollByAmount = (amount) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const scrollTabIntoView = (index) => {
    const container = scrollRef.current;
    if (!container) return;
    const tabEl = container.querySelector(`[data-tab-index="${index}"]`);
    if (!tabEl) return;
    tabEl.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  };

  const handleTabClick = (idx) => {
    const tab = tabs[idx];
    if (!tab) return;
    handleTabChange(null, idx, tab.path);
    requestAnimationFrame(() => {
      scrollTabIntoView(idx);
    });
  };

  const handleClose = (idx) => {
    const tab = tabs[idx];
    if (!tab) return;
    handleTabClose(tab.path);
    const newTabs = tabs.filter((_, i) => i !== idx);
    handleTabReorder(newTabs);
  };

  const handlePressStart = (idx) => {
    if (!isMobile) return;
    if (idx === 0) return;
    if (longPressRef.current.timerId) {
      clearTimeout(longPressRef.current.timerId);
    }
    longPressRef.current.index = idx;
    longPressRef.current.timerId = setTimeout(() => {
      handleClose(idx);
      longPressRef.current.timerId = null;
      longPressRef.current.index = null;
    }, 600);
  };

  const handlePressEnd = () => {
    if (longPressRef.current.timerId) {
      clearTimeout(longPressRef.current.timerId);
      longPressRef.current.timerId = null;
      longPressRef.current.index = null;
    }
  };

  const handleAddTab = () => {
    const newTab = {
      label: "New Tab",
      path: `/new-tab/${tabs.length + 1}`,
      favicon: "/favicon.ico",
    };
    const newTabs = [...tabs, newTab];
    handleTabReorder(newTabs);
    handleTabChange(null, newTabs.length - 1, newTab.path);
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollLeft = el.scrollWidth;
      updateScrollButtons();
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        height: tabHeight,
        display: "flex",
        alignItems: "stretch",
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: theme.palette.background.paper,
        boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.04)",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      {navTrigger && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1,
            borderRight: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          {navTrigger}
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Left arrow – desktop always visible, disabled when no scroll */}
        {!isMobile && (
          <Box
            sx={{
              flexShrink: 0,
              borderRight: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              px: 0.25,
              height: "100%",
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={() => canScrollLeft && scrollByAmount(-150)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                cursor: canScrollLeft ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                padding: 0,
                opacity: canScrollLeft ? 1 : 0.3,
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        )}

        {/* Scrollable strip */}
        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          sx={{
            flex: 1,
            minWidth: 0,
            overflowX: "auto",
            overflowY: "hidden",
            height: "100%",
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "stretch",
              height: "100%",
            }}
          >
            {tabs.map((tab, idx) => {
              const active = idx === tabIndex;
              return (
                <Box
                  key={tab.path || idx}
                  component="button"
                  type="button"
                  data-tab-index={idx}
                  onClick={() => handleTabClick(idx)}
                  onMouseDown={() => handlePressStart(idx)}
                  onMouseUp={handlePressEnd}
                  onMouseLeave={handlePressEnd}
                  onTouchStart={() => handlePressStart(idx)}
                  onTouchEnd={handlePressEnd}
                  sx={{
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    backgroundColor: active
                      ? theme.palette.action.selected
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: isMobile ? 1.6 : 1,
                    height: tabHeight,
                    borderBottom: active
                      ? `2px solid ${theme.palette.primary.main}`
                      : "2px solid transparent",
                    fontSize: isMobile ? 14 : 12,
                    color: active
                      ? theme.palette.text.primary
                      : theme.palette.text.secondary,
                    flex: "0 0 auto",
                    minWidth: isMobile ? 90 : 100,
                    maxWidth: isMobile ? 160 : 220,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    "&:hover": {
                      backgroundColor: active
                        ? theme.palette.action.selected
                        : theme.palette.action.hover,
                    },
                  }}
                >
                  {tab.favicon && (
                    <Box
                      component="img"
                      src={tab.favicon}
                      alt=""
                      sx={{
                        width: isMobile ? 16 : 12,
                        height: isMobile ? 16 : 12,
                        borderRadius: 0.5,
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <Box
                    component="span"
                    sx={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {tab.label}
                  </Box>

                  {/* Desktop close icon only */}
                  {!isMobile && idx !== 0 && (
                    <Box
                      component="button"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClose(idx);
                      }}
                      sx={{
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        p: 0,
                        ml: 0.25,
                        flexShrink: 0,
                        opacity: 0.7,
                        "&:hover": { opacity: 1 },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </Box>
                  )}
                </Box>
              );
            })}

            {/* + button */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 0.5,
                flexShrink: 0,
              }}
            >
              <Tooltip title="New tab">
                <Box
                  component="button"
                  type="button"
                  onClick={handleAddTab}
                  sx={{
                    border: "1px solid",
                    borderColor: theme.palette.divider,
                    outline: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 0.25,
                    borderRadius: "999px",
                  }}
                >
                  <AddIcon sx={{ fontSize: isMobile ? 22 : 16 }} />
                </Box>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Right arrow – desktop always visible, disabled when no scroll */}
        {!isMobile && (
          <Box
            sx={{
              flexShrink: 0,
              borderLeft: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              px: 0.25,
              height: "100%",
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={() => canScrollRight && scrollByAmount(150)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                cursor: canScrollRight ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                padding: 0,
                opacity: canScrollRight ? 1 : 0.3,
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
