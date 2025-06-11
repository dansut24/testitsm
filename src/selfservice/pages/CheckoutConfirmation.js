// src/pages/SelfService/CheckoutConfirmation.js

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CheckoutConfirmation = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Thank You!
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Your request has been submitted successfully. You will receive updates shortly.
      </Typography>
      <Button variant="contained" colour="primary" onClick={() => navigate("/self-service")}>
        Return to Self Service Portal
      </Button>
    </Box>
  );
};

export default CheckoutConfirmation;
