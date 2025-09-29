// src/itsm/components/Sidebar.js
import React from "react";
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

const COLLAPSED_BG = "#f8f9fa"; // same as navbar grey

const shortLabelMap = {
  "Service Requests": "SR",
  "Knowledge Base": "KB",
  // add more abbreviations if you want:
  // "Dashboard": "Dash",
  // "Settings": "Prefs",
};

const Sidebar = ({
  pinned,                // true = expanded, false = collapsed
  onToggle,              // click on logo to toggle
  items,                 // [{ label, icon }]
  onItemClick,           // (label) => void
  widthExpanded = 260,
  widthCollapsed = 48,
}) => {
  const isCollapsed = !pinned;
  const width = isCollapsed ? widthCollapsed : widthExpanded;

  const renderCollapsedText = (label) => shortLabelMap[label] || label;

  return (
    <Box
      sx={{
        width,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "width 0.3s ease",
      }}
    >
      {/* Top logo/header bar (matches navbar styling) */}
      <Box
        sx={{
          height: 48,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          px: 1,
          bgcolor: COLLAPSED_BG,
          borderBottom: "4px solid #ffffff",
          // ensure the thin right outline doesn't show on the header strip
          // while keeping the overall sidebar's right border
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

      {/* Menu list */}
      <List
        sx={{
          flex: 1,
          py: 1,
          px: isCollapsed ? 0 : 1,
          overflowY: "auto",
        }}
      >
        {items.map(({ label, icon }) => {
          const content = (
            <ListItemButton
              key={label}
              onClick={() => onItemClick(label)}
              sx={{
                minHeight: 52,
                px: isCollapsed ? 0 : 2,
                flexDirection: isCollapsed ? "column" : "row",
                justifyContent: isCollapsed ? "center" : "flex-start",
                alignItems: "center",
                gap: isCollapsed ? 0.25 : 0,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isCollapsed ? 0 : 2,
                  justifyContent: "center",
                }}
              >
                {icon}
              </ListItemIcon>

              {isCollapsed ? (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    mt: 0.25,
                    textAlign: "center",
                    maxWidth: widthCollapsed - 6, // avoid overflow
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {renderCollapsedText(label)}
                </Typography>
              ) : (
                <ListItemText primary={label} />
              )}
            </ListItemButton>
          );

          // Helpful tooltip in collapsed mode
          return isCollapsed ? (
            <Tooltip key={label} title={label} placement="right">
              <Box>{content}</Box>
            </Tooltip>
          ) : (
            content
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
