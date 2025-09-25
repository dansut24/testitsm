// NavbarTabs.js
import React from "react";
import { AppBar, Toolbar, Typography, Box, Tabs, Tab, IconButton, Avatar, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

const NavbarTabs = ({
  tabs,
  tabIndex,
  handleTabChange,
  handleTabClose,
  sidebarOpen,
  sidebarWidth,
  collapsedWidth,
  storedUser,
  mode,
  setMode,
  isMobile,
}) => {
  const navigate = useNavigate();

  const leftOffset = isMobile ? 0 : sidebarOpen ? sidebarWidth : collapsedWidth;
  const widthCalc = isMobile ? "100%" : `calc(100% - ${leftOffset}px)`;

  return (
    <AppBar
      position="fixed"
      sx={{
        top: 0,
        left: leftOffset,
        width: widthCalc,
        bgcolor: "primary.main",
        zIndex: (theme) => theme.zIndex.drawer + 2,
        height: 34.6 + 7, // 34.6px tabs + 7px padding top
        px: 1,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Toolbar variant="dense" sx={{ minHeight: "100%", px: 0 }}>
        {/* Logo & App Name */}
        <Box display="flex" alignItems="center" gap={1} sx={{ mr: 2 }}>
          <img src="/logo192.png" alt="Logo" style={{ height: 24 }} />
          {!isMobile && (
            <Typography variant="subtitle1" fontWeight={500} color="white">
              Hi5Tech ITSM
            </Typography>
          )}
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: "100%",
            height: 34.6,
            "& .MuiTabs-indicator": { display: "none" },
            ".MuiTab-root": {
              minHeight: 34.6,
              height: 34.6,
              fontSize: 12,
              textTransform: "none",
              px: 1,
            },
          }}
        >
          {tabs.map((tab, i) => (
            <Tab
              key={tab.path}
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  {tab.label}
                  {tab.path !== "/dashboard" && (
                    <IconButton
                      size="small"
                      sx={{ p: 0.25 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTabClose(tab.path);
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>

        {/* Spacer */}
        <Box flexGrow={1} />

        {/* Right-side Icons / Profile */}
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            src={storedUser.avatar_url?.startsWith("http") ? storedUser.avatar_url : ""}
            sx={{ width: 28, height: 28 }}
          >
            {storedUser.username?.[0]?.toUpperCase() || "U"}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavbarTabs;
