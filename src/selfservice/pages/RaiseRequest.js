// src/pages/SelfService/RaiseRequest.js

import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";

const RaiseRequest = () => {
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Raise a Service Request
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Browse our service catalog and select the service you need.
      </Typography>
      <Box>
        {/* Replace this placeholder with actual catalog or form */}
        <Typography sx={{ my: 2 }}>Service catalog coming soon...</Typography>
        <Button variant="contained" disabled>
          Submit Request
        </Button>
      </Box>
    </Paper>
  );
};

export default RaiseRequest;
