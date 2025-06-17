// src/pages/Contact.js
import React from "react";
import { Box, Typography, TextField, Button, Container, Paper } from "@mui/material";

const Contact = () => (
  <Container sx={{ py: 8 }}>
    <Typography variant="h3" align="center" fontWeight="bold" gutterBottom>
      Contact Us
    </Typography>
    <Typography align="center" color="text.secondary" sx={{ mb: 4 }}>
      We’d love to hear from you. Send us a message and we’ll respond as soon as possible.
    </Typography>
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <TextField label="Name" fullWidth margin="normal" />
      <TextField label="Email" fullWidth margin="normal" />
      <TextField label="Message" multiline rows={4} fullWidth margin="normal" />
      <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
        Send
      </Button>
    </Paper>
  </Container>
);

export default Contact;
