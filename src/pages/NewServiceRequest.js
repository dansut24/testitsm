// src/pages/NewServiceRequest.js

import React, { useState } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  MenuItem,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const steps = ["Details", "Category", "Summary"];

const categories = ["Hardware", "Software", "Access", "Other"];

const NewServiceRequest = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  const navigate = useNavigate();

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      console.log("Submitted:", formData);
      navigate("/service-requests");
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography variant="h5" gutterBottom>
        Raise New Service Request
      </Typography>

      <Stepper activeStep={activeStep} sx={{ my: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3 }}>
        {activeStep === 0 && (
          <>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </>
        )}

        {activeStep === 1 && (
          <TextField
            select
            fullWidth
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
        )}

        {activeStep === 2 && (
          <>
            <Typography variant="subtitle1">Review your request:</Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Title:</strong> {formData.title}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Description:</strong> {formData.description}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Category:</strong> {formData.category}
            </Typography>
          </>
        )}

        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          <Button variant="contained" onClick={handleNext}>
            {activeStep === steps.length - 1 ? "Submit" : "Next"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewServiceRequest;
