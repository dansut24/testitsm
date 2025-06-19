// src/control/components/Sidebar.js
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useMediaQuery,
  useTheme,
  Box,
  Divider,
  Typography,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import DevicesIcon from "@mui/icons-material/Devices";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";

const menuItems = [
  { label: "Home", path: "/", icon: <HomeIcon /> },
  { label: "Devices", path: "/devices", icon: <DevicesIcon /> },
  { label: "Reports", path: "/reports", icon: <BarChartIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const drawerWidth = collapsed ? 70 : 240;

  const drawer = (
    <Box
      sx={{
        width: drawerWidth,
        backgroundColor: "#1f2937",
        height: "100%",
        color: "#fff",
        transition: "width 0.3s",
        boxShadow: "2px 0 8px rgba(0,0,0,0.2)",
        borderRight: "1px solid #374151",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar sx={{ justifyContent: collapsed ? "center" : "space-between", px: 2 }}>
        {!collapsed && <Typography variant="h6">HI5Tech</Typography>}
        <IconButton
          size="small"
          onClick={() => setCollapsed(!collapsed)}
          sx={{ color: "#fff" }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider sx={{ borderColor: "#374151" }} />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map(({ label, path, icon }) => {
          const selected = location.pathname === path;
          const color = selected ? "#38bdf8" : "#fff";
          return (
            <Tooltip title={collapsed ? label : ""} placement="right" key={path}>
              <ListItem
                button
                component={Link}
                to={path}
                selected={selected}
                sx={{
                  color,
                  "&.Mui-selected": {
                    backgroundColor: "#374151",
                    color: "#38bdf8",
                  },
                }}
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <ListItemIcon sx={{ color }}>{icon}</ListItemIcon>
                {!collapsed && <ListItemText primary={label} />}
              </ListItem>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={() => setMobileOpen(!mobileOpen)}
          sx={{
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: 1301,
            backgroundColor: "#1f2937",
            color: "#fff",
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#1f2937",
            transition: "width 0.3s",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar;
