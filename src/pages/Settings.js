import React, { useState } from "react";
import {
  Box, Typography, Button, Alert
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { widgetRegistry } from "../components/widgetRegistry";

const Settings = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);

  const handleCreateDashboard = async () => {
    const defaultLayout = Object.keys(widgetRegistry);

    const { error } = await supabase.from("dashboard_layouts").upsert({
      user_id: user.id,
      layout: defaultLayout,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to save dashboard layout:", error);
      setStatus({ type: "error", message: "❌ Failed to create dashboard layout." });
    } else {
      setStatus({ type: "success", message: "✅ Dashboard layout created successfully!" });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Dashboard Layout</Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        You can create or reset your dashboard layout using the button below.
      </Typography>

      <Button variant="contained" onClick={handleCreateDashboard}>
        Create Dashboard Layout
      </Button>

      {status && (
        <Alert severity={status.type} sx={{ mt: 2 }}>
          {status.message}
        </Alert>
      )}
    </Box>
  );
};

export default Settings;
