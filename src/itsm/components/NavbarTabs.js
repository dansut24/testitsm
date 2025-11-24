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

  const onChange = (_event, newIndex) => {
    const tab = tabs[newIndex];
    if (!tab) return;
    // keep your existing signature: (event, index, path)
    handleTabChange(null, newIndex, tab.path);
  };

  const onClose = (e, idx) => {
    e.stopPropagation();
    const tab = tabs[idx];
    if (!tab) return;
    handleTabClose(tab.path);

    // Optionally keep the tabs array in sync via handleTabReorder
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
    // immediately activate the new tab
    handleTabChange(null, newTabs.length - 1, newTab.path);
  };

  const tabHeight = 40;

  return (
    <Box
      sx={{
        width: "100%",
        height: tabHeight,
        display: "flex",
        alignItems: "stretch",
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: theme.palette.background.paper,
        boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.04)",
        zIndex: 1,
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

      {/* Center: tabs */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={onChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: tabHeight,
            "& .MuiTabs-flexContainer": {
              alignItems: "stretch",
            },
            "& .MuiTab-root": {
              minHeight: tabHeight,
              textTransform: "none",
              fontSize: isXs ? 12 : 13,
              paddingX: 1.25,
              paddingY: 0,
              alignItems: "center",
              justifyContent: "flex-start",
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
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    maxWidth: "100%",
                  }}
                >
                  {/* favicon / icon (optional) */}
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
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {tab.label}
                  </Box>

                  {/* close icon (keep first tab pinned if you like) */}
                  {idx !== 0 && (
                    <IconButton
                      size="small"
                      sx={{
                        ml: 0.25,
                        padding: 0,
                        opacity: 0.7,
                        "&:hover": {
                          opacity: 1,
                          bgcolor: "transparent",
                        },
                      }}
                      onClick={(e) => onClose(e, idx)}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>
              }
              disableRipple
            />
          ))}
        </Tabs>
      </Box>

      {/* Right: Add tab button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
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
              "& svg": { fontSize: 22 },
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
