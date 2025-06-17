// src/main/pages/About.js
import React from "react";
import { Box, Typography, Container, Grid, Paper } from "@mui/material";

const About = () => (
  <Box sx={{ backgroundColor: "#f0f4f8", py: 8 }}>
    <Container maxWidth="md">
      <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
        About Hi5Tech
      </Typography>
      <Typography variant="h6" color="text.secondary" textAlign="center" mb={6}>
        Empowering IT teams with modern, modular solutions for smarter service delivery.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, backgroundColor: "white" }}>
            <Typography variant="body1" fontSize={18} color="text.primary">
              Hi5Tech is built to transform the way internal IT teams and managed service providers (MSPs) operate.
              Our mission is to deliver powerful, flexible, and intuitive tools that streamline ticketing, automate workflows,
              and make remote support effortless. We believe in scalable, multi-tenant solutions that grow with your team—
              and your clients.
            </Typography>
            <Typography variant="body1" fontSize={18} color="text.primary" mt={3}>
              Whether you're a small business or an enterprise provider, Hi5Tech gives you the tools to support users,
              manage assets, and keep systems running smoothly from anywhere in the world.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

export default About;
