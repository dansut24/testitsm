// src/pages/AdminSettings.js

import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";

const AdminSettings = () => {
  const [tab, setTab] = useState(0);
  const handleTabChange = (e, newValue) => setTab(newValue);

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Admin Settings</Typography>
      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label="General" />
        <Tab label="Branding" />
        <Tab label="Notifications" />
        <Tab label="Roles" />
      </Tabs>

      <Divider sx={{ my: 2 }} />

      {tab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">General Settings</Typography>
          <TextField label="Company Name" fullWidth sx={{ my: 2 }} />
          <TextField label="Support Email" fullWidth sx={{ my: 2 }} />
          <Button variant="contained">Save</Button>
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Branding</Typography>
          <TextField label="Primary Color" fullWidth sx={{ my: 2 }} />
          <TextField label="Secondary Color" fullWidth sx={{ my: 2 }} />
          <Button variant="contained">Save</Button>
        </Paper>
      )}

      {tab === 2 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">System Notifications</Typography>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Enable Email Alerts"
            sx={{ my: 2 }}
          />
          <Button variant="contained">Save</Button>
        </Paper>
      )}

      {tab === 3 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Roles & Permissions</Typography>
          <Typography variant="body2">Role management features coming soon.</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AdminSettings;
