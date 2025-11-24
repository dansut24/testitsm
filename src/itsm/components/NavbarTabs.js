// NavbarTabs.js
import React, { useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

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
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const scrollRef = useRef(null);
  const tabHeight = 40;

  // Scroll active tab into view when tabIndex changes
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeEl = container.querySelector('[data-active="true"]');
    if (!activeEl) return;
    activeEl.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [tabIndex, tabs.length]);

  const onTabClick = (idx) => {
    const tab = tabs[idx];
    if (!tab) return;
    handleTabChange(null, idx, tab.path);
  };

  const onClose = (e, idx) => {
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
        overflow: "hidden", // <- stops the bar from widening the page
      }}
    >
      {/* Left: sidebar trigger / burger etc. */}
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

      {/* Center: tabs (fixed width area, internal horizontal scroll) */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          minWidth: 0,
          overflowX: "auto", // scrollbar INSIDE this area
          overflowY: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "stretch",
            height: "100%",
            width: "max-content", // only as wide as needed, scrolls inside
          }}
        >
          {tabs.map((tab, idx) => {
            const active = idx === tabIndex;
            return (
              <Box
                key={tab.path || idx}
                component="button"
                type="button"
                data-active={active ? "true" : "false"}
                onClick={() => onTabClick(idx)}
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
                  flex: isMobile ? "1 1 auto" : "0 1 160px", // shrinkable on desktop
                  minWidth: isMobile ? 0 : 90,
                  maxWidth: 220,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  "&:hover": {
                    backgroundColor: active
                      ? theme.palette.action.hover
                      : theme.palette.action.hover,
                  },
                }}
              >
                {/* favicon / icon */}
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

                {/* close icon (skip first if you want it pinned) */}
                {idx !== 0 && (
                  <IconButton
                    size="small"
                    onClick={(e) => onClose(e, idx)}
                    sx={{
                      p: 0,
                      ml: 0.25,
                      flexShrink: 0,
                      opacity: 0.7,
                      "&:hover": {
                        opacity: 1,
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Right: +tab and profile/notifications etc. */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 1,
          borderLeft: 1,
          borderColor: "divider",
          flexShrink: 0,
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.02)"
              : "rgba(0,0,0,0.01)",
        }}
      >
        <Tooltip title="New tab">
          <IconButton
            size="small"
            onClick={handleAddTab}
            sx={{ p: 0.5 }}
          >
            <AddIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Tooltip>

        {!isMobile && (
          <>
            <Tooltip title="Search">
              <IconButton size="small" sx={{ p: 0.5 }}>
                <SearchIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton size="small" sx={{ p: 0.5 }}>
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Profile">
              <IconButton size="small" sx={{ p: 0.5 }}>
                {/* you can swap to real avatar if you like */}
                <AccountCircleIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  );
}
