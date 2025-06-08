// src/layouts/MarketingLayout.js
import React from "react";
import { Box, Container, AppBar, Toolbar, Typography, Link } from "@mui/material";
import { Outlet, Link as RouterLink } from "react-router-dom";

const MarketingLayout = () => {
  return (
    <Box>
      <AppBar position="static" sx={{ background: "#0057B8" }}>
        <Toolbar>
          <Typography variant="h6" component={RouterLink} to="/" sx={{ color: "#fff", textDecoration: "none", flexGrow: 1 }}>
            Hi5Tech
          </Typography>
          <Link component={RouterLink} to="/about" color="inherit" sx={{ ml: 2 }}>About</Link>
          <Link component={RouterLink} to="/products" color="inherit" sx={{ ml: 2 }}>Products</Link>
          <Link component={RouterLink} to="/contact" color="inherit" sx={{ ml: 2 }}>Contact</Link>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 6 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ background: "#f4f4f4", py: 3, textAlign: "center" }}>
        <Typography variant="body2" color="textSecondary">
          © {new Date().getFullYear()} Hi5Tech. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default MarketingLayout;
