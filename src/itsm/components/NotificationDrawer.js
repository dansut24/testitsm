// src/components/NotificationDrawer.js

import React from "react";
import { Box, Typography, Divider, List, ListItem, ListItemText, Chip } from "@mui/material";

const sampleNotifications = [
  { id: 1, message: "New comment on ticket #1023", time: "2 mins ago", status: "New" },
  { id: 2, message: "Software install approved", time: "10 mins ago", status: "Info" },
  { id: 3, message: "Password reset requested", time: "1 hour ago", status: "New" },
];

const NotificationDrawer = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Notifications
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List dense>
        {sampleNotifications.map((notif) => (
          <ListItem key={notif.id} divider alignItems="flex-start">
            <ListItemText
              primary={notif.message}
              secondary={notif.time}
              primaryTypographyProps={{ fontSize: 14 }}
              secondaryTypographyProps={{ fontSize: 12, color: "text.secondary" }}
            />
            <Chip
              label={notif.status}
              size="small"
              color={notif.status === "New" ? "primary" : "default"}
              sx={{ ml: 1 }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default NotificationDrawer;
