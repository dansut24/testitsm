// src/itsm/layout/NavbarTabs.js
import React, { useRef, useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const LONG_PRESS_MS = 550;

const NavbarTabs = ({
  tabs,
  tabIndex,
  handleTabChange,
  handleTabClose,
  handleTabReorder,
  handleNewTab,
  isMobile,
}) => {
  const theme = useTheme();
  const scrollRef = useRef(null);

  const [menuState, setMenuState] = useState({
    anchorEl: null,
    tabIdx: null,
  });

  const longPressTimeoutRef = useRef(null);
  const longPressTargetRef = useRef(null);
  const didLongPressRef = useRef(false);

  const handleOpenMenu = (tabIdx, anchorEl) => {
    setMenuState({
      anchorEl,
      tabIdx,
    });
  };

  const handleCloseMenu = () => {
    setMenuState({
      anchorEl: null,
      tabIdx: null,
    });
  };

  // Desktop right-click menu
  const handleContextMenu = (e, idx) => {
    if (isMobile) return;
    e.preventDefault();
    handleOpenMenu(idx, e.currentTarget);
  };

  // Mobile long-press menu
  const handleTouchStart = (e, idx) => {
    if (!isMobile) return;

    didLongPressRef.current = false;
    longPressTargetRef.current = e.currentTarget;

    longPressTimeoutRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      handleOpenMenu(idx, longPressTargetRef.current);
    }, LONG_PRESS_MS);
  };

  const clearLongPress = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    clearLongPress();
  };

  const handleTouchMove = () => {
    clearLongPress();
  };

  // Clicking a tab
  const onTabClick = (idx, path, e) => {
    // if long-press just fired, don't treat as a normal click
    if (didLongPressRef.current) {
      didLongPressRef.current = false;
      return;
    }
    handleTabChange(e, idx, path);
  };

  const isDashboardTab = (tab, idx) =>
    idx === 0 || tab.path === "/dashboard";

  // Context menu actions
  const handleDuplicateTab = () => {
    if (menuState.tabIdx == null) return;
    const idx = menuState.tabIdx;
    const sourceTab = tabs[idx];
    if (!sourceTab) return;

    const duplicated = { ...sourceTab };
    const newTabs = [
      ...tabs.slice(0, idx + 1),
      duplicated,
      ...tabs.slice(idx + 1),
    ];

    handleTabReorder(newTabs);
    // focus the duplicated tab
    handleTabChange(null, idx + 1, duplicated.path);
    handleCloseMenu();
  };

  const handleCloseThisTab = () => {
    if (menuState.tabIdx == null) return;
    const idx = menuState.tabIdx;
    const tab = tabs[idx];
    if (!tab || isDashboardTab(tab, idx)) {
      handleCloseMenu();
      return;
    }
    handleTabClose(tab.path);
    handleCloseMenu();
  };

  const handleCloseOtherTabs = () => {
    if (menuState.tabIdx == null) return;
    const idx = menuState.tabIdx;
    const current = tabs[idx];
    if (!current) {
      handleCloseMenu();
      return;
    }

    const dashboard = tabs[0];
    let newTabs;

    // Always keep dashboard + current
    if (idx === 0) {
      // current is dashboard → only keep dashboard
      newTabs = [dashboard];
      handleTabReorder(newTabs);
      handleTabChange(null, 0, dashboard.path);
    } else {
      newTabs = [dashboard, current].filter(
        (t, index, arr) =>
          // avoid accidental duplicate if dashboard === current
          index === arr.findIndex((x) => x.path === t.path)
      );

      handleTabReorder(newTabs);
      const newIndex = newTabs.findIndex((t) => t.path === current.path);
      handleTabChange(
        null,
        newIndex === -1 ? 0 : newIndex,
        current.path
      );
    }

    handleCloseMenu();
  };

  const handleCloseAllTabs = () => {
    const dashboard = tabs[0];
    if (!dashboard) {
      handleCloseMenu();
      return;
    }
    const newTabs = [dashboard];
    handleTabReorder(newTabs);
    handleTabChange(null, 0, dashboard.path);
    handleCloseMenu();
  };

  const handleClickNewTab = () => {
    if (handleNewTab) handleNewTab();
    // scroll to right to reveal newest tab
    if (scrollRef.current) {
      const scroller = scrollRef.current;
      scroller.scrollTo({
        left: scroller.scrollWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          height: "100%",
          width: "100%",
          overflow: "hidden", // Prevent pushing layout horizontally
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
            overflowX: "auto",
            overflowY: "hidden",
            whiteSpace: "nowrap",
            WebkitOverflowScrolling: "touch",
            "::-webkit-scrollbar": {
              height: 4,
            },
            "::-webkit-scrollbar-thumb": {
              background:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(0,0,0,0.25)",
              borderRadius: 2,
            },
          }}
        >
          {tabs.map((tab, idx) => {
            const active = idx === tabIndex;
            const showClose = !isDashboardTab(tab, idx);

            return (
              <Box
                key={`${tab.path}-${idx}`}
                onClick={(e) => onTabClick(idx, tab.path, e)}
                onContextMenu={(e) => handleContextMenu(e, idx)}
                onTouchStart={(e) => handleTouchStart(e, idx)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                sx={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 10px",
                  height: "100%",
                  borderRight: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  userSelect: "none",
                  touchAction: "pan-x", // horizontal scroll allowed, avoid text selection
                  backgroundColor: active
                    ? theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.04)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: active
                      ? theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(0,0,0,0.06)"
                      : theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.02)",
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 12,
                    maxWidth: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}
                </Typography>

                {showClose && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTabClose(tab.path);
                    }}
                    sx={{
                      ml: 0.5,
                      p: 0.25,
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>
            );
          })}

          {/* "+" new tab button — always directly after the last tab */}
          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              borderLeft: "1px solid",
              borderColor: "divider",
              px: 0.5,
            }}
          >
            <IconButton
              size="small"
              onClick={handleClickNewTab}
              sx={{
                p: 0.3,
              }}
            >
              <AddIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Context / long-press menu */}
      <Menu
        anchorEl={menuState.anchorEl}
        open={Boolean(menuState.anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={handleDuplicateTab}>Duplicate tab</MenuItem>
        <MenuItem onClick={handleCloseThisTab}>Close tab</MenuItem>
        <MenuItem onClick={handleCloseOtherTabs}>Close other tabs</MenuItem>
        <MenuItem onClick={handleCloseAllTabs}>Close all tabs</MenuItem>
      </Menu>
    </>
  );
};

export default NavbarTabs;
