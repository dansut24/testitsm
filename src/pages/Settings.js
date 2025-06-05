import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Alert
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { widgetRegistry } from "../components/widgetRegistry";

const Settings = () => {
  const { user, authLoading } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔍 Debug Logging
  console.log("🔍 Auth Debug:");
  console.log("User:", user);
  console.log("User ID:", user?.id);
  console.log("User Role:", user?.role);
  console.log("Auth Loading:", authLoading);

  const handleCreateDashboard = async () => {
    if (!user?.id) {
      setStatus({ type: "error", message: "⚠️ User not authenticated." });
      return;
    }

    setLoading(true);
    setStatus(null);

    const defaultLayout = Object.keys(widgetRegistry);

    const { error } = await supabase
      .from("dashboard_layouts")
      .upsert({
        user_id: user.id,
        layout: defaultLayout,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("❌ Supabase insert error:", error);
      setStatus({ type: "error", message: "❌ Failed to create dashboard layout." });
    } else {
      console.log("✅ Dashboard layout created successfully.");
      setStatus({ type: "success", message: "✅ Dashboard layout created successfully!" });
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading session...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Dashboard Settings
      </Typography>

      {!user?.id ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          User is not authenticated. Please log in to configure your dashboard.
        </Alert>
      ) : (
        <>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Use the button below to create your personal dashboard layout with default widgets.
          </Typography>

          <Button
            variant="contained"
            onClick={handleCreateDashboard}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Dashboard Layout"}
          </Button>

          {status && (
            <Alert severity={status.type} sx={{ mt: 2 }}>
              {status.message}
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default Settings;
