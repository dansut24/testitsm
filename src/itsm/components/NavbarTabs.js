// NavbarTabs.js
import React from "react";
import {
  Box,
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

  const handleTabClick = (idx) => {
    const tab = tabs[idx];
    if (!tab) return;
    handleTabChange(null, idx, tab.path);
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
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        height: tabHeight,
        display: "grid",
        gridTemplateColumns: navTrigger ? "auto 1fr auto" : "1fr auto",
        alignItems: "stretch",
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: theme.palette.background.paper,
        boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.04)",
        zIndex: 1,
        overflow: "hidden", // the row itself never exceeds its container
      }}
    >
      {/* LEFT: sidebar trigger */}
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

      {/* CENTER: tabs + + (scrollable area) */}
      <Box
        sx={{
          minWidth: 0, // grid column can shrink
          overflow: "hidden", // no bleed; internal scroll instead
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Scrollable strip with tabs + + */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            overflowX: "auto",
            overflowY: "hidden",
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "inline-flex", // width = content; parent scrolls
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
                    flex: "0 0 auto", // each tab takes its own width
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

                  {/* close (skip first to "pin" it) */}
                  {idx !== 0 && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleClose(e, idx)}
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

            {/* + button IMMEDIATELY after last tab */}
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
                <IconButton
                  size="small"
                  onClick={handleAddTab}
                  sx={{
                    p: 0.5,
                    borderRadius: "999px",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <AddIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* RIGHT: fixed icons, never move */}
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
