// src/itsm/components/Sidebar.js
import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

const Sidebar = ({
  pinned,
  onToggle,
  items,
  onItemClick,
  widthExpanded,
  widthCollapsed,
}) => {
  const isCollapsed = !pinned;

  return (
    <Box
      sx={{
        width: isCollapsed ? widthCollapsed : widthExpanded,
        transition: "width 0.3s ease",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: isCollapsed ? "center" : "stretch",
      }}
    >
      <List sx={{ flex: 1, py: 1 }}>
        {items.map((item) => (
          <ListItem
            key={item.label}
            disablePadding
            sx={{ display: "block" }}
          >
            <ListItemButton
              onClick={() => onItemClick(item.label)}
              sx={{
                minHeight: 48,
                px: isCollapsed ? 0 : 2.5,
                flexDirection: isCollapsed ? "column" : "row",
                justifyContent: isCollapsed ? "center" : "flex-start",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isCollapsed ? 0 : 2,
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>

              {!isCollapsed ? (
                <ListItemText primary={item.label} />
              ) : (
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.65rem", mt: 0.5, textAlign: "center" }}
                >
                  {item.label}
                </Typography>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
