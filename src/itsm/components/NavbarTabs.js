// src/itsm/layout/NavbarTabs.js
import React, { useRef, useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

const NavbarTabs = ({
  tabs,
  tabIndex,
  handleTabChange,
  handleTabClose,
  handleTabReorder, // currently unused but kept for future
  handleNewTab,
  isMobile,
}) => {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const updateArrows = () => {
    if (!scrollRef.current || isMobile) {
      setShowLeft(false);
      setShowRight(false);
      return;
    }
    const el = scrollRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
  }, [tabs.length, isMobile]);

  const handleScroll = () => updateArrows();

  const scrollByAmount = (delta) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  const onTabClick = (index, path, el) => {
    handleTabChange(null, index, path);
    // ensure tab comes into view (especially if partially hidden)
    if (scrollRef.current && el) {
      const parentRect = scrollRef.current.getBoundingClientRect();
      const tabRect = el.getBoundingClientRect();
      if (tabRect.left < parentRect.left || tabRect.right > parentRect.right) {
        scrollRef.current.scrollBy({
          left: tabRect.left < parentRect.left
            ? tabRect.left - parentRect.left - 16
            : tabRect.right - parentRect.right + 16,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden", // clamp to navbar width
      }}
    >
      {/* Desktop left scroll arrow */}
      {!isMobile && showLeft && (
        <IconButton
          size="small"
          onClick={() => scrollByAmount(-120)}
          sx={{
            flexShrink: 0,
            borderRight: "1px solid",
            borderColor: "divider",
            borderRadius: 0,
          }}
        >
          {"<"}
        </IconButton>
      )}

      {/* Scrollable tab strip */}
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          overflowX: isMobile ? "auto" : "hidden",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = index === tabIndex;
          let tabEl = null;

          return (
            <Box
              key={tab.path}
              ref={(el) => {
                tabEl = el;
              }}
              onClick={() => onTabClick(index, tab.path, tabEl)}
              sx={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                maxWidth: 220,
                padding: "0 10px",
                borderRight: "1px solid",
                borderColor: "divider",
                borderBottom: isActive ? "2px solid" : "2px solid transparent",
                borderRadius: 0,
                backgroundColor: isActive ? "background.paper" : "action.hover",
                cursor: "pointer",
                whiteSpace: "nowrap",
                minHeight: "100%",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 150,
                }}
              >
                {tab.label}
              </Typography>

              {/* Close button for non-dashboard tabs */}
              {index !== 0 && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTabClose(tab.path);
                  }}
                  sx={{
                    ml: 0.5,
                    p: 0.25,
                    borderRadius: 0,
                  }}
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </IconButton>
              )}
            </Box>
          );
        })}
      </Box>

      {/* + button – always at end, never pushes layout */}
      <IconButton
        size="small"
        onClick={handleNewTab}
        sx={{
          flexShrink: 0,
          borderLeft: "1px solid",
          borderColor: "divider",
          borderRadius: 0,
          width: 32,
        }}
      >
        <AddIcon sx={{ fontSize: 16 }} />
      </IconButton>

      {/* Desktop right scroll arrow */}
      {!isMobile && showRight && (
        <IconButton
          size="small"
          onClick={() => scrollByAmount(120)}
          sx={{
            flexShrink: 0,
            borderLeft: "1px solid",
            borderColor: "divider",
            borderRadius: 0,
          }}
        >
          {">"}
        </IconButton>
      )}
    </Box>
  );
};

export default NavbarTabs;
