// src/components/UserActivityLogDrawer.js

import React from "react";
import { Box, Typography, List, ListItem, ListItemText, Divider } from "@mui/material";

const mockActivity = [
  { id: 1, action: "Logged in", timestamp: "2025-06-01 08:32" },
  { id: 2, action: "Viewed Incident #1023", timestamp: "2025-06-01 08:35" },
  { id: 3, action: "Updated Service Request #2041", timestamp: "2025-06-01 08:45" },
  { id: 4, action: "Logged out", timestamp: "2025-06-01 09:00" },
];

const UserActivityLogDrawer = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Activity Log
      </Typography>
      <List>
        {mockActivity.map((item, index) => (
          <React.Fragment key={item.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={item.action}
                secondary={item.timestamp}
              />
            </ListItem>
            {index < mockActivity.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default UserActivityLogDrawer;
