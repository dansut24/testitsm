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
  Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { workflowTemplates } from "../data/workflowTemplates";

const categoryOptions = Object.keys(workflowTemplates);
const priorityOptions = ["Low", "Medium", "High", "Critical"];

const NewServiceRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    customer_name: "", // Add this field
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendNotificationEmail = async (request) => {
    try {
      await fetch("/api/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "service request",
          ...request,
        }),
      });
    } catch (err) {
      console.error("Email error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const user = JSON.parse(localStorage.getItem("user"));
    const submittedBy = user?.username || "unknown";

    if (!formData.title || !formData.description || !formData.category || !formData.priority) {
      setError("Please complete all fields.");
      setSubmitting(false);
      return;
    }

    try {
      const { data: refData, error: refErr } = await supabase.rpc("get_next_sr_reference");
      if (refErr) throw refErr;

      const reference = refData;

      const { data, error: insertErr } = await supabase
        .from("service_requests")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            priority: formData.priority,
            reference,
            submitted_by: submittedBy,
          },
        ])
        .select()
        .single();

      if (insertErr) throw insertErr;

      await sendNotificationEmail({
        reference,
        ...formData,
        submittedBy,
        customerName: "", // Optional if not yet implemented
      });

      navigate(`/service-requests/${data.id}`, { state: { tabName: reference } });
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to create request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: 600, mx: "auto", position: "relative" }}>
      <Typography variant="h5" gutterBottom>
        Raise New Service Request
      </Typography>

      <Fade in>
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

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                label="Category"
                onChange={handleChange}
                required
              >
                {categoryOptions.map((key) => (
                  <MenuItem key={key} value={key}>
                    {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                label="Priority"
                onChange={handleChange}
                required
              >
                {priorityOptions.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit Request"}
            </Button>
          </form>
        </Paper>
      </Fade>
    </Box>
  );
};

export default NewServiceRequest;
