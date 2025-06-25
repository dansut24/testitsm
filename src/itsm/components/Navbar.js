import React, { useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, IconButton, InputBase, useMediaQuery,
  useTheme, Box, Tooltip, Select, MenuItem, Avatar, SwipeableDrawer,
  Popper, Paper, List, ListItemButton, ListItemText, CircularProgress, InputAdornment
} from "@mui/material";
import { useThemeMode } from "../../common/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

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
  handleMobileSidebarToggle
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { mode, setMode } = useThemeMode();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [tabHistory, setTabHistory] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState("profile");
  const [storedUser] = useState(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : { username: "User", avatar_url: "" };
  });

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        return;
      }

      setLoading(true);

      const [incidents, kb] = await Promise.all([
        supabase.from("incidents")
          .select("id, title")
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`),

        supabase.from("knowledge_base")
          .select("id, title")
          .ilike("title", `%${searchQuery}%`)
      ]);

      const incidentResults = incidents.data?.map((r) => ({
        label: `Incident: ${r.title}`,
        path: `/incidents/${r.id}`
      })) || [];

      const kbResults = kb.data?.map((r) => ({
        label: `KB: ${r.title}`,
        path: `/knowledge-base/${r.id}`
      })) || [];

      setSearchResults([...incidentResults, ...kbResults]);
      setLoading(false);
    };

    fetchResults();
  }, [searchQuery]);

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
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const handleResultClick = (path) => {
    setSearchQuery("");
    setSearchResults([]);
    navigate(path);
  };

  const renderDrawerContent = () => {
    const content = {
      profile: <ProfileDrawer onLogout={handleLogout} />, 
      notifications: <NotificationDrawer />,     
      activity: <UserActivityLogDrawer />,
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

          <Box sx={{ position: "relative" }}>
            <InputBase
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={(e) => setAnchorEl(e.currentTarget)}
              startAdornment={<InputAdornment position="start"><SearchIcon sx={{ color: "white", mr: 1 }} /></InputAdornment>}
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "white",
                pl: 1,
                pr: 1,
                borderRadius: 1,
                fontSize: 14,
                width: 220,
                height: 32,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.3)",
              }}
            />

            {loading && (
              <CircularProgress size={16} sx={{ position: "absolute", top: "50%", right: 8, mt: "-8px", color: "white" }} />
            )}

            {!isMobile && searchResults.length > 0 && (
              <Popper open anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: 1300 }}>
                <Paper elevation={3} sx={{ width: 300, mt: 1 }}>
                  <List dense>
                    {searchResults.map((result, index) => (
                      <ListItemButton key={index} onClick={() => handleResultClick(result.path)}>
                        <ListItemText primary={result.label} />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              </Popper>
            )}
          </Box>

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <Paper sx={{ mt: 1 }}>
                <List dense>
                  {searchResults.map((result, index) => (
                    <ListItemButton key={index} onClick={() => handleResultClick(result.path)}>
                      <ListItemText primary={result.label} />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        )}
      </AppBar>

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
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {isMobile && (
            <Box
              sx={{
                width: 40,
                height: 4,
                bgcolor: "#ccc",
                borderRadius: 2,
                mx: "auto",
                mt: 1,
                mb: 1,
              }}
            />
          )}

          <Box
            sx={{
              flexShrink: 0,
              position: "sticky",
              top: 0,
              zIndex: 2,
              backgroundColor: "background.paper",
              pb: 1,
            }}
          >
            <Box display="flex" justifyContent="flex-end" sx={{ display: isMobile ? "none" : "flex" }}>
              <IconButton
                onClick={closeDrawer}
                sx={{ position: "relative", zIndex: (theme) => theme.zIndex.appBar + 11 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ overflowY: "auto", flexGrow: 1 }}>{renderDrawerContent()}</Box>
        </Box>
      </SwipeableDrawer>
    </>
  );
};

export default Navbar;
