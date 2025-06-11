// src/components/ProfileDrawer.js

import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../context/AuthContext";

const ProfileDrawer = ({ onLogout }) => {
  const { user } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Avatar sx={{ width: 56, height: 56 }}>
          {user?.full_name?.[0] || "?"}
        </Avatar>
        <Box sx={{ ml: 2 }}>
          <Typography variant="h6">{user?.full_name || "Unknown User"}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email || "No email"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Role: {user?.role || "N/A"}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <List>
        <ListItem button onClick={onLogout}>
          <ListItemText primary="Logout" />
          <IconButton>
            <LogoutIcon />
          </IconButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default ProfileDrawer;
