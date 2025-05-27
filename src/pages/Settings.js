import React, { useState, useEffect } from "react";
import {
  Box, Typography, MenuItem, Select, FormControl, InputLabel,
  Grid, Paper, Radio, TextField, Button, Checkbox, FormGroup, FormControlLabel
} from "@mui/material";

const predefinedLayouts = [
  {
    id: "default",
    name: "Default Layout",
    widgets: ["Pie Chart", "Bar Chart", "Line Chart", "Incident Table"],
  },
  {
    id: "minimal",
    name: "Minimal Layout",
    widgets: ["Pie Chart", "Incident Table"],
  },
  {
    id: "analytics",
    name: "Analytics View",
    widgets: ["Pie Chart", "Bar Chart", "Line Chart"],
  }
];

const widgetOptions = [
  { id: "pie", label: "Incidents by Status" },
  { id: "bar", label: "Requests by Month" },
  { id: "line", label: "Changes Over Time" },
  { id: "table", label: "Latest Incidents" },
  { id: "team", label: "Team Incidents" }
];

const Settings = () => {
  const [selectedLayout, setSelectedLayout] = useState(() => {
    return localStorage.getItem("selectedDashboard") || "default";
  });

  const [customName, setCustomName] = useState("");
  const [customWidgets, setCustomWidgets] = useState([]);

  const handleLayoutChange = (id) => {
    setSelectedLayout(id);
    localStorage.setItem("selectedDashboard", id);
  };

  const toggleCustomWidget = (id) => {
    setCustomWidgets((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const saveCustomDashboard = () => {
    if (!customName || customWidgets.length === 0) return;
    const config = {
      id: customName.toLowerCase().replace(/\\s+/g, "-"),
      name: customName,
      widgets: customWidgets,
    };
    localStorage.setItem("custom-dashboard", JSON.stringify(config));
    localStorage.setItem("selectedDashboard", config.id);
    setSelectedLayout(config.id);
    alert("Custom dashboard saved and selected!");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Account Settings</Typography>

      <Typography variant="h6" sx={{ mt: 4 }}>Select a Predefined Dashboard</Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {predefinedLayouts.map((layout) => (
          <Grid item xs={12} md={4} key={layout.id}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderColor: selectedLayout === layout.id ? "primary.main" : "grey.300",
              }}
              onClick={() => handleLayoutChange(layout.id)}
            >
              <Box display="flex" alignItems="center">
                <Radio
                  checked={selectedLayout === layout.id}
                  onChange={() => handleLayoutChange(layout.id)}
                  value={layout.id}
                />
                <Typography variant="subtitle1">{layout.name}</Typography>
              </Box>
              <ul style={{ marginLeft: 32 }}>
                {layout.widgets.map((w, i) => (
                  <li key={i} style={{ fontSize: "0.9em" }}>{w}</li>
                ))}
              </ul>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mt: 5 }}>Create a Custom Dashboard</Typography>
      <Box sx={{ mt: 2, maxWidth: 500 }}>
        <TextField
          fullWidth
          label="Dashboard Name"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormGroup>
          {widgetOptions.map((w) => (
            <FormControlLabel
              key={w.id}
              control={
                <Checkbox
                  checked={customWidgets.includes(w.id)}
                  onChange={() => toggleCustomWidget(w.id)}
                />
              }
              label={w.label}
            />
          ))}
        </FormGroup>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={saveCustomDashboard}
        >
          Save Custom Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
