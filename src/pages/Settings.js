
import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Radio, Grid, TextField,
  Button, Checkbox, FormControlLabel, FormGroup, IconButton
} from "@mui/material";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  LineChart, Line, CartesianGrid, ResponsiveContainer
} from "recharts";
import DeleteIcon from "@mui/icons-material/Delete";

const layouts = {
  default: ["pie", "bar", "line", "table"],
  minimal: ["pie", "table"],
  analytics: ["pie", "bar", "line"],
};

const widgetOptions = [
  { id: "pie", label: "Incidents by Status" },
  { id: "bar", label: "Requests by Month" },
  { id: "line", label: "Changes Over Time" },
  { id: "table", label: "Latest Incidents" },
  { id: "team", label: "Team Incidents" }
];

const samplePieData = [
  { name: "Open", value: 8 },
  { name: "Closed", value: 12 },
  { name: "Pending", value: 5 },
];

const sampleBarData = [
  { name: "Jan", Requests: 5 },
  { name: "Feb", Requests: 9 },
  { name: "Mar", Requests: 7 },
  { name: "Apr", Requests: 12 },
];

const sampleLineData = [
  { name: "Week 1", Changes: 3 },
  { name: "Week 2", Changes: 5 },
  { name: "Week 3", Changes: 2 },
  { name: "Week 4", Changes: 7 },
];

const COLORS = ["#ff6f61", "#6a67ce", "#6fcf97"];

const DashboardPreview = ({ widgets }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1, scale: '0.6', transformOrigin: 'top left', width: 'fit-content' }}>
    {widgets.map((type, idx) => (
      <Paper key={idx} sx={{ width: 160, height: 140, p: 1 }}>
        <Typography variant="caption" fontWeight="bold">{type.toUpperCase()}</Typography>
        <Box sx={{ width: '100%', height: '100%' }}>
          {{
            pie: (
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie data={samplePieData} dataKey="value" outerRadius={40}>
                    {samplePieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ),
            bar: (
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={sampleBarData}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Bar dataKey="Requests" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ),
            line: (
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={sampleLineData}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Line dataKey="Changes" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            ),
            table: <Box sx={{ fontSize: "0.7em", mt: 1 }}>Incident #1<br />Incident #2</Box>,
            team: <Box sx={{ fontSize: "0.7em", mt: 1 }}>Team A<br />Team B</Box>,
          }[type]}
        </Box>
      </Paper>
    ))}
  </Box>
);

const Settings = () => {
  const [selectedLayout, setSelectedLayout] = useState(() => {
    return localStorage.getItem("selectedDashboard") || "default";
  });
  const [customName, setCustomName] = useState("");
  const [customWidgets, setCustomWidgets] = useState([]);
  const [customDashboards, setCustomDashboards] = useState(() => {
    return JSON.parse(localStorage.getItem("custom-dashboards") || "[]");
  });

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
    const id = customName.toLowerCase().replace(/\s+/g, "-");
    const config = { id, name: customName, widgets: customWidgets };
    const updated = [...customDashboards.filter(d => d.id !== id), config];
    setCustomDashboards(updated);
    setSelectedLayout(id);
    localStorage.setItem("custom-dashboards", JSON.stringify(updated));
    localStorage.setItem("selectedDashboard", id);
    setCustomName("");
    setCustomWidgets([]);
    alert("Custom dashboard saved!");
  };

  const deleteDashboard = (id) => {
    const updated = customDashboards.filter(d => d.id !== id);
    setCustomDashboards(updated);
    localStorage.setItem("custom-dashboards", JSON.stringify(updated));
    if (selectedLayout === id) {
      localStorage.setItem("selectedDashboard", "default");
      setSelectedLayout("default");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Account Settings</Typography>

      <Typography variant="h6" sx={{ mt: 4 }}>Select a Predefined Dashboard</Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {Object.entries(layouts).map(([id, widgets]) => (
          <Grid item xs={12} md={4} key={id}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderColor: selectedLayout === id ? "primary.main" : "grey.300" }}
              onClick={() => handleLayoutChange(id)}
            >
              <Box display="flex" alignItems="center" mb={1}>
                <Radio checked={selectedLayout === id} value={id} onChange={() => handleLayoutChange(id)} />
                <Typography variant="subtitle1">{id.charAt(0).toUpperCase() + id.slice(1)} Layout</Typography>
              </Box>
              <DashboardPreview widgets={widgets} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {customDashboards.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 4 }}>Your Custom Dashboards</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {customDashboards.map((dash) => (
              <Grid item xs={12} md={4} key={dash.id}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, borderColor: selectedLayout === dash.id ? "primary.main" : "grey.300", position: "relative" }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <Radio checked={selectedLayout === dash.id} value={dash.id} onChange={() => handleLayoutChange(dash.id)} />
                      <Typography variant="subtitle1">{dash.name}</Typography>
                    </Box>
                    <IconButton onClick={() => deleteDashboard(dash.id)} size="small"><DeleteIcon /></IconButton>
                  </Box>
                  <DashboardPreview widgets={dash.widgets} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      )}

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
        <Button variant="contained" sx={{ mt: 2 }} onClick={saveCustomDashboard}>
          Save Custom Dashboard
        </Button>

        {customWidgets.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Live Preview:</Typography>
            <DashboardPreview widgets={customWidgets} />
          </Box>
        )}
      </Box>
    
      {/* Full page preview */}
      <Typography variant="h6" sx={{ mt: 6 }}>Full Page Live Preview</Typography>
      <Paper variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
        <iframe
          title="Dashboard Preview"
          src="/dashboard?preview=true"
          style={{
            width: "100%",
            height: 600,
            border: "none",
            borderRadius: "8px",
          }}
        />
      </Paper>
</Box>
  );
};

export default Settings;
