// Sidebar.js
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
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import AssignmentIcon from "@mui/icons-material/Assignment";
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
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState({});

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {
      text: "Incidents",
      icon: <ReportProblemIcon />,
      children: [
        { text: "View Incidents", path: "/incidents" },
        { text: "Raise Incident", path: "/new-incident" },
      ],
    },
    {
      text: "Service Requests",
      icon: <AssignmentIcon />,
      children: [
        { text: "View Requests", path: "/service-requests" },
        { text: "Raise Request", path: "/new-service-request" },
      ],
    },
  ];

  const toggleDropdown = (text) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [text]: !prev[text],
    }));
  };

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: sidebarOpen || isMobile ? "flex-end" : "center",
          px: 1,
          minHeight: "34px",
        }}
      >
        {!isMobile && (
          <IconButton
            onClick={handleSidebarToggle}
            sx={{ color: theme.palette.common.white }}
          >
            {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
      </Toolbar>

      <Box
        sx={{
          overflowY: "auto",
          flexGrow: 1,
          backgroundColor: theme.palette.background.paper,
          "&::-webkit-scrollbar": { width: 0, height: 0 },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem
                button
                onClick={() => {
                  if (item.children) {
                    toggleDropdown(item.text);
                  } else if (item.path) {
                    navigate(item.path);
                    if (isMobile) handleMobileSidebarToggle();
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
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: sidebarOpen || isMobile ? 2 : 0,
                    justifyContent: "center",
                    color: theme.palette.text.primary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {sidebarOpen || isMobile ? (
                  <>
                    <ListItemText primary={item.text} />
                    {item.children &&
                      (openDropdowns[item.text] ? <ExpandLess /> : <ExpandMore />)}
                  </>
                ) : (
                  <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                    {item.text}
                  </Typography>
                )}
              </ListItem>
              {item.children && (
                <Collapse in={openDropdowns[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItem
                        button
                        key={child.text}
                        selected={location.pathname === child.path}
                        onClick={() => {
                          navigate(child.path);
                          if (isMobile) handleMobileSidebarToggle();
                        }}
                        sx={{ pl: 4 }}
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
            width: expandedWidth,
            backgroundColor: theme.palette.background.paper,
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
        width: sidebarOpen ? expandedWidth : collapsedWidth,
        height: "100vh",
        bgcolor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
      }}
    >
      {drawerContent}
    </Box>
  );
};

export default Sidebar;
