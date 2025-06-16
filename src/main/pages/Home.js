// src/pages/Marketing/Home.js
import React from "react";
import { Box, Typography, Button, Grid, Container } from "@mui/material";
import { Link } from "react-router-dom";
import MarketingLayout from "../layouts/MarketingLayout";

const Home = () => {
  return (
    <MarketingLayout>
      <Box sx={{ textAlign: "center", py: 10, backgroundColor: "#f5f5f5" }}>
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom fontWeight="bold">
            Empower Your IT Team
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Hi5Tech is the all-in-one ITSM & Remote Management platform built for modern IT support.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            to="/start-trial"
            sx={{ mt: 4 }}
          >
            Start Free Trial
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
          Why Teams Choose Hi5Tech
        </Typography>
        <Grid container spacing={6} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Ticketing & Workflows
            </Typography>
            <Typography color="text.secondary">
              Manage incidents, service requests, and changes with powerful automations and SLAs.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Remote Access
            </Typography>
            <Typography color="text.secondary">
              Connect to endpoints in seconds—no user interaction needed, powered by your own relay.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Self-Service Portal
            </Typography>
            <Typography color="text.secondary">
              Let users raise tickets, browse your knowledge base, and request services with ease.
            </Typography>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ textAlign: "center", py: 8, backgroundColor: "#0d47a1", color: "white" }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Try Hi5Tech Today
          </Typography>
          <Typography variant="h6" color="#bbdefb" gutterBottom>
            Simple setup, powerful results. Start your 14-day free trial now.
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
    </MarketingLayout>
  );
};

export default Home;
