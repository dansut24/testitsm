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
    return theme.palette.text.disabled;
  };

  /* auto-scroll active tab into view */
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

  /* context menu handling */
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

  const handleTouchStart = (e, idx) => {
    if (!isMobile) return;
    const target = e.currentTarget;

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

  /* context actions */
  const handleMenuCloseTab = () => {
    if (!contextTab || contextTabIndex === 0) return closeContextMenu();
    handleTabClose(contextTab.path);
    closeContextMenu();
  };

  const handleMenuCloseOthers = () => {
    let newTabs = [tabs[0]];
    if (contextTabIndex !== 0) {
      newTabs.push(contextTab);
    }
    handleTabReorder(newTabs);
    handleTabChange(null, newTabs.length - 1, newTabs[newTabs.length - 1].path);
    closeContextMenu();
  };

  const handleMenuCloseAll = () => {
    handleTabReorder([tabs[0]]);
    handleTabChange(null, 0, tabs[0].path);
    closeContextMenu();
  };

  const handleMenuDuplicate = () => {
    if (!contextTab) return closeContextMenu();
    const dup = {
      ...contextTab,
      label: `${contextTab.label} (Copy)`,
    };
    const idx = contextTabIndex;
    const newTabs = [
      ...tabs.slice(0, idx + 1),
      dup,
      ...tabs.slice(idx + 1),
    ];
    handleTabReorder(newTabs);
    handleTabChange(null, idx + 1, dup.path);
    closeContextMenu();
  };

  /* add new tab */
  const handleAddTab = () =>
    handleTabReorder([
      ...tabs,
      {
        label: `New Tab ${tabs.length + 1}`,
        path: `/new-tab/${tabs.length + 1}`,
      },
    ]);

  /* FINAL – clean rectangular tab styling */
  const getTabSx = (active) => ({
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    minWidth: 80,
    maxWidth: 200,
    padding: "0 6px",      // ← ADDED
    marginRight: 2,        // ← ADDED
    borderRadius: 0,       // ← ADDED (NO ROUNDING)

    height: "100%",
    border: "1px solid",
    borderColor: active ? "primary.main" : "divider",
    bgcolor: active
      ? theme.palette.action.selected
      : theme.palette.background.paper,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: 13,
    cursor: "pointer",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease, background 0.15s ease",

    "&:hover": {
      borderColor: active ? "primary.main" : "action.hover",
    },
  });

  /* middle-click close */
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
            whiteSpace: "nowrap",
            WebkitOverflowScrolling: "touch",

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
                key={idx}
                data-active-tab={active ? "true" : "false"}
                sx={getTabSx(active)}
                onClick={() => handleTabChange(null, idx, tab.path)}
                onContextMenu={(e) => handleContextMenuDesktop(e, idx)}
                onMouseDown={(e) => handleMouseDown(e, tab, idx)}
                onTouchStart={(e) => handleTouchStart(e, idx)}
                onTouchEnd={handleTouchEnd}
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
                      "& svg": { fontSize: 14 },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>
            );
          })}

          {/* add tab */}
          <IconButton
            size="small"
            onClick={handleAddTab}
            sx={{ ml: 1, p: 0.25 }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* context menu */}
      <Menu
        anchorEl={contextAnchor}
        open={Boolean(contextAnchor)}
        onClose={closeContextMenu}
      >
        <MenuItem
          disabled={contextTabIndex === 0}
          onClick={handleMenuCloseTab}
        >
          <ListItemIcon>
            <CloseIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Close tab</ListItemText>
        </MenuItem>

        <MenuItem
          disabled={tabs.length <= 1}
          onClick={handleMenuCloseOthers}
        >
          <ListItemIcon>
            <CancelPresentationIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Close others</ListItemText>
        </MenuItem>

        <MenuItem disabled={tabs.length <= 1} onClick={handleMenuCloseAll}>
          <ListItemIcon>
            <ClearAllIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Close all</ListItemText>
        </MenuItem>

        <MenuItem disabled={!contextTab} onClick={handleMenuDuplicate}>
          <ListItemIcon>
            <FilterNoneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
