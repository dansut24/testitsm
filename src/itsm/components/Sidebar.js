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
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
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
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          px: 1,
        }}
      >
        <IconButton
          onClick={isMobile ? handleMobileSidebarToggle : handleSidebarToggle}
          sx={{ color: theme.palette.text.primary }}
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
          backgroundColor: "#1F2A40", // Professional dark sidebar
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
                    justifyContent: sidebarOpen || isMobile ? "initial" : "center",
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
                      mr: sidebarOpen || isMobile ? 2 : "auto",
                      justifyContent: "center",
                      color: "#FFFFFF",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {(sidebarOpen || isMobile) && <ListItemText primary={item.text} />}
                  {(sidebarOpen || isMobile) && item.children && (
                    openDropdowns[item.text] ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItem>

                {item.children && (
                  (sidebarOpen || isMobile) ? (
                    <Collapse in={openDropdowns[item.text]} timeout="auto" unmountOnExit>
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
                            top: `calc(64px + ${index * 48}px)`,
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
                  )
                )}
              </Box>
            </React.Fragment>
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

  return (
    <Box
      sx={{
        width: sidebarWidth,
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
        transition: "transform 0.3s ease",
        zIndex: theme.zIndex.drawer,
      }}
    >
      {drawerContent}
    </Box>
  );
};

export default Sidebar;
