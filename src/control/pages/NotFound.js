import React from "react";
import { Box, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1">
        Sorry, the page you’re looking for doesn’t exist in this section of the portal.
      </Typography>
    </Box>
  );
}
