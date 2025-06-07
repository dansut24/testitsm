// src/pages/Pricing.js

import React, { useState } from "react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const pricingData = {
  monthly: [
    {
      name: "Basic",
      price: "£29",
      features: ["Ticketing", "Knowledge Base", "Email Support"],
    },
    {
      name: "Professional",
      price: "£69",
      features: [
        "All Basic features",
        "Asset Management",
        "Service Catalogue",
        "SLA Management",
      ],
    },
    {
      name: "Enterprise",
      price: "£129",
      features: [
        "All Professional features",
        "Custom Dashboards",
        "Role-based Access",
        "Multi-Tenant Support",
      ],
    },
  ],
  yearly: [
    {
      name: "Basic",
      price: "£290",
      features: ["Ticketing", "Knowledge Base", "Email Support"],
    },
    {
      name: "Professional",
      price: "£690",
      features: [
        "All Basic features",
        "Asset Management",
        "Service Catalogue",
        "SLA Management",
      ],
    },
    {
      name: "Enterprise",
      price: "£1290",
      features: [
        "All Professional features",
        "Custom Dashboards",
        "Role-based Access",
        "Multi-Tenant Support",
      ],
    },
  ],
};

const Pricing = () => {
  const [billing, setBilling] = useState("monthly");
  const [openModal, setOpenModal] = useState(null);

  const handleToggle = (_, newBilling) => {
    if (newBilling) setBilling(newBilling);
  };

  const plans = pricingData[billing];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Choose Your Plan
      </Typography>

      <Box display="flex" justifyContent="center" mb={4}>
        <ToggleButtonGroup
          value={billing}
          exclusive
          onChange={handleToggle}
          aria-label="billing toggle"
        >
          <ToggleButton value="monthly">Monthly</ToggleButton>
          <ToggleButton value="yearly">Yearly</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan, index) => (
          <Grid item xs={12} sm={6} md={4} key={plan.name}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {plan.price}
                  <Typography variant="caption"> /{billing}</Typography>
                </Typography>

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => setOpenModal(index)}
                >
                  What’s included
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Dialog
              open={openModal === index}
              onClose={() => setOpenModal(null)}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>{plan.name} Plan - Features</DialogTitle>
              <DialogContent>
                <List>
                  {plan.features.map((feature, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </DialogContent>
            </Dialog>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Pricing;
