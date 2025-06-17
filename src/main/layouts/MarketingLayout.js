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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation, Outlet } from "react-router-dom";

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        color="default"
        elevation={1}
        sx={{
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ textDecoration: "none", color: "inherit", fontWeight: "bold" }}
          >
            Hi5Tech
          </Typography>

          {isMobile ? (
            <>
              <IconButton onClick={() => setDrawerOpen(true)} edge="end">
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
              >
                <Box sx={{ width: 250 }} role="presentation">
                  <List>
                    {navLinks.map((link) => (
                      <ListItem
                        button
                        key={link.path}
                        component={Link}
                        to={link.path}
                        onClick={() => setDrawerOpen(false)}
                        selected={location.pathname === link.path}
                      >
                        <ListItemText primary={link.label} />
                      </ListItem>
                    ))}
                  </List>
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
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>

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
