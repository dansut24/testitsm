// src/pages/NewProblem.js
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const NewProblem = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    impact: "Medium",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    console.log("New Problem Submitted", form);
    navigate("/problems");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Raise a New Problem
        </Typography>
        <TextField
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={4}
        />
        <TextField
          select
          label="Impact"
          name="impact"
          value={form.impact}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          {['Low', 'Medium', 'High'].map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
          Submit Problem
        </Button>
      </Paper>
    </Box>
  );
};

export default NewProblem;
