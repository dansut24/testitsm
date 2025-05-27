import React, { useState, useEffect } from "react";
import { Box, Typography, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

const Settings = () => {
  const [selectedDashboard, setSelectedDashboard] = useState(() => {
    return localStorage.getItem("selectedDashboard") || "default";
  });

  useEffect(() => {
    localStorage.setItem("selectedDashboard", selectedDashboard);
  }, [selectedDashboard]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Account Settings</Typography>

      <FormControl fullWidth sx={{ mt: 3 }}>
        <InputLabel>Select Dashboard Layout</InputLabel>
        <Select
          value={selectedDashboard}
          onChange={(e) => setSelectedDashboard(e.target.value)}
          label="Select Dashboard Layout"
        >
          <MenuItem value="default">Default Layout</MenuItem>
          <MenuItem value="minimal">Minimal Layout</MenuItem>
          <MenuItem value="analytics">Analytics View</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default Settings;
