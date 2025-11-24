// NavbarTabs.js
import React from "react";
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  useMediaQuery,
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

  const tabHeight = 40;

  const onChange = (_event, newIndex) => {
    const tab = tabs[newIndex];
    if (!tab) return;
    handleTabChange(null, newIndex, tab.path);
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
        // IMPORTANT: this row itself will never be wider than its parent
        overflow: "hidden",
      }}
    >
      {/* Left: sidebar trigger / burger */}
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

      {/* Middle: tabs area (flexible, shrinkable, scroll inside) */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0, // CRITICAL: allow this flex child to shrink
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Tabs sit in their own scrollable container */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={onChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              flex: 1,
              minWidth: 0,
              height: tabHeight,
              "& .MuiTabs-flexContainer": {
                alignItems: "stretch",
              },
              "& .MuiTabs-scroller": {
                // only this part scrolls horizontally
                overflowX: "auto !important",
              },
              "& .MuiTab-root": {
                minHeight: tabHeight,
                textTransform: "none",
                fontSize: isXs ? 11 : 13,
                px: 1,
                py: 0,
                alignItems: "center",
                justifyContent: "flex-start",
                // these control tab sizing
                minWidth: isXs ? 80 : 110,
                maxWidth: 220,
              },
              "& .MuiTab-root.Mui-selected": {
                fontWeight: 600,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.03)",
              },
              "& .MuiTabs-indicator": {
                height: 2,
                borderRadius: 999,
              },
            }}
          >
            {tabs.map((tab, idx) => (
              <Tab
                key={tab.path || idx}
                disableRipple
                label={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      maxWidth: "100%",
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
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {tab.label}
                    </Box>

                    {/* close icon (skip first tab if you want it pinned) */}
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
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* + button ALWAYS to the right of the last tab, but still inside middle block */}
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            px: 0.5,
            borderLeft: 1,
            borderColor: "divider",
          }}
        >
          <Tooltip title="New tab">
            <IconButton
              size="small"
              onClick={handleAddTab}
              sx={{ p: 0.5 }}
            >
              <AddIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Right: fixed icons (never move) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 1,
          borderLeft: 1,
          borderColor: "divider",
          flexShrink: 0,
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.02)"
              : "rgba(0,0,0,0.01)",
        }}
      >
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
                <AccountCircleIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  );
}
