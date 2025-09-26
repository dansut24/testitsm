// Sidebar.js
import React, { useState } from "react";
import {
  Box,
  SwipeableDrawer,
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

const expandedWidth = 240;
const collapsedWidth = 48;

const Sidebar = ({
  sidebarOpen,
  mobileOpen,
  handleSidebarToggle,
  handleMobileSidebarToggle,
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
    setOpenDropdowns((prev) => ({ ...prev, [text]: !prev[text] }));
  };

  // Sidebar content shared for desktop & mobile
  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Menu list */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
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
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 1.5,
                  "& .MuiSvgIcon-root": {
                    fontSize: sidebarOpen || isMobile ? "1.6rem" : "1.3rem",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    color: theme.palette.text.primary,
                    mb: 0.5,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {sidebarOpen || isMobile ? (
                  <>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: sidebarOpen ? "0.75rem" : "0.7rem",
                        textAlign: "center",
                      }}
                    >
                      {item.text}
                    </Typography>
                    {item.children &&
                      (openDropdowns[item.text] ? <ExpandLess /> : <ExpandMore />)}
                  </>
                ) : (
                  <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
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

      {/* Collapse/Expand toggle (desktop only) */}
      {!isMobile && (
        <Box
          sx={{
            p: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: "center",
          }}
        >
          <IconButton onClick={handleSidebarToggle}>
            {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
      )}
    </Box>
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
            top: 34, // below Navbar
            height: "calc(100% - 34px)",
            width: expandedWidth,
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
