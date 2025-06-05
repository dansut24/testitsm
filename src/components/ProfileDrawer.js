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

const TestDrawer = ({ open, onClose }) => {
  const dummyUser = {
    full_name: "Dan Sutton",
    email: "danielsuttonsamsung@gmail.com",
    role: "admin"
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1301,
        "& .MuiDrawer-paper": {
          backgroundColor: "white",
          color: "black",
          width: 300,
          p: 3,
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ width: 56, height: 56 }}>
            {dummyUser.full_name[0]}
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="h6">{dummyUser.full_name}</Typography>
            <Typography variant="body2">{dummyUser.email}</Typography>
            <Typography variant="caption">Role: {dummyUser.role}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <List>
          <ListItem button onClick={() => alert("Logout clicked")}>
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

export default TestDrawer;
