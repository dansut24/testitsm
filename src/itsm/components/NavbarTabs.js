// NavbarTabs.js
import React, { useRef, useState, useEffect } from "react";
import { Box, Tooltip, useMediaQuery } from "@mui/material";
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
  navTrigger, // optional
}) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const tabHeight = 40;

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const handleScroll = () => {
    updateScrollButtons();
  };

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

  const handleClose = (e, idx) => {
    e.stopPropagation();
    const tab = tabs[idx];
    if (!tab) return;
    handleTabClose(tab.path);

    const newTabs = tabs.filter((_, i) => i !== idx);
    handleTabReorder(newTabs);
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
      {/* LEFT: optional nav trigger */}
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

      {/* CENTER: arrows (only when needed) + scrollable tabs + + button */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Left arrow (only when needed) */}
        {canScrollLeft && (
          <Box
            sx={{
              flexShrink: 0,
              borderRight: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              px: 0.25,
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={() => scrollByAmount(-150)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: 0,
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>
        )}

        {/* Scrollable tab strip */}
        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          sx={{
            flex: 1,
            minWidth: 0,
            overflowX: "auto",
            overflowY: "hidden",
            height: "100%",
            "&::-webkit-scrollbar": {
              display: "none",
            },
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
                  sx={{
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    backgroundColor: active
                      ? theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.03)"
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.25,
                    height: tabHeight,
                    borderBottom: active
                      ? `2px solid ${theme.palette.primary.main}`
                      : "2px solid transparent",
                    fontSize: isXs ? 11 : 13,
                    color: active
                      ? theme.palette.text.primary
                      : theme.palette.text.secondary,
                    flex: "0 0 auto",
                    minWidth: isMobile ? 80 : 110,
                    maxWidth: 220,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  {/* favicon */}
                  {tab.favicon && (
                    <Box
                      component="img"
                      src={tab.favicon}
                      alt=""
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: 0.5,
                        flexShrink: 0,
                      }}
                    />
                  )}

                  {/* title */}
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

                  {/* close icon for non-first tabs (first pinned) */}
                  {idx !== 0 && (
                    <Box
                      component="button"
                      type="button"
                      onClick={(e) => handleClose(e, idx)}
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
                        "&:hover": {
                          opacity: 1,
                        },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 15 }} />
                    </Box>
                  )}
                </Box>
              );
            })}

            {/* + button right after last tab */}
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
                    p: 0.5,
                    borderRadius: "999px",
                  }}
                >
                  <AddIcon sx={{ fontSize: 18 }} />
                </Box>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Right arrow (only when needed) */}
        {canScrollRight && (
          <Box
            sx={{
              flexShrink: 0,
              borderLeft: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              px: 0.25,
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={() => scrollByAmount(150)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: 0,
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
