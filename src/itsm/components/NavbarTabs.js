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
  const scrollRef = useRef(null);

  const [contextAnchor, setContextAnchor] = useState(null);
  const [contextTabIndex, setContextTabIndex] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const longPressFiredRef = useRef(false); // 🔥 track if long press triggered

  const contextTab =
    contextTabIndex != null && contextTabIndex >= 0
      ? tabs[contextTabIndex]
      : null;

  /* ------------------------------------------------------------------
   * Accent colour per tab (bottom indicator)
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
   * Keep active tab in view
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const active = el.querySelector('[data-active-tab="true"]');
    if (!active) return;

    const container = el.getBoundingClientRect();
    const rect = active.getBoundingClientRect();

    if (rect.left < container.left || rect.right > container.right) {
      active.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [tabIndex, tabs.length]);

  /* ------------------------------------------------------------------
   * Context menu helpers
   * ------------------------------------------------------------------ */
  const openContextMenu = (anchorEl, idx) => {
    setContextTabIndex(idx);
    setContextAnchor(anchorEl);
  };

  const closeContextMenu = () => {
    setContextAnchor(null);
    setContextTabIndex(null);
  };

  const handleContextMenuDesktop = (e, idx) => {
    if (isMobile) return;
    e.preventDefault();
    openContextMenu(e.currentTarget, idx);
  };

  /* ------------------------------------------------------------------
   * Mobile long press – ONLY menu, no page select / navigation
   * ------------------------------------------------------------------ */
  const handleTouchStart = (e, idx) => {
    if (!isMobile) return;

    // Avoid text selection / weird highlight
    e.stopPropagation();
    // NOTE: don't call preventDefault here or horizontal scroll may break

    longPressFiredRef.current = false;

    const target = e.currentTarget;
    const timer = window.setTimeout(() => {
      longPressFiredRef.current = true;
      openContextMenu(target, idx);
    }, LONG_PRESS_MS);

    setLongPressTimer(timer);
  };

  const handleTouchEnd = (e) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // If a long press actually fired, swallow the "tap" so it doesn't navigate
    if (longPressFiredRef.current) {
      e.preventDefault();
      e.stopPropagation();
      longPressFiredRef.current = false;
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
   * Rectangular, ZERO-SPACING tab styling
   * ------------------------------------------------------------------ */
  const getTabSx = (active) => ({
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    minWidth: 80,
    maxWidth: 220,
    padding: "0 6px",
    marginRight: 0,          // 🔥 no gap between tabs
    borderRadius: 0,         // 🔥 fully square
    height: "100%",
    border: "1px solid",
    borderColor: active ? "primary.main" : "divider",
    bgcolor: active
      ? theme.palette.mode === "dark"
        ? "rgba(25,118,210,0.18)"
        : "rgba(25,118,210,0.06)"
      : theme.palette.background.paper,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: 13,
    cursor: "pointer",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease, background 0.15s ease",
    userSelect: "none",          // 🔥 no text selection
    WebkitUserSelect: "none",
    WebkitTapHighlightColor: "transparent",

    "&:hover": {
      borderColor: active ? "primary.main" : "action.hover",
      bgcolor: active
        ? theme.palette.mode === "dark"
          ? "rgba(25,118,210,0.24)"
          : "rgba(25,118,210,0.10)"
        : theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.04)"
        : "rgba(0,0,0,0.02)",
    },
  });

  /* middle-click close (desktop) */
  const handleMouseDown = (e, tab, idx) => {
    if (e.button === 1 && idx !== 0) {
      e.preventDefault();
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
          overflow: "hidden",
          minWidth: 0,
          bgcolor: "background.paper",
        }}
      >
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
            whiteSpace: "nowrap",
            px: 0, // 🔥 no padding so tabs butt up neatly

            "&::-webkit-scrollbar": {
              height: 3,
            },
            "&::-webkit-scrollbar-thumb": {
              background: "transparent",
            },
            "&:hover::-webkit-scrollbar-thumb": {
              background: "rgba(120,120,120,0.4)",
            },
          }}
        >
          {tabs.map((tab, idx) => {
            const active = idx === tabIndex;
            const accent = getTabAccentColor(tab.label);

            return (
              <Box
                key={tab.path || idx}
                data-active-tab={active ? "true" : "false"}
                sx={getTabSx(active)}
                onClick={(e) => {
                  // if long press fired, ignore this click
                  if (isMobile && longPressFiredRef.current) {
                    longPressFiredRef.current = false;
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  handleTabChange(null, idx, tab.path);
                }}
                onContextMenu={(e) => handleContextMenuDesktop(e, idx)}
                onMouseDown={(e) => handleMouseDown(e, tab, idx)}
                onTouchStart={(e) => handleTouchStart(e, idx)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                {/* bottom accent line */}
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 2,
                    bgcolor: accent,
                    opacity: active ? 1 : 0.6,
                  }}
                />

                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    flex: 1,
                    fontSize: 12,
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
                      p: 0,
                      ml: 0.25,
                      "& svg": { fontSize: 14 },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>
            );
          })}

          {/* + Add tab – still inside scroll area, no gap */}
          <IconButton
            size="small"
            onClick={handleAddTab}
            sx={{
              display: "inline-flex",
              verticalAlign: "middle",
              p: 0.25,
              ml: 0,
            }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Context menu (desktop right-click + mobile long press) */}
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
          <ListItemText>Close all (keep Dashboard)</ListItemText>
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
