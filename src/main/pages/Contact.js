import React from "react";
import { Box, Typography, TextField, Button } from "@mui/material";

const Contact = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4">Contact Us</Typography>
    <TextField label="Name" fullWidth margin="normal" />
    <TextField label="Email" fullWidth margin="normal" />
    <TextField label="Message" multiline rows={4} fullWidth margin="normal" />
    <Button variant="contained" sx={{ mt: 2 }}>Send</Button>
  </Box>
);

export default Contact;
