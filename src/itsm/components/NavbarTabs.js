// src/itsm/layout/NavbarTabs.js
import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";

const LONG_PRESS_MS = 500;

export default function NavbarTabs({
  tabs,
  tabIndex,
  handleTabChange,
  handleTabClose,
  handleTabReorder,
  isMobile,
}) {
  const theme = useTheme();

  // This is the ONLY element that scrolls horizontally
  const scrollRef = useRef(null);

  const [contextAnchor, setContextAnchor] = useState(null);
  const [contextTabIndex, setContextTabIndex] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);

  const contextTab =
    contextTabIndex != null && contextTabIndex >= 0
      ? tabs[contextTabIndex]
      : null;

  /* ------------------------------------------------------------------
   * Accent colour per tab (small coloured bar)
   * ------------------------------------------------------------------ */
  const getTabAccentColor = (label = "") => {
    const lower = label.toLowerCase();
    if (lower.includes("incident")) return theme.palette.error.main;
    if (lower.includes("service request")) return theme.palette.info.main;
    if (lower.includes("change")) return theme.palette.warning.main;
    if (lower.includes("task")) return theme.palette.success.main;
    if (lower.includes("asset")) return theme.palette.secondary.main;
    if (lower.includes("settings")) return theme.palette.grey[600];
    if (lower.includes("profile")) return theme.palette.primary.main;
    if (lower.includes("knowledge")) return "#00897b";
    if (lower.includes("dashboard")) return theme.palette.primary.main;
    return theme.palette.text.disabled;
  };

  /* ------------------------------------------------------------------
   * Keep active tab in view when changed
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector('[data-active-tab="true"]');
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

  /* ------------------------------------------------------------------
   * Context menu helpers (desktop right-click + mobile long-press)
   * ------------------------------------------------------------------ */
  const openContextMenu = (anchorEl, idx) => {
    setContextTabIndex(idx);
    setContextAnchor(anchorEl);
  };

  const closeContextMenu = () => {
    setContextAnchor(null);
    setContextTabIndex(null);
  };

  const handleContextMenuDesktop = (event, idx) => {
    if (isMobile) return;
    event.preventDefault();
    openContextMenu(event.currentTarget, idx);
  };

  const handleTouchStart = (event, idx) => {
    if (!isMobile) return;
    const target = event.currentTarget;
    const timer = setTimeout(() => {
      openContextMenu(target, idx);
    }, LONG_PRESS_MS);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  /* ------------------------------------------------------------------
   * Context menu actions
   * ------------------------------------------------------------------ */
  const handleMenuCloseTab = () => {
    if (!contextTab || contextTabIndex === 0) {
      closeContextMenu();
      return;
    }
    handleTabClose(contextTab.path);
    closeContextMenu();
  };

  const handleMenuCloseOthers = () => {
    if (!contextTab || tabs.length <= 1) {
      closeContextMenu();
      return;
    }

    // Keep pinned tab (index 0) + context tab
    let newTabs;
    if (contextTabIndex === 0) {
      newTabs = [tabs[0]];
    } else {
      newTabs = [tabs[0], contextTab];
    }

    handleTabReorder(newTabs);
    const newIndex = newTabs.findIndex((t) => t.path === contextTab.path);
    const path = contextTab.path;

    if (newIndex >= 0) {
      handleTabChange(null, newIndex, path);
    } else {
      handleTabChange(null, 0, newTabs[0].path);
    }

    closeContextMenu();
  };

  const handleMenuCloseAll = () => {
    if (!tabs.length) {
      closeContextMenu();
      return;
    }
    // "Close all" = keep only the pinned first tab
    const newTabs = [tabs[0]];
    handleTabReorder(newTabs);
    handleTabChange(null, 0, newTabs[0].path);
    closeContextMenu();
  };

  const handleMenuDuplicate = () => {
    if (!contextTab) {
      closeContextMenu();
      return;
    }

    const dupTab = {
      ...contextTab,
      label: contextTab.label.includes("(Copy)")
        ? contextTab.label
        : `${contextTab.label} (Copy)`,
    };

    const idx = contextTabIndex ?? 0;
    const newTabs = [
      ...tabs.slice(0, idx + 1),
      dupTab,
      ...tabs.slice(idx + 1),
    ];

    handleTabReorder(newTabs);
    const newIndex = idx + 1;
    handleTabChange(null, newIndex, dupTab.path);
    closeContextMenu();
  };

  /* ------------------------------------------------------------------
   * Add tab
   * ------------------------------------------------------------------ */
  const handleAddTab = () => {
    const newTabs = [
      ...tabs,
      { label: `New Tab ${tabs.length + 1}`, path: `/new-tab/${tabs.length + 1}` },
    ];
    handleTabReorder(newTabs);
  };

  /* ------------------------------------------------------------------
   * Styles
   * ------------------------------------------------------------------ */
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
      padding: "0 10px",
      marginRight: 4,
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
      boxSizing: "border-box",
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

  /* ------------------------------------------------------------------
   * Middle-click to close (desktop)
   * ------------------------------------------------------------------ */
  const handleMouseDown = (event, tab, idx) => {
    // Middle button == 1
    if (event.button === 1 && idx !== 0) {
      event.preventDefault();
      handleTabClose(tab.path);
    }
  };

  return (
    <>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          minWidth: 0,
          overflow: "hidden", // 🔒 this whole row never extends page width
        }}
      >
        {/* Single scrollable strip: tabs + + button.
            This strip has fixed width (100%) and will NOT push content right.
        */}
        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            minWidth: 0,
            overflowX: "auto",           // ✅ horizontal scroll ONLY here
            overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
            px: 0.5,
            "&::-webkit-scrollbar": {
              height: 3,
            },
            "&::-webkit-scrollbar-thumb": {
              background: "transparent",
            },
            "&:hover::-webkit-scrollbar-thumb": {
              background: "rgba(120, 120, 120, 0.4)",
            },
          }}
        >
          {tabs.map((tab, idx) => {
            const active = idx === tabIndex;
            const accent = getTabAccentColor(tab.label);

            return (
              <Box
                key={tab.path || tab.id || idx}
                data-active-tab={active ? "true" : "false"}
                onClick={() => handleTabChange(null, idx, tab.path)}
                onContextMenu={(e) => handleContextMenuDesktop(e, idx)}
                onMouseDown={(e) => handleMouseDown(e, tab, idx)}
                onTouchStart={(e) => handleTouchStart(e, idx)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                sx={getTabSx(active)}
              >
                {/* coloured accent bar */}
                <Box
                  sx={{
                    width: 3,
                    borderRadius: 999,
                    bgcolor: accent,
                    mr: 0.75,
                    alignSelf: "stretch",
                    my: "22%",
                    opacity: 0.9,
                  }}
                />

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

          {/* + Add tab – always at the visible end of the strip */}
          <IconButton
            size="small"
            onClick={handleAddTab}
            sx={{
              flexShrink: 0,
              ml: 0.5,
              p: 0.25,
            }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Context menu (desktop right-click + mobile long-press) */}
      <Menu
        anchorEl={contextAnchor}
        open={Boolean(contextAnchor)}
        onClose={closeContextMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem
          disabled={!contextTab || contextTabIndex === 0}
          onClick={handleMenuCloseTab}
        >
          <ListItemIcon>
            <CloseIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Close tab</ListItemText>
        </MenuItem>

        <MenuItem
          disabled={!contextTab || tabs.length <= 1}
          onClick={handleMenuCloseOthers}
        >
          <ListItemIcon>
            <CancelPresentationIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Close other tabs</ListItemText>
        </MenuItem>

        <MenuItem disabled={tabs.length <= 1} onClick={handleMenuCloseAll}>
          <ListItemIcon>
            <ClearAllIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Close all (keep home)</ListItemText>
        </MenuItem>

        <MenuItem disabled={!contextTab} onClick={handleMenuDuplicate}>
          <ListItemIcon>
            <FilterNoneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate tab</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
