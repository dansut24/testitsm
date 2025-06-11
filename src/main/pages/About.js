import React from "react";
import { Box, Typography } from "@mui/material";

const About = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4">About Us</Typography>
    <Typography sx={{ mt: 2 }}>
      Hi5Tech is dedicated to transforming IT service delivery with modern, modular, and multi-tenant solutions for MSPs and internal IT teams.
    </Typography>
  </Box>
);

export default About;
