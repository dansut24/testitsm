// src/pages/SelfService/RaiseIncident.js

import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";

const RaiseIncident = () => {
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Report an Incident
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tell us what issue you're facing and we'll get on it right away.
      </Typography>
      <Box>
        {/* Replace this placeholder with actual form */}
        <Typography sx={{ my: 2 }}>Incident form coming soon...</Typography>
        <Button variant="contained" disabled>
          Submit Incident
        </Button>
      </Box>
    </Paper>
  );
};

export default RaiseIncident;
