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
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";

const collapsedWidth = 60;
const drawerWidth = 240;

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

  const closeAllDropdowns = () => setOpenDropdowns({});

  const renderMenuItem = (item, index) => {
    const isSelected = location.pathname === item.path;

    return (
      <Box key={item.text} sx={{ position: "relative" }}>
        <ListItem
          button
          onClick={() => {
            if (item.children) toggleDropdown(item.text);
            else if (item.path) {
              navigate(item.path);
              if (isMobile) handleMobileSidebarToggle();
              closeAllDropdowns();
            }
          }}
          selected={isSelected}
          sx={{
            justifyContent: sidebarOpen || isMobile ? "initial" : "center",
            "&.Mui-selected": {
              backgroundColor: theme.palette.action.selected,
              color: theme.palette.primary.main,
            },
            "&:hover": { backgroundColor: theme.palette.action.hover },
          }}
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
          {(sidebarOpen || isMobile) &&
            item.children &&
            (openDropdowns[item.text] ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>

        {/* Nested children */}
        {item.children && (sidebarOpen || isMobile ? (
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
          // Collapsed pop-out for desktop
          ReactDOM.createPortal(
            <Grow in={openDropdowns[item.text]}>
              <Box
                sx={{
                  position: "fixed",
                  top: `calc(64px + ${index * 48}px)`,
                  left: `${collapsedWidth}px`,
                  bgcolor: theme.palette.background.paper,
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
    );
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar
        sx={{ display: "flex", justifyContent: "flex-end", px: 1 }}
      >
        <IconButton
          onClick={isMobile ? handleMobileSidebarToggle : handleSidebarToggle}
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
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          "&::-webkit-scrollbar": { width: 0, height: 0 },
        }}
      >
        <List>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </List>
      </Box>
    </Box>
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
            bgcolor: theme.palette.background.paper,
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
        transition: "width 0.3s ease",
        zIndex: theme.zIndex.drawer,
      }}
    >
      {drawerContent}
    </Box>
  );
};

export default Sidebar;
