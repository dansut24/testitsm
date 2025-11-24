// src/itsm/layout/ProfileDrawer.js
import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  Stack,
  Button,
  useTheme,
} from "@mui/material";

const STATUS_OPTIONS = [
  { key: "Available", color: "success.main" },
  { key: "Busy", color: "error.main" },
  { key: "Away", color: "warning.main" },
  { key: "Offline", color: "text.disabled" },
];

const ProfileDrawer = ({ status, onStatusChange, onLogout, showStatus = true }) => {
  const theme = useTheme();
  const username = "User";
  const email = "user@example.com";

  const getStatusColor = (statusKey) => {
    const opt = STATUS_OPTIONS.find((o) => o.key === statusKey);
    return opt ? opt.color : "text.disabled";
  };

  const getAvatarSx = (statusKey, size = 40) => {
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
              ? "0 0 0 3px rgba(76,175,80,0.3)"
              : "0 0 0 3px rgba(76,175,80,0.4)",
        };
      case "Busy":
        return {
          ...base,
          border: "2px solid",
          borderColor: "error.main",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 0 0 3px rgba(244,67,54,0.35)"
              : "0 0 0 3px rgba(244,67,54,0.45)",
        };
      case "Away":
        return {
          ...base,
          border: "2px solid",
          borderColor: "warning.main",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 0 0 3px rgba(255,179,0,0.3)"
              : "0 0 0 3px rgba(255,179,0,0.4)",
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

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ position: "relative" }}>
          <Avatar sx={getAvatarSx(status || "Offline", 40)}>
            {username[0]}
          </Avatar>
          {showStatus && (
            <Box
              sx={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: "2px solid",
                borderColor: "background.paper",
                bgcolor: getStatusColor(status || "Offline"),
              }}
            />
          )}
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {email}
          </Typography>
          {showStatus && (
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ mt: 0.5 }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: getStatusColor(status || "Offline"),
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: getStatusColor(status || "Offline"),
                  fontSize: 11,
                }}
              >
                {status || "Offline"}
              </Typography>
            </Stack>
          )}
        </Box>
      </Box>

      <Divider />

      {/* Status section (desktop only when showStatus = true) */}
      {showStatus && (
        <>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Status
            </Typography>
            <Stack spacing={1}>
              {STATUS_OPTIONS.map((opt) => (
                <Button
                  key={opt.key}
                  variant={status === opt.key ? "contained" : "outlined"}
                  size="small"
                  onClick={() => onStatusChange && onStatusChange(opt.key)}
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: opt.color,
                      mr: 1,
                    }}
                  />
                  {opt.key}
                </Button>
              ))}
            </Stack>
          </Box>

          <Divider />
        </>
      )}

      {/* Footer actions */}
      <Box sx={{ p: 2, mt: "auto" }}>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={onLogout}
        >
          Sign out
        </Button>
      </Box>
    </Box>
  );
};

export default ProfileDrawer;
