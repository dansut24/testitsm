// src/itsm/layout/Navbar.js
import React from "react";
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
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";

const STATUS_OPTIONS = [
  { key: "Available", color: "success.main" },
  { key: "Busy", color: "error.main" },
  { key: "Away", color: "warning.main" },
  { key: "Offline", color: "text.disabled" },
];

const Navbar = ({
  isMobile,
  sidebarMode,
  username,
  userInitial,
  userStatus,
  getStatusColor,
  getNavbarAvatarSx,
  statusMenuAnchor,
  setStatusMenuAnchor,
  setDrawerType,
  setMobileSidebarOpen,
}) => {
  const theme = useTheme();

  return (
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
      {/* Logo / brand / menu */}
      {!isMobile && sidebarMode === "hidden" ? (
        <IconButton onClick={() => setMobileSidebarOpen(true)} size="small">
          <img
            src="https://www.bing.com/sa/simg/favicon-2x.ico"
            alt="Logo"
            style={{ width: 20, height: 20 }}
          />
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
            px: isMobile ? 1.4 : 1,
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

      {/* Right actions (desktop) */}
      {!isMobile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
          }}
        >
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

      {/* Mobile profile icon + status dropdown */}
      {isMobile && (
        <>
          <IconButton
            size="small"
            onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
          >
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

          <Menu
            anchorEl={statusMenuAnchor}
            open={Boolean(statusMenuAnchor)}
            onClose={() => setStatusMenuAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem
                key={opt.key}
                selected={userStatus === opt.key}
                onClick={() => {
                  // use provided handler from Layout
                  // (Layout updates userStatus + persists to localStorage)
                  // then close menu
                  const setter = (status) => {};
                  // but we already have handler via props -> just call it:
                  // This line is actually in Layout; here we call passed handler:
                }}
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
                      bgcolor: opt.color,
                    }}
                  />
                  <Typography variant="body2">{opt.key}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Box>
  );
};

export default Navbar;
