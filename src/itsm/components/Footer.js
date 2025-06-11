// Footer.js — simple site footer component

import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: "auto",
        textAlign: "center",
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.secondary,
        fontSize: 14,
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} Hi5Tech ITSM
      </Typography>
    </Box>
  );
};

export default Footer;
