// Sidebar.js
import React from "react";
import { Box, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const Sidebar = ({ pinned, onToggle, items, onItemClick, widthExpanded, widthCollapsed }) => {
  const theme = useTheme();
  const width = pinned ? widthExpanded : widthCollapsed;

  return (
    <Box
      sx={{
        width,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${theme.palette.divider}`,
        transition: "width 0.3s ease",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Logo / toggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: pinned ? "space-between" : "center",
          height: "48px",
          px: 1,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `4px solid ${theme.palette.background.default}`,
          borderRight: "none",
        }}
      >
        <IconButton onClick={onToggle}>
          <img
            src="https://www.bing.com/sa/simg/favicon-2x.ico"
            alt="Logo"
            style={{ width: 28, height: 28 }}
          />
        </IconButton>
        {pinned && (
          <span style={{ fontWeight: "bold", color: theme.palette.text.primary }}>
            MyApp
          </span>
        )}
      </Box>

      {/* Menu */}
      <List dense sx={{ flex: 1 }}>
        {items.map(({ label, icon }) => (
          <ListItem
            button
            key={label}
            onClick={() => onItemClick(label)}
            sx={{
              px: pinned ? 2 : 1,
              justifyContent: pinned ? "flex-start" : "center",
              color: theme.palette.text.primary,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: pinned ? 2 : "auto",
                justifyContent: "center",
                color: theme.palette.text.secondary,
              }}
            >
              {icon}
            </ListItemIcon>
            {pinned && <ListItemText primary={label} />}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
