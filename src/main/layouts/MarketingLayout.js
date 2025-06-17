// src/main/layouts/MarketingLayout.js
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation, Outlet } from "react-router-dom";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Products", path: "/products" },
  { label: "Contact", path: "/contact" },
  { label: "Pricing", path: "/pricing" },
];

const MarketingLayout = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        color="default"
        elevation={2}
        sx={{
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}>
            <SupportAgentIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">Hi5Tech</Typography>
          </Box>

          {isMobile ? (
            <>
              <IconButton edge="end" color="inherit" onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                <Box
                  sx={{ width: 250 }}
                  role="presentation"
                  onClick={toggleDrawer(false)}
                  onKeyDown={toggleDrawer(false)}
                >
                  <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
                    <SupportAgentIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6" fontWeight="bold">Hi5Tech</Typography>
                  </Box>
                  <Divider />
                  <List>
                    {navLinks.map((link) => (
                      <ListItem
                        button
                        key={link.path}
                        component={Link}
                        to={link.path}
                        selected={location.pathname === link.path}
                      >
                        <ListItemText primary={link.label} />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ px: 2, pt: 1 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      component={Link}
                      to="/setup"
                      color="primary"
                    >
                      Start Free Trial
                    </Button>
                  </Box>
                </Box>
              </Drawer>
            </>
          ) : (
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
              <Button
                variant="contained"
                component={Link}
                to="/setup"
                sx={{ ml: 2 }}
              >
                Start Trial
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Page Content */}
      <Container sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: "auto",
          backgroundColor: "#f5f5f5",
          textAlign: "center",
          fontSize: 14,
          color: "#777",
        }}
      >
        © {new Date().getFullYear()} Hi5Tech. All rights reserved.
      </Box>
    </Box>
  );
};

export default MarketingLayout;
