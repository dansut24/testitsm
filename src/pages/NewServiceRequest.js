import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Paper, MenuItem
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { workflows } from "../data/workflowTemplates";

const NewServiceRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    template: "",
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    const requestId = `SR-${Date.now()}`;
    const tasks = (workflowTemplates[formData.template] || []).map(task => ({
      ...task,
      requestId,
      status: "Not Started",
    }));

    const newRequest = {
      id: requestId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: "Open",
      created: new Date().toISOString(),
      tasks,
    };

    console.log("New Service Request with Tasks:", newRequest);
    // Here you could push to localStorage, context, or your API

    navigate(`/service-requests/${requestId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        New Service Request
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
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
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          select
          label="Workflow Template"
          name="template"
          value={formData.template}
          onChange={handleChange}
          sx={{ mb: 2 }}
        >
          {Object.keys(workflowTemplates).map((key) => (
            <MenuItem key={key} value={key}>
              {key.replace(/_/g, " ").toUpperCase()}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" onClick={handleSubmit}>
          Submit Request
        </Button>
      </Paper>
    </Box>
  );
};

export default NewServiceRequest;
