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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  const [unlinkDialog, setUnlinkDialog] = useState({ open: false, provider: null });

  useEffect(() => {
    const fetchLinkedAccounts = async () => {
      const { data: identitiesData, error } = await supabase.auth.getUserIdentities();
      if (error) {
        console.error("Error fetching identities:", error);
        return;
      }
      const providers = identitiesData.identities.map((id) => id.provider);
      setLinkedProviders(providers);
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

  const confirmUnlink = (provider) => {
    setUnlinkDialog({ open: true, provider });
  };

  const handleUnlinkConfirmed = async () => {
    const provider = unlinkDialog.provider;
    setUnlinkDialog({ open: false, provider: null });

    if (linkedProviders.length <= 1) {
      alert("You must have at least one linked account.");
      return;
    }

    try {
      const { data: identitiesData, error: fetchError } = await supabase.auth.getUserIdentities();
      if (fetchError) {
        console.error("Failed to fetch identities:", fetchError);
        alert("Error fetching identities.");
        return;
      }

      const identityToUnlink = identitiesData.identities.find((id) => id.provider === provider);
      if (!identityToUnlink) {
        alert("Provider not found.");
        return;
      }

      const { error: unlinkError } = await supabase.auth.unlinkIdentity(identityToUnlink);
      if (unlinkError) {
        console.error("Failed to unlink identity:", unlinkError);
        alert("❌ Failed to unlink " + provider);
      } else {
        setLinkedProviders((prev) => prev.filter((p) => p !== provider));
        alert("✅ Successfully unlinked " + provider);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("❌ Unexpected error occurred.");
    }
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
                    <IconButton
                      onClick={() => confirmUnlink(provider)}
                      disabled={provider === "email" || linkedProviders.length <= 1}
                      title={
                        provider === "email"
                          ? "Email cannot be unlinked"
                          : "Unlink " + provider
                      }
                    >
                      <LinkOffIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          <Dialog
            open={unlinkDialog.open}
            onClose={() => setUnlinkDialog({ open: false, provider: null })}
          >
            <DialogTitle>Unlink {unlinkDialog.provider}?</DialogTitle>
            <DialogContent>
              Are you sure you want to unlink {unlinkDialog.provider}? You’ll need another login method to access your account.
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUnlinkDialog({ open: false, provider: null })}>
                Cancel
              </Button>
              <Button color="error" onClick={handleUnlinkConfirmed}>
                Confirm Unlink
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default Settings;
