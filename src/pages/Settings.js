import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Paper, Radio, Grid, TextField,
  Button, Checkbox, FormControlLabel, FormGroup, IconButton, ToggleButtonGroup, ToggleButton
} from "@mui/material";
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

const DashboardPreview = ({ widgets }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1, scale: '0.6', transformOrigin: 'top left', width: 'fit-content' }}>
    {widgets.map((type, idx) => (
      <Paper key={idx} sx={{ width: 160, height: 140, p: 1 }}>
        <Typography variant="caption" fontWeight="bold">{type.toUpperCase()}</Typography>
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
  const [previewMode, setPreviewMode] = useState("desktop");
  const iframeRef = useRef(null);

  const handleLayoutChange = (id) => {
    setSelectedLayout(id);
    localStorage.setItem("selectedDashboard", id);
    reloadIframe();
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
    reloadIframe();
  };

  const deleteDashboard = (id) => {
    const updated = customDashboards.filter(d => d.id !== id);
    setCustomDashboards(updated);
    localStorage.setItem("custom-dashboards", JSON.stringify(updated));
    if (selectedLayout === id) {
      localStorage.setItem("selectedDashboard", "default");
      setSelectedLayout("default");
    }
    reloadIframe();
  };

  const reloadIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.src = "/dashboard?preview=true&ts=" + Date.now();
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

      {/* Toggle + Full Page Preview */}
      <Typography variant="h6" sx={{ mt: 6 }}>Full Page Live Preview</Typography>
      <Box sx={{ my: 2 }}>
        <ToggleButtonGroup
          value={previewMode}
          exclusive
          onChange={(_, val) => val && setPreviewMode(val)}
          size="small"
        >
          <ToggleButton value="desktop">Desktop</ToggleButton>
          <ToggleButton value="mobile">Mobile</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Paper variant="outlined" sx={{ p: 1, display: "flex", justifyContent: "center", borderRadius: 2 }}>
        <iframe
          ref={iframeRef}
          title="Dashboard Preview"
          src={`/dashboard?preview=true&ts=${Date.now()}`}
          style={{
            width: previewMode === "mobile" ? "375px" : "100%",
            height: previewMode === "mobile" ? "812px" : "600px",
            border: "none",
            pointerEvents: "none",
            borderRadius: "8px",
          }}
        />
      </Paper>
    </Box>
  );
};

export default Settings;
