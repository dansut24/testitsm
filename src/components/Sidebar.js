// src/components/Sidebar.js

import React from "react";
import {
  Box,
  SwipeableDrawer,
  Drawer,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;
const collapsedWidth = 60;

const Sidebar = ({
  sidebarOpen,
  mobileOpen,
  handleSidebarToggle,
  handleMobileSidebarToggle,
  sidebarWidth,
  menuItems,
  isMobile,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          px: 1,
        }}
      >
        <IconButton onClick={isMobile ? handleMobileSidebarToggle : handleSidebarToggle}>
          {sidebarOpen || isMobile ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Toolbar>

      <Box
        sx={{
          overflowY: "auto",
          flexGrow: 1,
          WebkitOverflowScrolling: "touch",
          pr: 1,
          pb: 4,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          "&::-webkit-scrollbar": {
            width: 0,
            height: 0,
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => {
                if (item.path) navigate(item.path);
                if (isMobile) handleMobileSidebarToggle();
              }}
              sx={{
                justifyContent: sidebarOpen || isMobile ? "initial" : "center",
                "&.Mui-selected": {
                  backgroundColor: theme.palette.action.selected,
                  color: theme.palette.primary.main,
                },
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: sidebarOpen || isMobile ? 2 : "auto",
                  justifyContent: "center",
                  color: theme.palette.text.primary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              {(sidebarOpen || isMobile) && <ListItemText primary={item.text} />}
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  );

  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="left"
        open={mobileOpen}
        onClose={handleMobileSidebarToggle}
        onOpen={() => {}}
        disableBackdropTransition={false}
        disableDiscovery={false}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        {drawerContent}
      </SwipeableDrawer>
    );
  }

  return (
    <Box
      sx={{
        width: sidebarWidth,
        height: "100vh",
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderRight: 1,
        borderColor: "divider",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s ease",
        zIndex: (theme) => theme.zIndex.drawer,
      }}
    >
      {drawerContent}
    </Box>
  );
};

export default Sidebar;
