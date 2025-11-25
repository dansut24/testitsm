import React, { useRef, useState, useEffect } from "react";
import { Box, Tabs, Tab, IconButton, Badge } from "@mui/material";
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

  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const mobile = !!isMobile;

  const safeTabIndex =
    typeof tabIndex === "number" && tabIndex >= 0 && tabIndex <= tabs.length
      ? tabIndex
      : 0;

  const reorderArray = (arr, from, to) => {
    if (from === to || from == null || to == null) return arr;
    const result = [...arr];
    const [moved] = result.splice(from, 1);
    result.splice(to, 0, moved);
    return result;
  };

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScrollLeft = scrollWidth - clientWidth;
    if (mobile) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
    } else {
      setShowLeftArrow(scrollLeft > 4);
      setShowRightArrow(scrollLeft < maxScrollLeft - 4);
    }
  };

  useEffect(() => {
    updateArrows();
  }, [tabs.length, mobile]);

  useEffect(() => {
    scrollActiveTabIntoView();
  }, [safeTabIndex, tabs.length]);

  const handleScroll = () => {
    if (!mobile) updateArrows();
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
    if (newIndex === tabs.length) {
      const newTabs = [
        ...tabs,
        { label: "New Tab", path: `/new-tab/${tabs.length + 1}` },
      ];
      handleTabReorder(newTabs);
      const createdIndex = newTabs.length - 1;
      handleTabChange(event, createdIndex, newTabs[createdIndex].path);
      requestAnimationFrame(scrollActiveTabIntoView);
    } else {
      const path = tabs[newIndex]?.path;
      handleTabChange(event, newIndex, path);
    }
  };

  const onCloseClick = (e, tabPath) => {
    e.stopPropagation();
    handleTabClose(tabPath);
  };

  // Drag + drop (desktop only)
  const onDragStart = (e, index) => {
    if (mobile) return;
    setDragIndex(index);
    setDragOverIndex(index);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", String(index));
    } catch {
      // ignore
    }
  };

  const onDragOver = (e, index) => {
    if (mobile || dragIndex == null) return;
    e.preventDefault();
    if (index !== dragOverIndex) {
      setDragOverIndex(index);
    }
  };

  const onDrop = (e, index) => {
    if (mobile || dragIndex == null) return;
    e.preventDefault();
    const finalIndex = index;
    if (finalIndex == null || finalIndex === dragIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newTabs = reorderArray(tabs, dragIndex, finalIndex);
    handleTabReorder(newTabs);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const onDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const getTabLabel = (t, idx) => {
    const badgeRaw =
      typeof t.badge !== "undefined" ? t.badge : t.badgeCount ?? null;
    const showBadge = badgeRaw !== null && badgeRaw !== 0;

    const isNumberBadge =
      typeof badgeRaw === "number" && Number.isFinite(badgeRaw);

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          px: mobile ? 0.25 : 0.5,
        }}
      >
        {/* Label + optional badge */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            maxWidth: mobile ? 120 : 180,
          }}
        >
          <Box
            component="span"
            sx={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              fontSize: mobile ? 12 : 13,
            }}
          >
            {t.label}
          </Box>
          {showBadge && (
            <Badge
              color="primary"
              variant={isNumberBadge && !mobile ? "standard" : "dot"}
              badgeContent={isNumberBadge && !mobile ? badgeRaw : undefined}
              overlap="circular"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: 9,
                  minWidth: 14,
                  height: 14,
                  px: isNumberBadge && !mobile ? 0.4 : 0,
                  borderRadius: "999px",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 0 0 1px rgba(0,0,0,0.6)"
                      : "0 0 0 1px rgba(255,255,255,0.8)",
                },
              }}
            />
          )}
        </Box>

        {/* Close icon (not on first tab) */}
        {idx !== 0 && (
          <IconButton
            size="small"
            onClick={(e) => onCloseClick(e, t.path)}
            sx={{
              p: 0,
              ml: 0.25,
              "& svg": {
                fontSize: mobile ? 14 : 15,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "background.paper",
        boxShadow: (t) => `inset 0 -1px 0 ${t.palette.divider}`,
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden", // tabs can't change layout width
      }}
    >
      {/* Left arrow – desktop only */}
      {!mobile && (
        <Box
          sx={{
            width: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: showLeftArrow ? "pointer" : "default",
            opacity: showLeftArrow ? 0.8 : 0,
            transition: "opacity 0.2s, transform 0.2s",
            "&:hover": {
              transform: showLeftArrow ? "translateY(-1px)" : "none",
              opacity: showLeftArrow ? 1 : 0,
            },
          }}
          onClick={() => showLeftArrow && scrollByOffset(-160)}
        >
          ‹
        </Box>
      )}

      {/* Scrollable strip containing Tabs + + button */}
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          display: "flex",
          alignItems: "stretch",
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: mobile ? "touch" : "auto",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <Tabs
          value={safeTabIndex}
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
              color: "text.secondary",
              padding: mobile ? "0 4px" : "0 8px",
              maxWidth: "none",
              minWidth: 0,
            },
            "& .MuiTab-root.Mui-selected": {
              fontWeight: 600,
              color: "text.primary",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)",
              boxShadow: `inset 0 -2px 0 ${theme.palette.primary.main}`,
            },
            "& .MuiTab-root:hover": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
            },
          }}
        >
          {tabs.map((t, idx) => (
            <Tab
              key={t.path}
              className={`navbar-tab${
                dragOverIndex === idx && dragIndex !== null ? " drag-over" : ""
              }`}
              disableRipple
              draggable={!mobile}
              onDragStart={(e) => onDragStart(e, idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDrop={(e) => onDrop(e, idx)}
              onDragEnd={onDragEnd}
              label={getTabLabel(t, idx)}
              sx={{
                opacity: dragIndex === idx ? 0.6 : 1,
                borderLeft:
                  dragOverIndex === idx && dragIndex !== null
                    ? `2px solid ${theme.palette.primary.main}`
                    : "none",
                transition: "opacity 0.15s, border-color 0.15s",
              }}
            />
          ))}

          {/* + tab */}
          <Tab
            disableRipple
            value={tabs.length}
            label={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: mobile ? 0.25 : 0.5,
                }}
              >
                <AddIcon sx={{ fontSize: mobile ? 18 : 20 }} />
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Right arrow – desktop only */}
      {!mobile && (
        <Box
          sx={{
            width: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: showRightArrow ? "pointer" : "default",
            opacity: showRightArrow ? 0.8 : 0,
            transition: "opacity 0.2s, transform 0.2s",
            "&:hover": {
              transform: showRightArrow ? "translateY(-1px)" : "none",
              opacity: showRightArrow ? 1 : 0,
            },
          }}
          onClick={() => showRightArrow && scrollByOffset(160)}
        >
          ›
        </Box>
      )}
    </Box>
  );
}
