// src/itsm/layout/NavbarTabs.js
import React, { useRef } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const NavbarTabs = ({
  tabs,
  tabIndex,
  handleTabChange,
  handleTabClose,
  handleTabReorder, // not used yet, but kept for API compatibility
  isMobile,
}) => {
  const scrollRef = useRef(null);

  const scrollByAmount = (delta) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  const showArrows = !isMobile; // desktop only

  const onTabClick = (index, path) => {
    handleTabChange(null, index, path);
  };

  const onNewTab = () => {
    // your Layout controls what happens when a new route is opened;
    // for now we just navigate to dashboard if you decide to hook it.
    handleTabChange(null, 0, "/dashboard");
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
        px: 0.5,
      }}
    >
      {showArrows && (
        <IconButton
          size="small"
          onClick={() => scrollByAmount(-120)}
          sx={{ flexShrink: 0, mr: 0.5 }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
        </IconButton>
      )}

      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = index === tabIndex;
          return (
            <Box
              key={tab.path}
              onClick={() => onTabClick(index, tab.path)}
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.2,
                borderRight: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: isActive ? "background.paper" : "action.hover",
                borderBottom: isActive ? "2px solid primary.main" : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                minWidth: 0,
                maxWidth: 220,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 12,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {tab.label}
              </Typography>

              {/* Close icon (not for first / Dashboard tab) */}
              {index !== 0 && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTabClose(tab.path);
                  }}
                  sx={{ ml: 0.5, p: 0.25 }}
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </IconButton>
              )}
            </Box>
          );
        })}
      </Box>

      {/* New tab button – stays at the end, never pushes content right */}
      <IconButton
        size="small"
        onClick={onNewTab}
        sx={{ flexShrink: 0, ml: 0.25 }}
      >
        <AddIcon sx={{ fontSize: 16 }} />
      </IconButton>

      {showArrows && (
        <IconButton
          size="small"
          onClick={() => scrollByAmount(120)}
          sx={{ flexShrink: 0, ml: 0.25 }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
        </IconButton>
      )}
    </Box>
  );
};

export default NavbarTabs;
