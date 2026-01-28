// src/itsm/components/Navbar.js
import React, { useState, useMemo } from "react";
import {
  Box,
  IconButton,
  Typography,
  InputBase,
  Avatar,
  Stack,
  Menu,
  MenuItem,
  Button,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuIcon from "@mui/icons-material/Menu";

function useGlassTokens(theme) {
  const isDark = theme.palette.mode === "dark";

  return useMemo(() => {
    const border = isDark
      ? "1px solid rgba(255,255,255,0.12)"
      : "1px solid rgba(15,23,42,0.10)";

    const divider = isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.08)";

    const glassBg = isDark
      ? "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))"
      : "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,255,255,0.55))";

    const pillBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(2,6,23,0.04)";
    const pillBorder = isDark
      ? "1px solid rgba(255,255,255,0.10)"
      : "1px solid rgba(15,23,42,0.08)";

    const iconFg = isDark ? "rgba(255,255,255,0.82)" : "rgba(2,6,23,0.74)";

    return { isDark, border, divider, glassBg, pillBg, pillBorder, iconFg };
  }, [isDark]);
}

// This Navbar matches the inline header from Layout and adds a "Raise new…" dropdown
const Navbar = ({
  isMobile,
  sidebarMode,
  username,
  userInitial,
  userStatus,
  statusMenuAnchor,
  setStatusMenuAnchor,
  setDrawerType,
  setMobileSidebarOpen,
  onStatusChange,
}) => {
  const theme = useTheme();
  const t = useGlassTokens(theme);

  const navigate = useNavigate();

  const getStatusColor = (statusKey) => {
    switch (statusKey) {
      case "Available":
        return theme.palette.success.main;
      case "Busy":
        return theme.palette.error.main;
      case "Away":
        return theme.palette.warning.main;
      case "Offline":
      default:
        return theme.palette.text.disabled;
    }
  };

  const getNavbarAvatarSx = (statusKey, size = 24) => {
    const base = {
      width: size,
      height: size,
      fontSize: size * 0.5,
      transition: "all 0.2s ease",
      bgcolor: t.isDark ? "rgba(255,255,255,0.06)" : "rgba(2,6,23,0.04)",
      color: theme.palette.text.primary,
    };

    switch (statusKey) {
      case "Available":
        return {
          ...base,
          border: "2px solid",
          borderColor: "success.main",
          boxShadow: t.isDark
            ? "0 0 0 2px rgba(76,175,80,0.22)"
            : "0 0 0 2px rgba(76,175,80,0.28)",
        };
      case "Busy":
        return {
          ...base,
          border: "2px solid",
          borderColor: "error.main",
          boxShadow: t.isDark
            ? "0 0 0 2px rgba(244,67,54,0.22)"
            : "0 0 0 2px rgba(244,67,54,0.28)",
        };
      case "Away":
        return {
          ...base,
          border: "2px solid",
          borderColor: "warning.main",
          boxShadow: t.isDark
            ? "0 0 0 2px rgba(255,179,0,0.18)"
            : "0 0 0 2px rgba(255,179,0,0.24)",
        };
      case "Offline":
      default:
        return {
          ...base,
          border: "1px dashed",
          borderColor: "text.disabled",
          filter: "grayscale(100%)",
          opacity: 0.65,
        };
    }
  };

  // --- Raise New… menu state ---
  const [raiseAnchorEl, setRaiseAnchorEl] = useState(null);
  const raiseMenuOpen = Boolean(raiseAnchorEl);

  const handleOpenRaiseMenu = (event) => setRaiseAnchorEl(event.currentTarget);
  const handleCloseRaiseMenu = () => setRaiseAnchorEl(null);

  const handleRaiseNavigate = (path) => {
    handleCloseRaiseMenu();
    navigate(path);
  };

  const handleStatusMenuOpen = (event) => setStatusMenuAnchor(event.currentTarget);
  const handleStatusMenuClose = () => setStatusMenuAnchor(null);

  const handleStatusClick = (statusKey) => {
    onStatusChange(statusKey);
    handleStatusMenuClose();
  };

  return (
    <>
      <Box
        sx={{
          height: isMobile ? 52 : 38,
          minHeight: isMobile ? 52 : 38,
          display: "flex",
          alignItems: "center",
          px: 1,
          gap: 1,
          pt: isMobile ? 0.5 : 0,
          background: t.glassBg,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: `1px solid ${t.divider}`,
        }}
      >
        {/* Brand / menu */}
        {!isMobile && sidebarMode === "hidden" ? (
          <IconButton
            onClick={() => setMobileSidebarOpen(true)}
            size="small"
            sx={{ color: t.iconFg }}
            aria-label="Open menu"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
            <img
              src="/logo192.png"
              alt="Logo"
              style={{ width: 22, height: 22, borderRadius: 6 }}
            />
            {!isMobile && (
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 900,
                  letterSpacing: 0.2,
                  fontSize: 13,
                  opacity: 0.92,
                }}
              >
                Hi5Tech ITSM
              </Typography>
            )}
          </Box>
        )}

        {/* Search + info */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 1, mx: 1 }}>
          <Box
            sx={{
              flex: isMobile ? 1 : 0,
              minWidth: 0,
              maxWidth: isMobile ? "100%" : 340,
              display: "flex",
              alignItems: "center",
              background: t.pillBg,
              border: t.pillBorder,
              borderRadius: 999,
              px: isMobile ? 1.1 : 1.1,
              height: isMobile ? 34 : 28,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <SearchIcon sx={{ fontSize: isMobile ? 20 : 16, mr: 1, opacity: 0.7 }} />
            <InputBase
              placeholder="Search…"
              sx={{ fontSize: isMobile ? 13 : 12.5, width: "100%" }}
            />
          </Box>

          {!isMobile && (
            <>
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 999,
                  border: t.pillBorder,
                  background: t.pillBg,
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Typography variant="caption" sx={{ fontSize: 10, opacity: 0.7 }}>
                  Tenant:&nbsp;
                </Typography>
                <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 700 }}>
                  Hi5Tech
                </Typography>
              </Box>

              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 999,
                  background: t.pillBg,
                  border: t.pillBorder,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                  flexShrink: 0,
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main" }} />
                <Typography variant="caption" sx={{ fontSize: 10, opacity: 0.8 }}>
                  All systems operational
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {/* Right actions */}
        {!isMobile ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleOpenRaiseMenu}
              endIcon={<ArrowDropDownIcon />}
              sx={{
                textTransform: "none",
                fontSize: 12,
                borderRadius: 999,
                px: 1.5,
                fontWeight: 900,
              }}
            >
              Raise new
            </Button>

            <IconButton
              size="small"
              onClick={() => setDrawerType("notifications")}
              sx={{ color: t.iconFg }}
              aria-label="Notifications"
            >
              <NotificationsIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.75, cursor: "pointer" }}
              onClick={() => setDrawerType("profile")}
            >
              <Box sx={{ position: "relative" }}>
                <Avatar sx={getNavbarAvatarSx(userStatus, 24)}>{userInitial}</Avatar>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -1,
                    right: -1,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: `2px solid ${t.isDark ? "rgba(10,16,34,0.7)" : "rgba(255,255,255,0.85)"}`,
                    bgcolor: getStatusColor(userStatus),
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="caption" sx={{ lineHeight: 1.2, fontWeight: 800, fontSize: 11 }}>
                  {username}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ lineHeight: 1.1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: getStatusColor(userStatus) }} />
                  <Typography variant="caption" sx={{ color: getStatusColor(userStatus), fontSize: 10 }}>
                    {userStatus}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
            <IconButton size="small" onClick={handleOpenRaiseMenu} sx={{ color: t.iconFg }}>
              <AddCircleOutlineIcon sx={{ fontSize: 22 }} />
            </IconButton>

            <IconButton size="small" onClick={handleStatusMenuOpen} sx={{ color: t.iconFg }}>
              <Box sx={{ position: "relative", display: "flex" }}>
                <AccountCircleIcon sx={{ fontSize: 22, opacity: userStatus === "Offline" ? 0.6 : 1 }} />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: -1,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: `2px solid ${t.isDark ? "rgba(10,16,34,0.7)" : "rgba(255,255,255,0.85)"}`,
                    bgcolor: getStatusColor(userStatus),
                  }}
                />
              </Box>
            </IconButton>

            <Menu
              anchorEl={statusMenuAnchor}
              open={Boolean(statusMenuAnchor)}
              onClose={handleStatusMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              {["Available", "Busy", "Away", "Offline"].map((opt) => (
                <MenuItem key={opt} selected={userStatus === opt} onClick={() => handleStatusClick(opt)}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: getStatusColor(opt) }} />
                    <Typography variant="body2">{opt}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}
      </Box>

      {/* Raise new… menu */}
      <Menu
        anchorEl={raiseAnchorEl}
        open={raiseMenuOpen}
        onClose={handleCloseRaiseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => handleRaiseNavigate("/new-incident")}>Raise Incident</MenuItem>
        <MenuItem onClick={() => handleRaiseNavigate("/new-service-request")}>Raise Service Request</MenuItem>
        <MenuItem onClick={() => handleRaiseNavigate("/new-change")}>Raise Change</MenuItem>
      </Menu>
    </>
  );
};

export default Navbar;
