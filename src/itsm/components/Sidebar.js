// Sidebar.js
import React, { useState } from "react";
import ReactDOM from "react-dom";
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
  Grow,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;
const collapsedWidth = 80; // wider than before to fit icon + text underneath

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
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (text) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [text]: !prev[text],
    }));
  };

  const closeAllDropdowns = () => {
    setOpenDropdowns({});
  };

  const drawerContent = (
    <>
      {/* Header / Toggle */}
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: sidebarOpen || isMobile ? "flex-end" : "center",
          px: 1,
        }}
      >
        <IconButton
          onClick={isMobile ? handleMobileSidebarToggle : handleSidebarToggle}
          sx={{ color: theme.palette.common.white }}
        >
          {sidebarOpen || isMobile ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Toolbar>

      {/* Menu Items */}
      <Box
        sx={{
          overflowY: "auto",
          flexGrow: 1,
          WebkitOverflowScrolling: "touch",
          pr: 1,
          pb: 4,
          backgroundColor: "#1F2A40", // dark professional sidebar
          color: "#FFFFFF",
          "&::-webkit-scrollbar": { width: 0, height: 0 },
        }}
      >
        <List>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.text}>
              <Box
                onMouseEnter={() => {
                  if (!sidebarOpen && !isMobile && item.children) {
                    setOpenDropdowns({ [item.text]: true });
                  }
                }}
                onMouseLeave={() => {
                  if (!sidebarOpen && !isMobile && item.children) {
                    setOpenDropdowns({ [item.text]: false });
                  }
                }}
                sx={{ position: "relative" }}
              >
                <ListItem
                  button
                  onClick={() => {
                    if (item.children) {
                      toggleDropdown(item.text);
                    } else if (item.path) {
                      navigate(item.path);
                      if (isMobile) handleMobileSidebarToggle();
                      closeAllDropdowns();
                    }
                  }}
                  selected={location.pathname === item.path}
                  sx={{
                    flexDirection:
                      sidebarOpen || isMobile ? "row" : "column",
                    justifyContent: "center",
                    alignItems: "center",
                    py: sidebarOpen || isMobile ? 1 : 2,
                    "&.Mui-selected": {
                      backgroundColor: "#2E3B55",
                      color: "#FFFFFF",
                    },
                    "&:hover": {
                      backgroundColor: "#2E3B55",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: sidebarOpen || isMobile ? 2 : 0,
                      justifyContent: "center",
                      color: "#FFFFFF",
                      mb: sidebarOpen || isMobile ? 0 : 0.5,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {sidebarOpen || isMobile ? (
                    <>
                      <ListItemText primary={item.text} />
                      {item.children &&
                        (openDropdowns[item.text] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        ))}
                    </>
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.7rem",
                        lineHeight: 1.2,
                        textAlign: "center",
                        color: "#FFFFFF",
                      }}
                    >
                      {item.text}
                    </Typography>
                  )}
                </ListItem>

                {/* Dropdowns */}
                {item.children &&
                  (sidebarOpen || isMobile ? (
                    <Collapse
                      in={openDropdowns[item.text]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding>
                        {item.children.map((child) => (
                          <ListItem
                            button
                            key={child.text}
                            sx={{ pl: 4 }}
                            selected={location.pathname === child.path}
                            onClick={() => {
                              navigate(child.path);
                              if (isMobile) handleMobileSidebarToggle();
                              closeAllDropdowns();
                            }}
                          >
                            <ListItemText primary={child.text} />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  ) : (
                    ReactDOM.createPortal(
                      <Grow in={openDropdowns[item.text]}>
                        <Box
                          sx={{
                            position: "fixed",
                            top: `calc(64px + ${index * 72}px)`,
                            left: `${collapsedWidth}px`,
                            backgroundColor: "#1F2A40",
                            boxShadow: 4,
                            borderRadius: 1,
                            zIndex: theme.zIndex.modal + 10,
                            minWidth: 180,
                            transformOrigin: "left top",
                          }}
                        >
                          <List dense>
                            {item.children.map((child) => (
                              <ListItem
                                button
                                key={child.text}
                                onClick={() => {
                                  navigate(child.path);
                                  closeAllDropdowns();
                                }}
                              >
                                <ListItemText primary={child.text} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Grow>,
                      document.body
                    )
                  ))}
              </Box>
            </React.Fragment>
          ))}
        </List>
      </Box>
    </>
  );

  // Mobile drawer
  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="left"
        open={mobileOpen}
        onClose={handleMobileSidebarToggle}
        onOpen={() => {}}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "#1F2A40",
            color: "#FFFFFF",
          },
        }}
      >
        {drawerContent}
      </SwipeableDrawer>
    );
  }

  // Desktop drawer
  return (
    <Box
      sx={{
        width: sidebarOpen ? drawerWidth : collapsedWidth,
        height: "100vh",
        bgcolor: "#1F2A40",
        color: "#FFFFFF",
        borderRight: 1,
        borderColor: "divider",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        zIndex: theme.zIndex.drawer,
      }}
    >
      {drawerContent}
    </Box>
  );
};

export default Sidebar;
