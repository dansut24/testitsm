import React from "react";
import { Box, useTheme } from "@mui/material";

const Sidebar = ({
  pinned = true,
  onToggle = () => {},
  items = [],
  onItemClick = () => {},
  widthExpanded = 260,
  widthCollapsed = 48,
  isMobile = false,
}) => {
  const theme = useTheme();
  const width = pinned ? widthExpanded : widthCollapsed;

  return (
    <Box
      sx={{
        width,
        transition: "width 0.3s ease",
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Sidebar Logo / Toggle */}
      <Box
        sx={{
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isMobile ? "default" : "pointer",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
        onClick={() => !isMobile && onToggle()}
        title={isMobile ? undefined : pinned ? "Collapse" : "Expand"}
      >
        <img
          src="https://www.bing.com/sa/simg/favicon-2x.ico"
          alt="Logo"
          style={{ width: 28, height: 28 }}
        />
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flex: 1, p: 1 }}>
        {items.map((label) => (
          <Box
            key={label}
            sx={{
              py: 1,
              px: pinned ? 2 : 1,
              cursor: "pointer",
              fontSize: 14,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              borderRadius: 1,
              "&:hover": { backgroundColor: theme.palette.action.hover },
            }}
            onClick={() => onItemClick(label)}
            title={!pinned ? label : undefined}
          >
            {label}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Sidebar;
