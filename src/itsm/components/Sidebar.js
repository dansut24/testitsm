import React, { useState } from "react";
import {
  Box,
  SwipeableDrawer,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";

const expandedWidth = 256;
const collapsedWidth = 48;

const Sidebar = ({
  sidebarOpen,
  mobileOpen,
  handleSidebarToggle,
  handleMobileSidebarToggle,
  sidebarWidth,
  collapsedWidth,
  isMobile,
  tabs,
  handleTabChange,
  tabIndex,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (text) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [text]: !prev[text],
    }));
  };

  const closeAllDropdowns = () => setOpenDropdowns({});

  const menuItems = [
    {
      text: "Dashboard",
      path: "/dashboard",
    },
    {
      text: "Incidents",
      path: "/incidents",
      children: [
        { text: "View Incidents", path: "/incidents/view" },
        { text: "Raise Incident", path: "/incidents/raise" },
      ],
    },
    {
      text: "Profile",
      path: "/profile",
    },
  ];

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: sidebarOpen || isMobile ? "flex-end" : "center",
          px: 1,
          minHeight: "34.6px",
        }}
      >
        <IconButton
          onClick={isMobile ? handleMobileSidebarToggle : handleSidebarToggle}
          sx={{ color: theme.palette.common.white }}
        >
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
          backgroundColor: "transparent",
          color: theme.palette.text.primary,
        }}
      >
        <List>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.text}>
              <ListItem
                button
                onClick={() => {
                  if (item.children) toggleDropdown(item.text);
                  else if (item.path) {
                    handleTabChange(null, tabs.findIndex(t => t.path === item.path), item.path);
                    if (isMobile) handleMobileSidebarToggle();
                    closeAllDropdowns();
                  }
                }}
                selected={location.pathname === item.path}
                sx={{
                  flexDirection: sidebarOpen || isMobile ? "row" : "column",
                  justifyContent: "center",
                  alignItems: "center",
                  py: sidebarOpen || isMobile ? 1 : 2,
                }}
              >
                <ListItemText
                  primary={item.text}
                  sx={{
                    ml: sidebarOpen || isMobile ? 1 : 0,
                    fontSize: sidebarOpen || isMobile ? "1rem" : "0.7rem",
                  }}
                />
                {item.children &&
                  (openDropdowns[item.text] ? <ExpandLess /> : <ExpandMore />)}
              </ListItem>

              {item.children && (
                <Collapse in={openDropdowns[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItem
                        button
                        key={child.text}
                        sx={{ pl: 4 }}
                        selected={location.pathname === child.path}
                        onClick={() => {
                          handleTabChange(
                            null,
                            tabs.findIndex(t => t.path === child.path),
                            child.path
                          );
                          if (isMobile) handleMobileSidebarToggle();
                          closeAllDropdowns();
                        }}
                      >
                        <ListItemText primary={child.text} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Mobile profile/search/notifications */}
      {isMobile && (
        <Box sx={{ display: "flex", justifyContent: "space-around", p: 1 }}>
          <ChevronLeftIcon sx={{ cursor: "pointer" }} onClick={handleMobileSidebarToggle} />
          <SearchIcon sx={{ cursor: "pointer" }} />
          <NotificationsIcon sx={{ cursor: "pointer" }} />
          <AccountCircleIcon sx={{ cursor: "pointer" }} />
        </Box>
      )}
    </>
  );

  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="left"
        open={mobileOpen}
        onClose={handleMobileSidebarToggle}
        onOpen={handleMobileSidebarToggle}
      >
        <Box sx={{ width: expandedWidth }}>{drawerContent}</Box>
      </SwipeableDrawer>
    );
  }

  return (
    <Box
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        overflowX: "hidden",
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {drawerContent}
    </Box>
  );
};

export default Sidebar;
