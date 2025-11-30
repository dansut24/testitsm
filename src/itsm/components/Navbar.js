// Navbar.js
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
  Button,
  Menu,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { useThemeMode } from "../../common/context/ThemeContext";
import { useNavigate } from "react-router-dom";

import NotificationDrawer from "./NotificationDrawer";
import UserActivityLogDrawer from "./UserActivityLogDrawer";
import ProfileDrawer from "./ProfileDrawer";

const drawerLabels = {
  profile: "Profile",
  notifications: "Notifications",
  activity: "Activity Log",
  help: "Help",
  settings: "Settings",
};

const Navbar = ({ sidebarWidth, collapsedWidth, sidebarOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { mode, setMode } = useThemeMode();

  const [tabHistory, setTabHistory] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState("profile");

  // Raise New menu state
  const [raiseAnchorEl, setRaiseAnchorEl] = useState(null);
  const openRaiseMenu = Boolean(raiseAnchorEl);

  const storedUser = useMemo(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : { username: "User", avatar_url: "" };
  }, []);

  const goBack = () => {
    if (!tabHistory.length) return;
    const nextHistory = [...tabHistory];
    const previousTab = nextHistory.pop();
    setTabHistory(nextHistory);
    if (previousTab?.path) navigate(previousTab.path);
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

  const handleRaiseClick = (event) => setRaiseAnchorEl(event.currentTarget);
  const handleRaiseClose = () => setRaiseAnchorEl(null);

  const handleRaiseSelect = (type) => {
    console.log("Raised new:", type);
    // Navigate to the correct page for each type
    switch (type) {
      case "Incident":
        navigate("/raise/incident");
        break;
      case "SR":
        navigate("/raise/sr");
        break;
      case "Change":
        navigate("/raise/change");
        break;
      default:
        break;
    }
    handleRaiseClose();
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
            <Typography variant="h6" gutterBottom>
              Help & Support
            </Typography>
            <Typography variant="body2">
              Search the knowledge base, raise a ticket, or contact support.
            </Typography>
          </Box>
        );
      case "settings":
        return (
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              Settings
            </Typography>
            <Typography variant="body2">
              Configure theme, layout, and personal preferences here.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  const iconButtonSx = {
    color: "white",
    mx: 0.25,
    "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={2}
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
        <Toolbar
          variant="dense"
          sx={{
            px: 1,
            minHeight: 48,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* Logo + Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            <img src="/logo192.png" alt="Logo" style={{ height: 24, borderRadius: 4 }} />
            {!isMobile && (
              <Typography
                variant="subtitle1"
                noWrap
                sx={{ fontSize: 15, color: "#fff", fontWeight: 600, letterSpacing: 0.3 }}
              >
                Hi5Tech ITSM
              </Typography>
            )}
          </Box>

          {/* Spacer */}
          <Box flexGrow={1} />

          {/* Search */}
          <Tooltip title="Search">
            <IconButton
              size="small"
              sx={{ ...iconButtonSx, ...(isMobile && { mx: 0 }) }}
              aria-label="Search"
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Raise New Dropdown */}
          <Box sx={{ ml: 1 }}>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              onClick={handleRaiseClick}
              endIcon={<ArrowDropDownIcon />}
              sx={{
                minWidth: 120,
                fontSize: "0.75rem",
                px: 1,
                py: 0.5,
                ...(isMobile && { minWidth: 100, fontSize: "0.7rem" }),
              }}
            >
              Raise New...
            </Button>
            <Menu
              anchorEl={raiseAnchorEl}
              open={openRaiseMenu}
              onClose={handleRaiseClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={() => handleRaiseSelect("Incident")}>Incident</MenuItem>
              <MenuItem onClick={() => handleRaiseSelect("SR")}>SR</MenuItem>
              <MenuItem onClick={() => handleRaiseSelect("Change")}>Change</MenuItem>
            </Menu>
          </Box>

          {/* Back Button */}
          <Tooltip title={tabHistory.length ? "Go Back" : "No previous tab"}>
            <span>
              <IconButton
                size="small"
                sx={{
                  ...iconButtonSx,
                  opacity: tabHistory.length ? 1 : 0.35,
                  cursor: tabHistory.length ? "pointer" : "default",
                }}
                onClick={tabHistory.length ? goBack : undefined}
                aria-label="Go back"
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          {/* Theme Selector */}
          <Tooltip title="Theme">
            <Box sx={{ mx: 1, display: "flex", alignItems: "center" }}>
              <Select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                size="small"
                variant="standard"
                disableUnderline
                sx={{
                  fontSize: "0.75rem",
                  color: "white",
                  minWidth: 80,
                  "& .MuiSelect-select": {
                    py: 0.25,
                    px: 1,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.4)",
                  },
                  "& .MuiSelect-icon": { color: "white" },
                }}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="ocean">Ocean</MenuItem>
                <MenuItem value="sunset">Sunset</MenuItem>
                <MenuItem value="forest">Forest</MenuItem>
              </Select>
            </Box>
          </Tooltip>

          {/* Right Icons / Avatar */}
          {["activity", "help", "settings", "notifications", "profile"].map(
            (type) => (
              <Tooltip
                key={type}
                title={drawerLabels[type] || type[0].toUpperCase() + type.slice(1)}
              >
                <IconButton
                  size="small"
                  sx={iconButtonSx}
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
                        sx={{ width: 28, height: 28, fontSize: 14 }}
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
            width: isMobile ? "100%" : 360,
            height: isMobile ? "55%" : "100%",
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
            alignItems: "center",
            justifyContent: "space-between",
            px: 1.5,
            py: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {drawerLabels[drawerType] || "Panel"}
          </Typography>
          <IconButton onClick={closeDrawer} aria-label="Close drawer" size="small">
            <CloseIcon fontSize="small" />
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
