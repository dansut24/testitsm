// src/components/ProfileDrawer.js

import React from "react";
import { Typography, Box, Button, Avatar } from "@mui/material";

const ProfileDrawer = ({ onLogout }) => {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {
    username: "Unknown",
    avatar_url: "",
    email: "",
    role: "",
  };

  return (
    <Box>
      <Typography variant="h6">Profile</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
        <Avatar src={storedUser.avatar_url} sx={{ width: 48, height: 48 }}>
          {storedUser.username?.[0]?.toUpperCase() || "U"}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">{storedUser.username}</Typography>
          <Typography variant="body2" color="text.secondary">
            {storedUser.email || "No email set"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Role: {storedUser.role || "N/A"}
          </Typography>
        </Box>
      </Box>

      <Button
        variant="outlined"
        color="error"
        onClick={onLogout}
        sx={{ mt: 3 }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default ProfileDrawer;
