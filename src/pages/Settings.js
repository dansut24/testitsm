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
import GoogleIcon from "@mui/icons-material/Google";
import EmailIcon from "@mui/icons-material/Email";

const Settings = () => {
  const { user, authLoading } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [linkedProviders, setLinkedProviders] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [providerToUnlink, setProviderToUnlink] = useState(null);

  useEffect(() => {
    const fetchLinkedAccounts = async () => {
      const { data: identitiesData, error } = await supabase.auth.getUserIdentities();
      if (!error) {
        setLinkedProviders(identitiesData.identities || []);
      } else {
        console.error("Failed to fetch identities:", error.message);
        setLinkedProviders([]);
      }
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
    setProviderToUnlink(provider);
    setConfirmOpen(true);
  };

  const handleUnlinkConfirmed = async () => {
    setConfirmOpen(false);

    const { data: identitiesData } = await supabase.auth.getUserIdentities();
    const allIdentities = identitiesData.identities;

    if (allIdentities.length <= 1) {
      alert("You must have at least one linked identity.");
      return;
    }

    const identity = allIdentities.find((id) => id.provider === providerToUnlink);

    if (!identity) {
      alert("Provider not linked.");
      return;
    }

    const { error } = await supabase.auth.unlinkIdentity(identity);
    if (error) {
      console.error("Failed to unlink identity:", error);
      alert(`Failed to unlink ${providerToUnlink}: ${error.message}`);
    } else {
      setLinkedProviders((prev) => prev.filter((id) => id.provider !== providerToUnlink));
      setStatus({ type: "success", message: `✅ Unlinked ${providerToUnlink} successfully.` });
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case "google":
        return <GoogleIcon sx={{ mr: 1 }} />;
      case "email":
        return <EmailIcon sx={{ mr: 1 }} />;
      default:
        return null;
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

          <Button variant="contained" onClick={handleCreateDashboard} disabled={loading}>
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
              {linkedProviders.map((identity) => (
                <ListItem key={identity.provider} divider>
                  {getProviderIcon(identity.provider)}
                  <ListItemText primary={identity.provider.charAt(0).toUpperCase() + identity.provider.slice(1)} />
                  <ListItemSecondaryAction>
                    {identity.provider !== "email" && (
                      <IconButton onClick={() => confirmUnlink(identity.provider)}>
                        <LinkOffIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Unlink</DialogTitle>
        <DialogContent>
          Are you sure you want to unlink <strong>{providerToUnlink}</strong> from your account?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleUnlinkConfirmed} color="error" variant="contained">
            Unlink
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
