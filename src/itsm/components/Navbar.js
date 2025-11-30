// src/itsm/layout/Navbar.js
import React, { useState } from "react";
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
  const navigate = useNavigate();

  // Status color helper (mirrors your Layout logic)
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
      bgcolor:
        theme.palette.mode === "dark"
          ? theme.palette.grey[800]
          : theme.palette.grey[200],
      color: theme.palette.text.primary,
    };

    switch (statusKey) {
      case "Available":
        return {
          ...base,
          border: "2px solid",
          borderColor: "success.main",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 0 0 2px rgba(76,175,80,0.25)"
              : "0 0 0 2px rgba(76,175,80,0.35)",
        };
      case "Busy":
        return {
          ...base,
          border: "2px solid",
          borderColor: "error.main",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 0 0 2px rgba(244,67,54,0.35)"
              : "0 0 0 2px rgba(244,67,54,0.45)",
        };
      case "Away":
        return {
          ...base,
          border: "2px solid",
          borderColor: "warning.main",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 0 0 2px rgba(255,179,0,0.25)"
              : "0 0 0 2px rgba(255,179,0,0.35)",
        };
      case "Offline":
      default:
        return {
          ...base,
          border: "1px dashed",
          borderColor: "text.disabled",
          filter: "grayscale(100%)",
          opacity: 0.6,
        };
    }
  };

  // --- Raise New… menu state ---
  const [raiseAnchorEl, setRaiseAnchorEl] = useState(null);
  const raiseMenuOpen = Boolean(raiseAnchorEl);

  const handleOpenRaiseMenu = (event) => {
    setRaiseAnchorEl(event.currentTarget);
  };

  const handleCloseRaiseMenu = () => {
    setRaiseAnchorEl(null);
  };

  const handleRaiseNavigate = (path) => {
    handleCloseRaiseMenu();
    navigate(path);
  };

  const handleStatusMenuOpen = (event) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
  };

  const handleStatusClick = (statusKey) => {
    onStatusChange(statusKey);
    handleStatusMenuClose();
  };

  return (
    <>
      {/* Header row from Layout (logo + search + quick info + actions) */}
      <Box
        sx={{
          height: isMobile ? 52 : 38,
          minHeight: isMobile ? 52 : 38,
          display: "flex",
          alignItems: "center",
          px: 1,
          gap: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          pt: isMobile ? 0.5 : 0,
        }}
      >
        {/* Logo / brand / menu toggle when sidebar is hidden on desktop */}
        {!isMobile && sidebarMode === "hidden" ? (
          <IconButton onClick={() => setMobileSidebarOpen(true)} size="small">
            <MenuIcon fontSize="small" />
          </IconButton>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              flexShrink: 0,
            }}
          >
            <img
              src="/logo192.png"
              alt="Logo"
              style={{ width: 22, height: 22, borderRadius: 4 }}
            />
            {!isMobile && (
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, letterSpacing: 0.3, fontSize: 13 }}
              >
                Hi5Tech ITSM
              </Typography>
            )}
          </Box>
        )}

        {/* Search + quick info */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
            mx: 1,
          }}
        >
          {/* Search box (slightly tighter on mobile to make room for Raise button) */}
          <Box
            sx={{
              flex: isMobile ? 1 : 0,
              minWidth: 0,
              maxWidth: isMobile ? "100%" : 320,
              display: "flex",
              alignItems: "center",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.03)",
              borderRadius: 999,
              px: isMobile ? 1.1 : 1,
              py: 0,
              height: isMobile ? 32 : 26,
            }}
          >
            <SearchIcon
              sx={{
                fontSize: isMobile ? 20 : 16,
                mr: 1,
                opacity: 0.7,
              }}
            />
            <InputBase
              placeholder="Search..."
              sx={{
                fontSize: isMobile ? 13 : 12,
                width: "100%",
              }}
            />
          </Box>

          {/* Desktop: Tenant + status pill (unchanged) */}
          {!isMobile && (
            <>
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 999,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontSize: 10, color: "text.secondary" }}
                >
                  Tenant:&nbsp;
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontSize: 10, fontWeight: 500 }}
                >
                  Hi5Tech
                </Typography>
              </Box>

              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 999,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(46, 125, 50, 0.25)"
                      : "rgba(76, 175, 80, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "success.main",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ fontSize: 10, color: "success.main" }}
                >
                  All systems operational
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {/* Right actions */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
            }}
          >
            {/* Desktop "Raise new…" button with dropdown */}
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
              }}
            >
              Raise new
            </Button>

            <IconButton
              size="small"
              onClick={() => setDrawerType("notifications")}
            >
              <NotificationsIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
              }}
              onClick={() => setDrawerType("profile")}
            >
              <Box sx={{ position: "relative" }}>
                <Avatar sx={getNavbarAvatarSx(userStatus, 24)}>
                  {userInitial}
                </Avatar>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -1,
                    right: -1,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: "2px solid",
                    borderColor: "background.paper",
                    bgcolor: getStatusColor(userStatus),
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  variant="caption"
                  sx={{ lineHeight: 1.2, fontWeight: 500, fontSize: 11 }}
                >
                  {username}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  sx={{ lineHeight: 1.1 }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: getStatusColor(userStatus),
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: getStatusColor(userStatus),
                      fontSize: 10,
                    }}
                  >
                    {userStatus}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Box>
        )}

        {/* Mobile: raise button + profile/status */}
        {isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              flexShrink: 0,
            }}
          >
            {/* Mobile "Raise new" icon button */}
            <IconButton
              size="small"
              onClick={handleOpenRaiseMenu}
              sx={{ mr: 0.25 }}
            >
              <AddCircleOutlineIcon
                sx={{
                  fontSize: 22,
                }}
              />
            </IconButton>

            {/* Mobile profile icon + status dot + menu */}
            <IconButton size="small" onClick={handleStatusMenuOpen}>
              <Box sx={{ position: "relative", display: "flex" }}>
                <AccountCircleIcon
                  sx={{
                    fontSize: 22,
                    opacity: userStatus === "Offline" ? 0.6 : 1,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: -1,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: "2px solid",
                    borderColor: "background.paper",
                    bgcolor: getStatusColor(userStatus),
                    boxShadow:
                      userStatus === "Busy"
                        ? "0 0 0 2px rgba(244,67,54,0.4)"
                        : "none",
                  }}
                />
              </Box>
            </IconButton>

            {/* Status selection menu (mobile) */}
            <Menu
              anchorEl={statusMenuAnchor}
              open={Boolean(statusMenuAnchor)}
              onClose={handleStatusMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              {["Available", "Busy", "Away", "Offline"].map((opt) => (
                <MenuItem
                  key={opt}
                  selected={userStatus === opt}
                  onClick={() => handleStatusClick(opt)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: getStatusColor(opt),
                      }}
                    />
                    <Typography variant="body2">{opt}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}
      </Box>

      {/* Raise new… menu (shared for desktop + mobile) */}
      <Menu
        anchorEl={raiseAnchorEl}
        open={raiseMenuOpen}
        onClose={handleCloseRaiseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => handleRaiseNavigate("/new-incident")}>
          Raise Incident
        </MenuItem>
        <MenuItem onClick={() => handleRaiseNavigate("/new-service-request")}>
          Raise Service Request
        </MenuItem>
        <MenuItem onClick={() => handleRaiseNavigate("/new-change")}>
          Raise Change
        </MenuItem>
      </Menu>
    </>
  );
};

export default Navbar;
