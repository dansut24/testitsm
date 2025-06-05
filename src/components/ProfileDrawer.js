// src/components/ProfileDrawer.js

import React from "react";
import {
  Drawer,
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

const ProfileDrawer = ({ open, onClose }) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 300, p: 3, bgcolor: "background.paper" }}>
        <Typography variant="h6" gutterBottom>
          My Profile
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ width: 56, height: 56 }}>D</Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="h6">Dan Sutton</Typography>
            <Typography variant="body2" color="text.secondary">
              dan@hi5tech.co.uk
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Role: admin
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <List>
          <ListItem button onClick={() => alert("Logging out...")}>
            <ListItemText primary="Logout" />
            <IconButton>
              <LogoutIcon />
            </IconButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default ProfileDrawer;
