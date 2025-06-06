import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { widgetRegistry } from "../components/widgetRegistry";
import LinkOffIcon from "@mui/icons-material/LinkOff";

const Settings = () => {
  const { user, authLoading } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [linkedProviders, setLinkedProviders] = useState([]);

  useEffect(() => {
    const fetchLinkedAccounts = async () => {
      const { data: session } = await supabase.auth.getSession();
      const identities = session?.session?.user?.identities || [];
      setLinkedProviders(identities.map((id) => id.provider));
    };

    fetchLinkedAccounts();
  }, []);

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
      setStatus({ type: "success", message: "✅ Dashboard layout created successfully!" });
    }

    setLoading(false);
  };

  const handleUnlink = (provider) => {
    alert(`Unlinking ${provider} is not supported by Supabase at this time.`);
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

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6">Linked Accounts</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These identity providers are linked to your account.
          </Typography>

          {linkedProviders.length === 0 ? (
            <Alert severity="info">No linked accounts found.</Alert>
          ) : (
            <List>
              {linkedProviders.map((provider) => (
                <ListItem key={provider} divider>
                  <ListItemText primary={provider.charAt(0).toUpperCase() + provider.slice(1)} />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleUnlink(provider)}>
                      <LinkOffIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}
    </Box>
  );
};

export default Settings;
