// src/layouts/MarketingLayout.js
import React from "react";
import { AppBar, Toolbar, Typography, Box, Button, Container } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Products", path: "/products" },
  { label: "Contact", path: "/contact" },
];

const MarketingLayout = ({ children }) => {
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        color="default"
        elevation={4}
        sx={{
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: "none", color: "inherit" }}>
            Hi5Tech
          </Typography>
          <Box>
            {navLinks.map((link) => (
              <Button
                key={link.path}
                component={Link}
                to={link.path}
                sx={{
                  mx: 1,
                  fontWeight: location.pathname === link.path ? "bold" : "normal",
                  color: location.pathname === link.path ? "primary.main" : "inherit",
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4, flexGrow: 1 }}>{children}</Container>

      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          backgroundColor: "#f5f5f5",
          textAlign: "center",
          fontSize: 14,
          color: "#555",
        }}
      >
        © {new Date().getFullYear()} Hi5Tech. All rights reserved.
      </Box>
    </Box>
  );
};

export default MarketingLayout;
