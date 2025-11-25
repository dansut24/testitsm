// src/itsm/layout/NavbarTabs.js
import React, { useRef, useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
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
}) {
  const theme = useTheme();
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // --- Scroll helpers ---
  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, clientWidth, scrollWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollButtons();

    const handleScroll = () => updateScrollButtons();
    const handleResize = () => updateScrollButtons();

    el.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.length, isMobile]);

  // Keep active tab in view when changed
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector('[data-active="true"]');
    if (!active) return;

    const containerRect = el.getBoundingClientRect();
    const tabRect = active.getBoundingClientRect();

    if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
      active.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [tabIndex, tabs.length]);

  const scrollTabs = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const delta = el.clientWidth * 0.6 * (direction === "left" ? -1 : 1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  // --- Add tab ---
  const handleAddTab = () => {
    const newTabs = [
      ...tabs,
      { label: `New Tab ${tabs.length + 1}`, path: `/new-tab/${tabs.length + 1}` },
    ];
    handleTabReorder(newTabs);
  };

  // --- Styles ---
  const getTabSx = (active) => {
    const baseBg =
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : theme.palette.background.paper;

    const activeBg =
      theme.palette.mode === "dark"
        ? "rgba(25,118,210,0.25)"
        : "rgba(25,118,210,0.08)";

    return {
      display: "flex",
      alignItems: "center",
      maxWidth: 220,
      minWidth: 90,
      px: 1.25,
      mx: 0.25,
      borderRadius: 8,
      border: "1px solid",
      borderColor: active ? "primary.main" : "divider",
      bgcolor: active ? activeBg : baseBg,
      cursor: "pointer",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      fontSize: 13,
      flexShrink: 0,
      height: "100%",
      transition: "background 0.15s ease, border-color 0.15s ease",
      "&:hover": {
        borderColor: active ? "primary.main" : "action.hover",
        bgcolor: active
          ? activeBg
          : theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.04)"
          : "rgba(0,0,0,0.02)",
      },
    };
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "stretch",
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        minWidth: 0,
        overflow: "hidden", // 🔒 row itself never grows wider than container
      }}
    >
      {/* Left scroll arrow (desktop only, only when needed) */}
      {!isMobile && (
        <Box
          sx={{
            width: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {canScrollLeft && (
            <IconButton
              size="small"
              onClick={() => scrollTabs("left")}
              sx={{ p: 0.25 }}
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>
      )}

      {/* Middle: scrollable tabs + + button */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "stretch",
          overflow: "hidden", // tabs can only scroll inside scrollRef
        }}
      >
        {/* Scrollable tab strip */}
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "stretch",
            overflowX: "auto", // ✅ horizontal scroll lives only here
            overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
            "&::-webkit-scrollbar": {
              height: 0, // hides tiny horiz scrollbar; main page scroll unaffected
            },
          }}
        >
          {tabs.map((tab, idx) => {
            const active = idx === tabIndex;
            return (
              <Box
                key={tab.path || tab.id || idx}
                data-active={active ? "true" : "false"}
                onClick={() => handleTabChange(null, idx, tab.path)}
                sx={getTabSx(active)}
              >
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontSize: 12,
                    flex: 1,
                    pr: idx !== 0 ? 0.5 : 0,
                  }}
                >
                  {tab.label}
                </Typography>
                {idx !== 0 && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTabClose(tab.path);
                    }}
                    sx={{
                      ml: 0.25,
                      p: 0,
                      "& svg": { fontSize: 14 },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Box>

        {/* + Add tab – fixed at the right edge of the tab area */}
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            px: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={handleAddTab}
            sx={{ p: 0.25 }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Right scroll arrow (desktop only, only when needed) */}
      {!isMobile && (
        <Box
          sx={{
            width: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {canScrollRight && (
            <IconButton
              size="small"
              onClick={() => scrollTabs("right")}
              sx={{ p: 0.25 }}
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
}
