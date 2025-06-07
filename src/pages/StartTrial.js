import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Container
} from "@mui/material";

const StartTrial = () => {
  const [formData, setFormData] = useState({ name: "", email: "", company: "" });
  const [status, setStatus] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.company) {
      setStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }

    // TODO: replace with actual backend integration
    console.log("📨 Trial request submitted:", formData);
    setStatus({ type: "success", message: "Trial started! We'll email you shortly." });
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Start Your Free Trial
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Enter your details to begin a 14-day trial.
        </Typography>

        {status && (
          <Alert severity={status.type} sx={{ mb: 2 }}>
            {status.message}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Work Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Company Name"
          name="company"
          value={formData.company}
          onChange={handleChange}
          margin="normal"
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleSubmit}
        >
          Start Trial
        </Button>
      </Paper>
    </Container>
  );
};

export default StartTrial;
