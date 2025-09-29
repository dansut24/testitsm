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
      {/* Top logo/header bar */}
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
          overflowY: isCollapsed ? "hidden" : "auto", // no scrollbars when collapsed
        }}
      >
        {items.map(({ label, icon }) => {
          const content = (
            <ListItemButton
              key={label}
              onClick={() => onItemClick(label)}
              sx={{
                minHeight: 56,
                px: isCollapsed ? 0 : 2,
                flexDirection: isCollapsed ? "column" : "row",
                justifyContent: "center",
                alignItems: "center",
                textAlign: isCollapsed ? "center" : "left",
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
                    lineHeight: 1.1,
                    mt: 0.25,
                    wordBreak: "break-word",  // allow splitting into multiple lines
                    whiteSpace: "normal",
                    textAlign: "center",
                    maxWidth: widthCollapsed - 4,
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
    </Box>
  );
};

export default Sidebar;
