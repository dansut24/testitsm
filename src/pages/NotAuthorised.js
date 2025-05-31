// src/pages/NotAuthorised.js
import React from "react";
import { Typography, Box } from "@mui/material";

const NotAuthorised = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4" color="error" gutterBottom>
      403 - Not Authorised
    </Typography>
    <Typography>You do not have permission to view this page.</Typography>
  </Box>
);

export default NotAuthorised;
