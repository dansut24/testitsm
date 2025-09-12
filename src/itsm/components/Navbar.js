// Navbar.js (Refactored)

import React, { useState, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Box,
  Tooltip,
  Select,
  MenuItem,
  Avatar,
  SwipeableDrawer,
} from "@mui/material";
import { useThemeMode } from "../../common/context/ThemeContext";
import { useNavigate } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";

import NotificationDrawer from "./NotificationDrawer";
import UserActivityLogDrawer from "./UserActivityLogDrawer";
import ProfileDrawer from "./ProfileDrawer";

const Navbar = ({
  sidebarWidth,
  collapsedWidth,
  sidebarOpen,
  handleSidebarToggle,
  handleMobileSidebarToggle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { mode, setMode } = useThemeMode();

  const [tabHistory, setTabHistory] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState("profile");

  const storedUser = useMemo(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : { username: "User", avatar_url: "" };
  }, []);

  const goBack = () => {
    if (tabHistory.length > 0) {
      const previousTab = tabHistory.pop();
      setTabHistory([...tabHistory]);
      console.log("Go back to:", previousTab);
    }
  };

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
    switch (drawerType) {
      case "profile":
        return <ProfileDrawer onLogout={handleLogout} />;
      case "notifications":
        return <NotificationDrawer />;
      case "activity":
        return <UserActivityLogDrawer />;
      case "help":
        return (
          <Box p={2}>
            <Typography variant="h6">Help</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Search the knowledge base or contact support.
            </Typography>
          </Box>
        );
      case "settings":
        return (
          <Box p={2}>
            <Typography variant="h6">Settings</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Theme, layout, and preferences go here.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          top: 0,
          width: isMobile
            ? "100%"
            : `calc(100% - ${sidebarOpen ? sidebarWidth : collapsedWidth}px)`,
          bgcolor: theme.palette.primary.main,
          height: 48,
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        <Toolbar variant="dense" sx={{ px: 1, minHeight: 48 }}>
          {/* Left Section */}
          <Box display="flex" alignItems="center" gap={1}>
            {isMobile && (
              <IconButton
                size="small"
                sx={{ color: "white" }}
                onClick={handleMobileSidebarToggle}
                aria-label="Open sidebar"
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            )}
            <img src="/logo192.png" alt="Logo" style={{ height: 24 }} />
            {!isMobile && (
              <Typography
                variant="h6"
                noWrap
                sx={{ fontSize: 16, color: "#fff", fontWeight: 500 }}
              >
                Hi5Tech ITSM
              </Typography>
            )}
          </Box>

          {/* Spacer */}
          <Box flexGrow={1} />

          {/* Actions */}
          <IconButton size="small" sx={{ color: "white" }} aria-label="Search">
            <SearchIcon fontSize="small" />
          </IconButton>

          {tabHistory.length > 0 && (
            <Tooltip title="Go Back">
              <IconButton
                size="small"
                onClick={goBack}
                sx={{ color: "white" }}
                aria-label="Go back"
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Theme Selector */}
          <Tooltip title="Theme">
            <Select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              size="small"
              variant="standard"
              disableUnderline
              sx={{
                fontSize: "0.75rem",
                color: "white",
                mx: 1,
                minWidth: 64,
                ".MuiSelect-icon": { color: "white" },
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

          {/* Right Icons */}
          {["activity", "help", "settings", "notifications", "profile"].map(
            (type) => (
              <Tooltip
                key={type}
                title={type[0].toUpperCase() + type.slice(1)}
              >
                <IconButton
                  size="small"
                  sx={{ color: "white" }}
                  onClick={() => openDrawer(type)}
                  aria-label={type}
                >
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
      </AppBar>

      {/* Drawer */}
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
            display: "flex",
            flexDirection: "column",
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0,
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            px: 1,
            py: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <IconButton onClick={closeDrawer} aria-label="Close drawer">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Drawer Content */}
        <Box sx={{ overflowY: "auto", flexGrow: 1, p: 2 }}>
          {renderDrawerContent()}
        </Box>
      </SwipeableDrawer>
    </>
  );
};

export default Navbar;
