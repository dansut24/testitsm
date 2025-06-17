// src/main/pages/Home.js
import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import { Link } from "react-router-dom";
import { SupportAgent, DesktopWindows, Forum } from "@mui/icons-material";

const Home = () => {
  return (
    <>
      <Box
        sx={{
          textAlign: "center",
          py: 10,
          background: "linear-gradient(135deg, #0d47a1, #1976d2)",
          color: "white",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom fontWeight="bold">
            Empower Your IT Team
          </Typography>
          <Typography variant="h5" color="#bbdefb" gutterBottom>
            Hi5Tech is the all-in-one ITSM & Remote Management platform built for modern IT support.
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

      <Box sx={{ backgroundColor: "#f0f4ff", py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight="bold"
            gutterBottom
          >
            Why Teams <span style={{ color: "#1976d2" }}>Choose</span> Hi5Tech
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%", borderLeft: "4px solid #1976d2" }}>
                <CardContent>
                  <SupportAgent fontSize="large" color="primary" />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Ticketing & Workflows
                  </Typography>
                  <Typography color="text.secondary">
                    Manage incidents, service requests, and changes with powerful automations and SLAs.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%", borderLeft: "4px solid #1976d2" }}>
                <CardContent>
                  <DesktopWindows fontSize="large" color="primary" />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Remote Access
                  </Typography>
                  <Typography color="text.secondary">
                    Connect to endpoints in seconds—no user interaction needed, powered by your own relay.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%", borderLeft: "4px solid #1976d2" }}>
                <CardContent>
                  <Forum fontSize="large" color="primary" />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Self-Service Portal
                  </Typography>
                  <Typography color="text.secondary">
                    Let users raise tickets, browse your knowledge base, and request services with ease.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ textAlign: "center", py: 8, backgroundColor: "#fff3e0", color: "#0d47a1" }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Try Hi5Tech Today
          </Typography>
          <Typography variant="h6" color="#4e342e" gutterBottom>
            Simple setup, powerful results. Start your 14-day free trial now.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
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
