// src/pages/NewServiceRequest.js

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { workflowTemplates } from "../data/workflowTemplates";

const NewServiceRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendEmailNotification = async (reference, user, tasks) => {
    try {
      await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "service request",
          reference,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: "N/A", // Optionally add this to the form if required
          submittedBy: user?.username || "unknown",
          customerName: "N/A",
        }),
      });
    } catch (err) {
      console.error("Email failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const { data: requestData, error: insertError } = await supabase
        .from("service_requests")
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          submitted_by: user?.username || "unknown",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const tasksToInsert =
        workflowTemplates[formData.category]?.map((t) => ({
          service_request_id: requestData.id,
          title: t.title,
          description: t.description,
          status: "Pending",
        })) || [];

      const { error: taskError } = await supabase
        .from("service_request_tasks")
        .insert(tasksToInsert);

      if (taskError) throw taskError;

      const reference = `SR${requestData.id}`;
      await sendEmailNotification(reference, user, tasksToInsert);

      navigate(`/service-requests/${requestData.id}`, {
        state: { tabName: reference },
      });
    } catch (err) {
      console.error(err);
      setError("Failed to create request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Raise New Service Request
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            name="title"
            fullWidth
            value={formData.title}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              label="Category"
              onChange={handleChange}
              required
            >
              {Object.keys(workflowTemplates).map((key) => (
                <MenuItem key={key} value={key}>
                  {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}>
            {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit Request"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default NewServiceRequest;
