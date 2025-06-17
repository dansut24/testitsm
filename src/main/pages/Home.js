// src/main/pages/Home.js
import React from "react";
import { Box, Typography, Button, Grid, Container, Card, CardContent } from "@mui/material";
import { Link } from "react-router-dom";
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import PublicIcon from '@mui/icons-material/Public';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", py: 10, background: "linear-gradient(135deg, #0d47a1, #1976d2)", color: "white" }}>
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom fontWeight="bold">
            Empower Your IT Team
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9 }} gutterBottom>
            All-in-one ITSM & Remote Management designed for modern support teams.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={Link}
            to="/start-trial"
            sx={{ mt: 4 }}
          >
            Start Free Trial
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
          Why Teams Choose Hi5Tech
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ p: 2, transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <SupportAgentIcon fontSize="large" color="primary" />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Ticketing & Workflows
                </Typography>
                <Typography color="text.secondary">
                  Manage incidents, service requests, and changes with automations and SLAs.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ p: 2, transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <DesktopWindowsIcon fontSize="large" color="primary" />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Remote Access
                </Typography>
                <Typography color="text.secondary">
                  Instantly connect to endpoints—no user interaction needed. Built-in relay support.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ p: 2, transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <PublicIcon fontSize="large" color="primary" />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Self-Service Portal
                </Typography>
                <Typography color="text.secondary">
                  Users can raise tickets, request services, and browse help articles easily.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ textAlign: "center", py: 8, backgroundColor: "#0d47a1", color: "white" }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Try Hi5Tech Today
          </Typography>
          <Typography variant="h6" color="#bbdefb" gutterBottom>
            Get started in minutes. No credit card required.
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            component={Link}
            to="/start-trial"
            sx={{ mt: 3 }}
          >
            Get Started
          </Button>
        </Container>
      </Box>
    </>
  );
};

export default Home;
