// NavbarTabs.js — combined top bar + tabs
import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Tooltip, Select, MenuItem, Tabs, Tab } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";

const NavbarTabs = ({
  sidebarOpen,
  sidebarWidth,
  collapsedWidth,
  tabs,
  tabIndex,
  handleTabChange,
  handleTabClose,
  tabHistory,
  openDrawer,
  storedUser,
  mode,
  setMode,
  isMobile,
}) => {
  const leftOffset = isMobile ? 0 : `${sidebarOpen ? sidebarWidth : collapsedWidth}px`;
  const widthCalc = isMobile ? "100%" : `calc(100% - ${sidebarOpen ? sidebarWidth : collapsedWidth}px)`;

  return (
    <>
      {/* Top Navbar */}
      <AppBar
        position="fixed"
        sx={{
          top: 0,
          left: leftOffset,
          width: widthCalc,
          height: 34.6,
          bgcolor: "primary.main",
          zIndex: (theme) => theme.zIndex.drawer + 2,
          px: 1,
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 34.6, pt: 0.875 }}>
          {/* Left: Logo & title */}
          <Box display="flex" alignItems="center" gap={1}>
            <img src="/logo192.png" alt="Logo" style={{ height: 20 }} />
            {!isMobile && (
              <Typography variant="h6" sx={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>
                Hi5Tech ITSM
              </Typography>
            )}
          </Box>

          {/* Spacer */}
          <Box flexGrow={1} />

          {/* Actions */}
          <IconButton size="small" sx={{ color: "white" }}>
            <SearchIcon fontSize="small" />
          </IconButton>

          {tabHistory.length > 0 && (
            <Tooltip title="Go Back">
              <IconButton size="small" sx={{ color: "white" }}>
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
              sx={{
                fontSize: 10,
                color: "white",
                mx: 0.5,
                minWidth: 50,
                ".MuiSelect-icon": { color: "white", fontSize: 14 },
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
          {["activity", "help", "settings", "notifications", "profile"].map((type) => (
            <Tooltip key={type} title={type.charAt(0).toUpperCase() + type.slice(1)}>
              <IconButton size="small" sx={{ color: "white" }}>
                {{
                  activity: <HistoryIcon fontSize="small" />,
                  help: <HelpOutlineIcon fontSize="small" />,
                  settings: <SettingsIcon fontSize="small" />,
                  notifications: <NotificationsNoneIcon fontSize="small" />,
                  profile: (
                    <Avatar
                      src={storedUser.avatar_url?.startsWith("http") ? storedUser.avatar_url : ""}
                      sx={{ width: 22, height: 22 }}
                    >
                      {storedUser.username?.[0]?.toUpperCase() || "U"}
                    </Avatar>
                  ),
                }[type]}
              </IconButton>
            </Tooltip>
          ))}
        </Toolbar>
      </AppBar>

      {/* Tabs Bar */}
      <Box
        position="fixed"
        sx={{
          top: 34.6, // directly under navbar
          left: leftOffset,
          width: widthCalc,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 32,
            height: 32,
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          {tabs.map((tab, i) => (
            <Tab
              key={tab.path}
              disableRipple
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 11 }}>
                  {tab.label}
                  {tab.path !== "/dashboard" && (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTabClose(tab.path);
                      }}
                      size="small"
                      sx={{ p: 0.25 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              }
              sx={{
                minHeight: 32,
                height: 32,
                fontSize: 11,
                px: 1,
                textTransform: "none",
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                border: "1px solid",
                borderColor: "divider",
                borderBottom: tabIndex === i ? "none" : "1px solid",
                bgcolor: tabIndex === i ? "background.paper" : "grey.100",
                zIndex: tabIndex === i ? 2 : 1,
                mr: -1,
                "&:hover": {
                  bgcolor: tabIndex === i ? "background.paper" : "grey.200",
                },
              }}
            />
          ))}
        </Tabs>
      </Box>
    </>
  );
};

export default NavbarTabs;
