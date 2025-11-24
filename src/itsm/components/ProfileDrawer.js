// src/itsm/layout/ProfileDrawer.js
import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  Stack,
  Button,
} from "@mui/material";

const STATUS_OPTIONS = [
  { key: "Available", color: "success.main" },
  { key: "Busy", color: "error.main" },
  { key: "Away", color: "warning.main" },
  { key: "Offline", color: "text.disabled" },
];

const ProfileDrawer = ({ status, onStatusChange, onLogout }) => {
  const username = "User";
  const email = "user@example.com";

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
        <Avatar sx={{ width: 40, height: 40, fontSize: 18 }}>
          {username[0]}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {email}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Status section */}
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
