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

    // keep array in sync
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
        overflow: "hidden", // <- stops the whole page growing wider
      }}
    >
      {/* Left: sidebar trigger / icon */}
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

      {/* Center: tabs area (fixed width, internal scroll) */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          overflow: "hidden", // important: constrain Tabs to this area
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={onChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            flex: 1,
            minHeight: tabHeight,
            width: "100%",
            "& .MuiTabs-flexContainer": {
              alignItems: "stretch",
            },
            "& .MuiTabs-scroller": {
              overflowX: "auto !important", // scroll inside, not grow page
            },
            "& .MuiTab-root": {
              minHeight: tabHeight,
              textTransform: "none",
              fontSize: isXs ? 11 : 13,
              px: 1,
              py: 0,
              alignItems: "center",
              justifyContent: "flex-start",
              minWidth: isXs ? 72 : 110, // shrinkable tabs
              maxWidth: 200,
              flexShrink: 1, // <- let tabs shrink instead of forcing layout wider
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
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    maxWidth: "100%",
                  }}
                >
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

                  <Box
                    component="span"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {tab.label}
                  </Box>

                  {idx !== 0 && (
                    <IconButton
                      size="small"
                      sx={{
                        ml: 0.25,
                        p: 0,
                        opacity: 0.7,
                        "&:hover": {
                          opacity: 1,
                          bgcolor: "transparent",
                        },
                      }}
                      onClick={(e) => onClose(e, idx)}
                    >
                      <CloseIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  )}
                </Box>
              }
              disableRipple
            />
          ))}
        </Tabs>
      </Box>

      {/* Right: Add tab + profile/notifications/search icons */}
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
            sx={{
              p: 0.5,
            }}
          >
            <AddIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Tooltip>

        {/* Match old behaviour — just visual for now */}
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
