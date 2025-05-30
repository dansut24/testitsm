// src/components/Navbar.js — with logout confirmation

import React, { useState } from "react";
import {
  AppBar, Toolbar, Typography, IconButton, InputBase, useMediaQuery,
  useTheme, Box, Tooltip, Select, MenuItem, Avatar, Drawer, Dialog,
  DialogTitle, DialogContent, DialogActions, Button
} from "@mui/material";
import { useThemeMode } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import NotificationDrawer from "./NotificationDrawer"; // at top

const Navbar = ({
  sidebarWidth,
  collapsedWidth,
  sidebarOpen,
  handleSidebarToggle,
  handleMobileSidebarToggle
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { mode, setMode } = useThemeMode();

  const [searchOpen, setSearchOpen] = useState(false);
  const [tabHistory, setTabHistory] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState("profile");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [storedUser] = useState({ username: "John", avatar_url: "" });

  const goBack = () => {
    if (tabHistory.length > 0) {
      const previousTab = tabHistory.pop();
      setTabHistory([...tabHistory]);
    }
  };

  const openDrawer = (type) => {
    setDrawerType(type);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const renderDrawerContent = () => {
    const content = {
      profile: (
        <>
          <Typography variant="h6">Profile</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Name: {storedUser.username}</Typography>
          <Typography variant="body2">Email: john.doe@example.com</Typography>
          <Typography variant="body2">Role: Admin</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" color="error" onClick={() => setLogoutDialogOpen(true)} sx={{ mt: 2 }}>
            Logout
          </Button>
        </>
      ),
      notifications: (
  <NotificationDrawer />
),
      activity: (
        <>
          <Typography variant="h6">Activity Log</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Recent user actions will appear here.</Typography>
        </>
      ),
      help: (
        <>
          <Typography variant="h6">Help</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Search the knowledge base or contact support.</Typography>
        </>
      ),
      settings: (
        <>
          <Typography variant="h6">Settings</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Theme, layout, and preferences go here.</Typography>
        </>
      )
    };
    return content[drawerType] || null;
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          top: 0,
          width: isMobile ? "100%" : `calc(100% - ${sidebarOpen ? sidebarWidth : collapsedWidth}px)`,
          bgcolor: theme.palette.primary.main,
          height: 48,
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        <Toolbar variant="dense" sx={{ px: 1, minHeight: 48 }}>
          <Box display="flex" alignItems="center" gap={1}>
            {isMobile && (
              <IconButton size="small" sx={{ color: "white" }} onClick={handleMobileSidebarToggle}>
                <MenuIcon fontSize="small" />
              </IconButton>
            )}
            <img src="/logo192.png" alt="Logo" style={{ height: 24 }} />
            {!isMobile && (
              <Typography variant="h6" noWrap sx={{ fontSize: 16, color: "#fff" }}>
                Hi5Tech ITSM
              </Typography>
            )}
          </Box>

          <Box flexGrow={1} />

          {isMobile ? (
            <IconButton size="small" sx={{ color: "white" }} onClick={() => setSearchOpen(!searchOpen)}>
              <SearchIcon fontSize="small" />
            </IconButton>
          ) : (
            <>
              <InputBase
                placeholder="Search…"
                sx={{
                  bgcolor: "#ffffff22",
                  color: "white",
                  px: 1,
                  borderRadius: 1,
                  fontSize: 14,
                  width: 180,
                  mr: 1,
                }}
              />
              {tabHistory.length > 0 && (
                <Tooltip title="Go Back">
                  <IconButton size="small" onClick={goBack} sx={{ color: "white" }}>
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Theme">
                <Select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  size="small"
                  variant="standard"
                  disableUnderline
                  sx={{ fontSize: "0.75rem", color: "white", mx: 1, ".MuiSelect-icon": { color: "white" } }}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="ocean">Ocean</MenuItem>
                  <MenuItem value="sunset">Sunset</MenuItem>
                  <MenuItem value="forest">Forest</MenuItem>
                </Select>
              </Tooltip>
            </>
          )}

          {["activity", "help", "settings", "notifications", "profile"].map((type) => (
            <Tooltip key={type} title={type[0].toUpperCase() + type.slice(1)}>
              <IconButton size="small" sx={{ color: "white" }} onClick={() => openDrawer(type)}>
                {{
                  activity: <HistoryIcon fontSize="small" />,
                  help: <HelpOutlineIcon fontSize="small" />,
                  settings: <SettingsIcon fontSize="small" />,
                  notifications: <NotificationsNoneIcon fontSize="small" />,
                  profile: (
                    <Avatar
                      src={storedUser.avatar_url?.startsWith("http") ? storedUser.avatar_url : ""}
                      sx={{ width: 28, height: 28 }}
                    >
                      {storedUser.username?.[0]?.toUpperCase() || "U"}
                    </Avatar>
                  ),
                }[type]}
              </IconButton>
            </Tooltip>
          ))}
        </Toolbar>

        {isMobile && searchOpen && (
          <Box sx={{ px: 2, pb: 1, backgroundColor: theme.palette.primary.main }}>
            <InputBase
              placeholder="Search..."
              fullWidth
              sx={{ bgcolor: "#ffffff", px: 1, py: 0.5, borderRadius: 1, fontSize: 14 }}
            />
          </Box>
        )}
      </AppBar>

      <Drawer
  anchor={isMobile ? "bottom" : "right"}
  open={drawerOpen}
  onClose={closeDrawer}
  ModalProps={{ keepMounted: true }}
  PaperProps={{
    sx: {
      position: "fixed",
      zIndex: (theme) => theme.zIndex.appBar + 10, // Above the navbar
      width: isMobile ? "100%" : 320,
      height: isMobile ? "50%" : "100%",
      bottom: isMobile ? 0 : "auto",
      right: !isMobile ? 0 : "auto",
      top: !isMobile ? 0 : "auto",
      pt: isMobile ? 2 : 6, // Add padding on top to clear navbar
      px: 2,
      display: "flex",
      flexDirection: "column",
      borderTopLeftRadius: isMobile ? 16 : 0,
      borderTopRightRadius: isMobile ? 16 : 0,
    },
  }}
>
  <Box display="flex" justifyContent="flex-end" sx={{ mb: 1 }}>
    <IconButton
      onClick={closeDrawer}
      sx={{
        position: "relative",
        zIndex: (theme) => theme.zIndex.appBar + 11,
      }}
    >
      <CloseIcon />
    </IconButton>
  </Box>
  {renderDrawerContent()}
</Drawer>


      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to log out?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleLogout}>Logout</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
