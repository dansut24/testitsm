// src/pages/NewAsset.js
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const assetTypes = ["Laptop", "Desktop", "Monitor", "Printer", "Phone"];

const NewAsset = () => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    serial: "",
    location: "",
    owner: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    // Placeholder for actual submission
    console.log("New asset submitted:", formData);
    navigate("/assets");
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Register New Asset
        </Typography>
        <TextField
          label="Asset Name"
          name="name"
          fullWidth
          sx={{ mb: 2 }}
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          select
          label="Asset Type"
          name="type"
          fullWidth
          sx={{ mb: 2 }}
          value={formData.type}
          onChange={handleChange}
        >
          {assetTypes.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Serial Number"
          name="serial"
          fullWidth
          sx={{ mb: 2 }}
          value={formData.serial}
          onChange={handleChange}
        />
        <TextField
          label="Location"
          name="location"
          fullWidth
          sx={{ mb: 2 }}
          value={formData.location}
          onChange={handleChange}
        />
        <TextField
          label="Owner / Assigned To"
          name="owner"
          fullWidth
          sx={{ mb: 2 }}
          value={formData.owner}
          onChange={handleChange}
        />
        <Button variant="contained" onClick={handleSubmit}>
          Save Asset
        </Button>
      </Paper>
    </Box>
  );
};

export default NewAsset;
