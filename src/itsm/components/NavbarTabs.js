// src/itsm/layout/NavbarTabs.js
import React, { useRef, useState, useEffect } from "react";
import { Box, IconButton, Tabs, Tab } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

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

  useEffect(() => {
    scrollActiveTabIntoView();
  }, [tabIndex, tabs.length, isMobile]);

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
    const activeTab = el.querySelector(".navbar-tab.Mui-selected");
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

  const onTabsChange = (event, newIndex) => {
    const path = tabs[newIndex]?.path;
    handleTabChange(event, newIndex, path);
  };

  const onCloseClick = (e, tabPath) => {
    e.stopPropagation();
    handleTabClose(tabPath);
  };

  const onAddTab = () => {
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
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "stretch",
        bgcolor: "background.paper",
        boxShadow: (t) => `inset 0 -1px 0 ${t.palette.divider}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left arrow – desktop only */}
      {!isMobile && (
        <Box
          sx={{
            width: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: showLeftArrow ? "pointer" : "default",
            opacity: showLeftArrow ? 0.8 : 0,
            transition: "opacity 0.15s ease, transform 0.15s ease",
            "&:hover": {
              transform: showLeftArrow ? "translateY(-1px)" : "none",
              opacity: showLeftArrow ? 1 : 0,
            },
          }}
          onClick={() => showLeftArrow && scrollByOffset(-140)}
        >
          ‹
        </Box>
      )}

      {/* Scrollable tab strip (tabs + + button) */}
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          display: "flex",
          alignItems: "stretch",
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
        <Tabs
          value={tabIndex}
          onChange={onTabsChange}
          variant="standard"
          TabIndicatorProps={{ style: { display: "none" } }}
          sx={{
            minHeight: "100%",
            height: "100%",
            "& .MuiTabs-flexContainer": {
              height: "100%",
              alignItems: "stretch",
            },
            "& .MuiTab-root": {
              minHeight: "100%",
              height: "100%",
              textTransform: "none",
              fontSize: 13,
              padding: "0 8px",
              color: "text.secondary",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "none",
              minWidth: 0,
            },
            "& .MuiTab-root.Mui-selected": {
              fontWeight: 600,
              color: "text.primary",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.03)",
              boxShadow: `inset 0 -2px 0 ${theme.palette.primary.main}`,
            },
            "& .MuiTab-root:hover": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(0,0,0,0.015)",
            },
          }}
        >
          {tabs.map((t, idx) => (
            <Tab
              key={t.path}
              className="navbar-tab"
              disableRipple
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    pl: 0.5,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      maxWidth: isMobile ? 120 : 160,
                      fontSize: 13,
                    }}
                  >
                    {t.label}
                  </Box>
                  {idx !== 0 && (
                    <IconButton
                      size="small"
                      onClick={(e) => onCloseClick(e, t.path)}
                      sx={{
                        p: 0,
                        ml: 0.5,
                        "& svg": {
                          fontSize: 14,
                        },
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>

        {/* + button – scrolls with tabs */}
        <Box
          sx={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            pr: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={onAddTab}
            sx={{
              ml: 0.5,
              "& svg": { fontSize: 20 },
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Right arrow – desktop only */}
      {!isMobile && (
        <Box
          sx={{
            width: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: showRightArrow ? "pointer" : "default",
            opacity: showRightArrow ? 0.8 : 0,
            transition: "opacity 0.15s ease, transform 0.15s ease",
            "&:hover": {
              transform: showRightArrow ? "translateY(-1px)" : "none",
              opacity: showRightArrow ? 1 : 0,
            },
          }}
          onClick={() => showRightArrow && scrollByOffset(140)}
        >
          ›
        </Box>
      )}
    </Box>
  );
}
