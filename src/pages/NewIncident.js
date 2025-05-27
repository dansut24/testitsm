// src/pages/NewIncident.js

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Fade,
} from "@mui/material";

const StepIndicator = ({ step, active }) => (
  <Box
    sx={{
      width: 40,
      height: 40,
      borderRadius: "50%",
      border: active ? "4px solid #4caf50" : "2px solid #ccc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: 18,
      color: active ? "#4caf50" : "#777",
      backgroundColor: "#fff",
      position: "absolute",
      top: -22,
      left: -22,
      zIndex: 1,
    }}
  >
    {step}
  </Box>
);

const NewIncident = () => {
  const [step, setStep] = useState(1);
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", priority: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleCustomerSearch = () => {
    setSelectedCustomer({ name: customerQuery });
    setStep(2);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      alert("Incident submitted!");
    }, 2000);
  };

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: 600, mx: "auto", position: "relative" }}>
      <Typography variant="h5" gutterBottom>
        Raise New Incident
      </Typography>

      {/* Step 1 */}
      <Box sx={{ position: "relative", mb: 5 }}>
        <StepIndicator step={1} active={step >= 1} />
        <Paper elevation={3} sx={{ pt: 4, pb: 2, px: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Step 1: Search for Customer
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              label="Customer Name or Email"
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
            />
            <Button variant="contained" onClick={handleCustomerSearch}>
              Search
            </Button>
          </Box>
          {selectedCustomer && (
            <Typography sx={{ mt: 1 }} color="text.secondary">
              Selected: {selectedCustomer.name}
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Step 2 */}
      <Fade in={step >= 2}>
        <Box sx={{ position: "relative" }}>
          <StepIndicator step={2} active={step === 2} />
          <Paper elevation={3} sx={{ pt: 4, pb: 2, px: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Step 2: Incident Details
            </Typography>
            <TextField
              fullWidth
              label="Incident Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit"}
            </Button>
          </Paper>
        </Box>
      </Fade>
    </Box>
  );
};

export default NewIncident;
