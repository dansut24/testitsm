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
  CircularProgress,
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { widgetRegistry } from "../components/widgetRegistry";
import LinkOffIcon from "@mui/icons-material/LinkOff";

const Settings = () => {
  const { user, authLoading } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [linkedIdentities, setLinkedIdentities] = useState([]);
  const [unlinking, setUnlinking] = useState(null);

  useEffect(() => {
    const fetchLinkedAccounts = async () => {
      const { data, error } = await supabase.auth.getUserIdentities();
      if (error) {
        console.error("Error fetching identities", error);
        return;
      }
      setLinkedIdentities(data.identities || []);
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

  const handleUnlink = async (identity) => {
    setUnlinking(identity.provider);
    const { error } = await supabase.auth.unlinkIdentity(identity);
    if (error) {
      console.error("Unlink error:", error.message);
      setStatus({ type: "error", message: `❌ Failed to unlink ${identity.provider}.` });
    } else {
      setStatus({ type: "success", message: `✅ Unlinked ${identity.provider} successfully.` });
      setLinkedIdentities((prev) =>
        prev.filter((id) => id.provider !== identity.provider)
      );
    }
    setUnlinking(null);
  };

  const hasEmailIdentity = linkedIdentities.some((id) => id.provider === "email");

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

          {linkedIdentities.length === 0 ? (
            <Alert severity="info">No linked accounts found.</Alert>
          ) : (
            <List>
              {linkedIdentities.map((identity) => {
                const isEmail = identity.provider === "email";
                return (
                  <ListItem key={identity.provider} divider>
                    <ListItemText
                      primary={
                        identity.provider.charAt(0).toUpperCase() +
                        identity.provider.slice(1)
                      }
                      secondary={
                        isEmail
                          ? "Primary account - cannot unlink"
                          : identity.identity_data?.email || ""
                      }
                    />
                    {!isEmail && linkedIdentities.length > 1 && (
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={() => handleUnlink(identity)}
                          disabled={unlinking === identity.provider}
                        >
                          {unlinking === identity.provider ? (
                            <CircularProgress size={20} />
                          ) : (
                            <LinkOffIcon />
                          )}
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                );
              })}
            </List>
          )}
        </>
      )}
    </Box>
  );
};

export default Settings;
