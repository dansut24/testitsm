// Header.js — Gradient + Tabs + Drawer
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Select,
  MenuItem,
  Avatar,
  Tabs,
  Tab,
  SwipeableDrawer,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryIcon from "@mui/icons-material/History";
import CloseSmallIcon from "@mui/icons-material/Close";

import { useThemeMode } from "../../common/context/ThemeContext";

import NotificationDrawer from "./NotificationDrawer";
import UserActivityLogDrawer from "./UserActivityLogDrawer";
import ProfileDrawer from "./ProfileDrawer";

const Header = ({
  tabs,
  tabIndex,
  handleTabChange,
  handleTabClose,
  sidebarOpen,
  collapsedWidth,
  sidebarWidth,
  isMobile,
  handleSidebarToggle,
  handleMobileSidebarToggle,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, setMode } = useThemeMode();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState("profile");

  const [storedUser] = useState(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : { username: "User", avatar_url: "" };
  });

  const openDrawer = (type) => {
    setDrawerType(type);
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const renderDrawerContent = () => {
    const content = {
      profile: <ProfileDrawer onLogout={handleLogout} />,
      notifications: <NotificationDrawer />,
      activity: <UserActivityLogDrawer />,
      help: (
        <>
          <Typography variant="h6">Help</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Search the knowledge base or contact support.
          </Typography>
        </>
      ),
      settings: (
        <>
          <Typography variant="h6">Settings</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Theme, layout, and preferences go here.
          </Typography>
        </>
      ),
    };
    return content[drawerType] || null;
  };

  return (
    <>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          top: 0,
          width: isMobile
            ? "100%"
            : `calc(100% - ${sidebarOpen ? sidebarWidth : collapsedWidth}px)`,
          bgcolor: "transparent",
          background: "linear-gradient(90deg, #4e54c8, #8f94fb, #00c6ff)",
          color: "#fff",
          boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Toolbar variant="dense" sx={{ px: 1, minHeight: 48 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              size="small"
              onClick={isMobile ? handleMobileSidebarToggle : handleSidebarToggle}
              sx={{ color: "#fff" }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>

            <img src="/logo192.png" alt="Logo" style={{ height: 24 }} />
            {!isMobile && (
              <Typography variant="h6" noWrap sx={{ fontSize: 16 }}>
                Hi5Tech ITSM
              </Typography>
            )}
          </Box>

          <Box flexGrow={1} />

          <IconButton size="small" sx={{ color: "#fff" }}>
            <SearchIcon fontSize="small" />
          </IconButton>

          <Tooltip title="Theme">
            <Select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              size="small"
              variant="standard"
              disableUnderline
              sx={{
                fontSize: "0.75rem",
                mx: 1,
                color: "#fff",
                ".MuiSelect-icon": { color: "#fff" },
              }}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">System</MenuItem>
              <MenuItem value="ocean">Ocean</MenuItem>
              <MenuItem value="sunset">Sunset</MenuItem>
              <MenuItem value="forest">Forest</MenuItem>
            </Select>
          </Tooltip>

          {["activity", "help", "settings", "notifications", "profile"].map(
            (type) => (
              <Tooltip key={type} title={type[0].toUpperCase() + type.slice(1)}>
                <IconButton size="small" onClick={() => openDrawer(type)} sx={{ color: "#fff" }}>
                  {{
                    activity: <HistoryIcon fontSize="small" />,
                    help: <HelpOutlineIcon fontSize="small" />,
                    settings: <SettingsIcon fontSize="small" />,
                    notifications: <NotificationsNoneIcon fontSize="small" />,
                    profile: (
                      <Avatar
                        src={
                          storedUser.avatar_url?.startsWith("http")
                            ? storedUser.avatar_url
                            : ""
                        }
                        sx={{ width: 28, height: 28 }}
                      >
                        {storedUser.username?.[0]?.toUpperCase() || "U"}
                      </Avatar>
                    ),
                  }[type]}
                </IconButton>
              </Tooltip>
            )
          )}
        </Toolbar>

        {/* Tabs */}
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 36,
            height: 36,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0))",
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          {tabs.map((tab, i) => (
            <Tab
              key={tab.path}
              disableRipple
              label={
                <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
                  {tab.label}
                  {tab.path !== "/dashboard" && (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTabClose(tab.path);
                      }}
                      size="small"
                      sx={{ ml: 0.5, opacity: 1, color: "#fff" }}
                    >
                      <CloseSmallIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              }
              sx={{
                minHeight: 36,
                height: 36,
                fontSize: 13,
                px: 1.5,
                textTransform: "none",
                borderRadius: "8px 8px 0 0",
                border: "1px solid rgba(255,255,255,0.3)",
                borderBottom: tabIndex === i ? "none" : "1px solid rgba(255,255,255,0.3)",
                bgcolor: tabIndex === i ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                color: "#fff",
                mr: -1,
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
              }}
            />
          ))}
        </Tabs>
      </AppBar>

      {/* Drawer for Profile/Notifications/Activity */}
      <SwipeableDrawer
        anchor={isMobile ? "bottom" : "right"}
        open={drawerOpen}
        onClose={closeDrawer}
        onOpen={() => {}}
        disableDiscovery={!isMobile}
        disableSwipeToOpen={!isMobile}
        PaperProps={{
          sx: {
            position: "fixed",
            zIndex: (theme) => theme.zIndex.appBar + 10,
            width: isMobile ? "100%" : 320,
            height: isMobile ? "50%" : "100%",
            bottom: isMobile ? 0 : "auto",
            right: !isMobile ? 0 : "auto",
            top: !isMobile ? 0 : "auto",
            px: 2,
            pt: 0,
            pb: 2,
            display: "flex",
            flexDirection: "column",
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0,
          },
        }}
      >
        {renderDrawerContent()}
      </SwipeableDrawer>
    </>
  );
};

export default Header;
