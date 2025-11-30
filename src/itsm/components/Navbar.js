// src/itsm/layout/Navbar.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  Avatar,
  Stack,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NavbarTabs from "./NavbarTabs";

const STATUS_OPTIONS = [
  { key: "Available", color: "success.main" },
  { key: "Busy", color: "error.main" },
  { key: "Away", color: "warning.main" },
  { key: "Offline", color: "text.disabled" },
];

const Navbar = ({ sidebarWidth, collapsedWidth, sidebarOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [userStatus, setUserStatus] = useState(
    () => localStorage.getItem("userStatus") || "Available"
  );
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const username = "User";
  const userInitial = username[0]?.toUpperCase() || "U";

  const getStatusColor = (statusKey) => {
    const opt = STATUS_OPTIONS.find((o) => o.key === statusKey);
    return opt ? opt.color : "text.disabled";
  };

  const getNavbarAvatarSx = (statusKey, size = 24) => {
    const base = {
      width: size,
      height: size,
      fontSize: size * 0.5,
      transition: "all 0.2s ease",
      bgcolor:
        theme.palette.mode === "dark"
          ? theme.palette.grey[800]
          : theme.palette.grey[200],
      color: theme.palette.text.primary,
    };
    switch (statusKey) {
      case "Available":
        return { ...base, border: "2px solid", borderColor: "success.main" };
      case "Busy":
        return { ...base, border: "2px solid", borderColor: "error.main" };
      case "Away":
        return { ...base, border: "2px solid", borderColor: "warning.main" };
      default:
        return { ...base, border: "1px dashed", borderColor: "text.disabled", opacity: 0.6 };
    }
  };

  const handleStatusChange = (statusKey) => {
    setUserStatus(statusKey);
    localStorage.setItem("userStatus", statusKey);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1,
          py: 0.5,
          gap: 1,
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <img src="/logo192.png" alt="Logo" style={{ width: 22, height: 22, borderRadius: 4 }} />
          {!isMobile && (
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13 }}>
              Hi5Tech ITSM
            </Typography>
          )}
        </Box>

        {/* Search */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            px: 1,
            minWidth: 0,
            maxWidth: isMobile ? "100%" : 320,
            bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
            borderRadius: 999,
            height: isMobile ? 32 : 26,
          }}
        >
          <SearchIcon sx={{ mr: 1, opacity: 0.7, fontSize: isMobile ? 20 : 16 }} />
          <InputBase placeholder="Search..." sx={{ width: "100%", fontSize: isMobile ? 13 : 12 }} />
        </Box>

        {/* Right actions */}
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton size="small">
              <NotificationsIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }} onClick={(e) => setStatusMenuAnchor(e.currentTarget)}>
              <Avatar sx={getNavbarAvatarSx(userStatus, 24)}>{userInitial}</Avatar>
            </Box>
            <Menu
              anchorEl={statusMenuAnchor}
              open={Boolean(statusMenuAnchor)}
              onClose={() => setStatusMenuAnchor(null)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.key} selected={userStatus === opt.key} onClick={() => handleStatusChange(opt.key)}>
                  {opt.key}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ minHeight: 30 }}>
        <NavbarTabs tabs={[]} tabIndex={0} handleTabChange={() => {}} handleTabClose={() => {}} handleTabReorder={() => {}} isMobile={isMobile} />
      </Box>
    </Box>
  );
};

export default Navbar;
