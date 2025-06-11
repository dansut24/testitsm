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
import { supabase } from "../../common/utils/supabaseClient";
import { workflowTemplates } from "../../itsm/data/workflowTemplates";

const categoryOptions = Object.keys(workflowTemplates);
const priorityOptions = ["Low", "Medium", "High", "Critical"];

const NewServiceRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    customer_name: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const user = JSON.parse(localStorage.getItem("user"));

    try {
      // Validate required fields
      const { title, description, category, priority, customer_name } = formData;
      if (!title || !description || !category || !priority || !customer_name) {
        throw new Error("Please complete all required fields.");
      }

      // Get next reference number
      const { data: refData, error: refError } = await supabase.rpc("get_next_sr_reference");
      if (refError) throw refError;
      const reference = refData;

      // Insert service request
      const { data, error: insertError } = await supabase
        .from("service_requests")
        .insert([
          {
            title,
            description,
            category,
            priority,
            customer_name,
            submitted_by: user?.username || "unknown",
            reference,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Email notification
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "service request",
          reference,
          title,
          description,
          category,
          priority,
          customerName: customer_name,
          submittedBy: user?.username || "unknown",
        }),
      });

      navigate(`/service-requests/${data.id}`, { state: { tabName: reference } });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Raise New Service Request
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            name="title"
            fullWidth
            required
            value={formData.title}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Description"
            name="description"
            fullWidth
            required
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              required
              value={formData.category}
              label="Category"
              onChange={handleChange}
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
              required
              value={formData.priority}
              label="Priority"
              onChange={handleChange}
            >
              {priorityOptions.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Customer Name"
            name="customer_name"
            fullWidth
            required
            value={formData.customer_name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button type="submit" variant="contained" fullWidth disabled={submitting}>
            {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit Request"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default NewServiceRequest;
