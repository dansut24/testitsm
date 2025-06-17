// src/pages/Products.js
import React from "react";
import { Box, Typography, Container, Grid, Paper } from "@mui/material";

const products = [
  {
    title: "ITSM Platform",
    description: "Comprehensive ticketing, workflows, automation, and SLA management for IT teams."
  },
  {
    title: "Hi5 Control",
    description: "Secure remote access to endpoints from anywhere—no user interaction needed."
  },
  {
    title: "Hi5 Manage",
    description: "RMM tools to monitor, patch, and manage your devices from a central dashboard."
  }
];

const Products = () => (
  <Container sx={{ py: 8 }}>
    <Typography variant="h3" align="center" fontWeight="bold" gutterBottom>
      Our Products
    </Typography>
    <Typography variant="h6" align="center" color="text.secondary" gutterBottom>
      Everything you need to support and manage IT—built into one powerful platform.
    </Typography>
    <Grid container spacing={4} sx={{ mt: 4 }}>
      {products.map((p, i) => (
        <Grid item xs={12} md={4} key={i}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>{p.title}</Typography>
            <Typography color="text.secondary">{p.description}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Container>
);

export default Products;
