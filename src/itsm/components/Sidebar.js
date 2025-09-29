// src/itsm/components/Sidebar.js
import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const COLLAPSED_BG = "#f8f9fa";

const Sidebar = ({
  pinned,
  onToggle,
  items,
  onItemClick,
  widthExpanded = 260,
  widthCollapsed = 60, // collapsed sidebar width
}) => {
  const isCollapsed = !pinned;
  const width = isCollapsed ? widthCollapsed : widthExpanded;

  const listRef = useRef(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollState = () => {
    const el = listRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 0);
    setCanScrollDown(el.scrollHeight > el.clientHeight + el.scrollTop + 2);
  };

  useEffect(() => {
    updateScrollState();
    const el = listRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const handleScroll = (dir) => {
    const el = listRef.current;
    if (!el) return;
    const offset = dir === "down" ? 100 : -100;
    el.scrollBy({ top: offset, behavior: "smooth" });
  };

  return (
    <Box
      sx={{
        width,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "width 0.3s ease",
      }}
    >
      {/* Top logo/header bar */}
      <Box
        sx={{
          height: 56,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          px: 1,
          bgcolor: COLLAPSED_BG,
          borderBottom: "4px solid #ffffff",
        }}
      >
        <IconButton onClick={onToggle} size="small">
          <img
            src="https://www.bing.com/sa/simg/favicon-2x.ico"
            alt="Logo"
            style={{ width: 28, height: 28 }}
          />
        </IconButton>
        {!isCollapsed && (
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, mr: 0.5, whiteSpace: "nowrap" }}
          >
            MyApp
          </Typography>
        )}
      </Box>

      {/* Scroll up button (only if overflow) */}
      {isCollapsed && canScrollUp && (
        <IconButton
          size="small"
          onClick={() => handleScroll("up")}
          sx={{
            alignSelf: "center",
            mb: 0.5,
            color: "text.secondary",
          }}
        >
          <ArrowUpwardIcon fontSize="small" />
        </IconButton>
      )}

      {/* Menu list */}
      <List
        ref={listRef}
        sx={{
          flex: 1,
          py: 0.5,
          px: isCollapsed ? 0 : 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {items.map(({ label, icon }) => {
          const content = (
            <ListItemButton
              key={label}
              onClick={() => onItemClick(label)}
              sx={{
                minHeight: isCollapsed ? 52 : 64,
                px: isCollapsed ? 0 : 2,
                flexDirection: isCollapsed ? "column" : "row",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                gap: isCollapsed ? 0.25 : 0,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  justifyContent: "center",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {React.cloneElement(icon, {
                  fontSize: isCollapsed ? "small" : "medium",
                  sx: { mx: "auto" },
                })}
              </ListItemIcon>

              {isCollapsed ? (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.6rem",
                    lineHeight: 1.1,
                    mt: 0.25,
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                    textAlign: "center",
                    maxWidth: widthCollapsed - 6,
                  }}
                >
                  {label}
                </Typography>
              ) : (
                <ListItemText primary={label} />
              )}
            </ListItemButton>
          );

          return isCollapsed ? (
            <Tooltip key={label} title={label} placement="right">
              <Box>{content}</Box>
            </Tooltip>
          ) : (
            content
          );
        })}
      </List>

      {/* Scroll down button (only if overflow) */}
      {isCollapsed && canScrollDown && (
        <IconButton
          size="small"
          onClick={() => handleScroll("down")}
          sx={{
            alignSelf: "center",
            mt: 0.5,
            mb: 0.5,
            color: "text.secondary",
          }}
        >
          <ArrowDownwardIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export default Sidebar;
