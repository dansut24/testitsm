// src/layouts/SelfServiceLayout.js

import React from "react";
import {
  Box,
  Container,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate, Outlet } from "react-router-dom";

const SelfServiceLayout = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <CssBaseline />

      {/* Navbar */}
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate("/")}>
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Self-Service Portal
          </Typography>
          <Button color="inherit" onClick={() => navigate("/login")}>
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default SelfServiceLayout;
