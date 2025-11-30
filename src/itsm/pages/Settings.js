// src/settings/Settings.js (or wherever it lives)
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
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from "@mui/material";
import { supabase } from "../../common/utils/supabaseClient";
import { widgetRegistry } from "../../itsm/components/widgetRegistry";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import AddUserModal from "../components/AddUserModal";

import { useThemeMode } from "../theme/ThemeContext"; // ✅ hook

// Default templates for when none are saved yet
const DEFAULT_EMAIL_TEMPLATES = {
  incident_created: {
    subject: "Incident {{reference}} created",
    body_html: `
      <p>Hi {{requester}},</p>
      <p>Your incident <strong>{{reference}}</strong> has been logged with priority <strong>{{priority}}</strong>.</p>
      <p><strong>Title:</strong> {{title}}</p>
      <p><strong>Description:</strong><br/>{{description}}</p>
      <p>Status: {{status}}</p>
      <p>Thanks,<br/>Service Desk</p>
    `,
  },
  incident_updated: {
    subject: "Update on Incident {{reference}}",
    body_html: `
      <p>Hi {{requester}},</p>
      <p>There has been an update to your incident <strong>{{reference}}</strong>.</p>
      <p><strong>Title:</strong> {{title}}</p>
      <p><strong>Description:</strong><br/>{{description}}</p>
      <p>Current status: <strong>{{status}}</strong></p>
      <p>Thanks,<br/>Service Desk</p>
    `,
  },
};

const EMAIL_TEMPLATE_OPTIONS = [
  { key: "incident_created", label: "Incident Created" },
  { key: "incident_updated", label: "Incident Updated" },
];

const Settings = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [linkedProviders, setLinkedProviders] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [providerToUnlink, setProviderToUnlink] = useState(null);
  const [addUserOpen, setAddUserOpen] = useState(false);

  // Sidebar preferences
  const [sidebarMode, setSidebarMode] = useState(
    localStorage.getItem("sidebarMode") || "pinned"
  );

  const { mode, setMode } = useThemeMode(); // ✅ theme mode from context

  const availableProviders = ["google", "github", "azure"];

  // 🔹 Email templates state
  const [emailTemplates, setEmailTemplates] = useState({});
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(
    EMAIL_TEMPLATE_OPTIONS[0].key
  );
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [templateStatus, setTemplateStatus] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);

  // Sample data for preview rendering
  const sampleIncident = {
    reference: "INC1234",
    requester: "Dan Sutton",
    title: "Example incident: Laptop won’t start",
    description:
      "When I press the power button, the laptop briefly lights up and then shuts down.",
    priority: "Medium",
    category: "Hardware",
    status: "Open",
  };

  useEffect(() => {
    const fetchLinkedAccounts = async () => {
      const { data: identitiesData, error } =
        await supabase.auth.getUserIdentities();
      if (!error) {
        setLinkedProviders(identitiesData.identities || []);
      } else {
        console.error("Failed to fetch identities:", error.message);
        setLinkedProviders([]);
      }
    };

    fetchLinkedAccounts();
  }, []);

  // 🔹 Load existing email templates from Supabase
  useEffect(() => {
    const loadEmailTemplates = async () => {
      setTemplateLoading(true);
      setTemplateStatus(null);

      const { data, error } = await supabase
        .from("email_templates")
        .select("key, subject, body_html");

      if (error) {
        console.error("Failed to load email templates:", error.message);
        setTemplateStatus({
          type: "error",
          message: "Could not load email templates from the database.",
        });
        setTemplateLoading(false);
        return;
      }

      const map = {};
      (data || []).forEach((tpl) => {
        map[tpl.key] = tpl;
      });
      setEmailTemplates(map);
      setTemplateLoading(false);
    };

    loadEmailTemplates();
  }, []);

  // 🔹 Whenever selected template key or loaded templates change, populate fields
  useEffect(() => {
    const existing = emailTemplates[selectedTemplateKey];
    if (existing) {
      setTemplateSubject(existing.subject || "");
      setTemplateBody(existing.body_html || "");
    } else {
      const fallback = DEFAULT_EMAIL_TEMPLATES[selectedTemplateKey];
      setTemplateSubject(fallback?.subject || "");
      setTemplateBody(fallback?.body_html || "");
    }
    setTemplateStatus(null);
  }, [selectedTemplateKey, emailTemplates]);

  const renderPreview = () => {
    const renderString = (str) =>
      (str || "").replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
        return sampleIncident[key] || match;
      });

    return {
      subject: renderString(templateSubject),
      html: renderString(templateBody),
    };
  };

  const handleSaveTemplate = async () => {
    setTemplateSaving(true);
    setTemplateStatus(null);

    const { error } = await supabase.from("email_templates").upsert({
      key: selectedTemplateKey,
      subject: templateSubject,
      body_html: templateBody,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to save template:", error.message);
      setTemplateStatus({
        type: "error",
        message: "Failed to save template. Please try again.",
      });
    } else {
      setEmailTemplates((prev) => ({
        ...prev,
        [selectedTemplateKey]: {
          key: selectedTemplateKey,
          subject: templateSubject,
          body_html: templateBody,
        },
      }));
      setTemplateStatus({
        type: "success",
        message: "Template saved successfully.",
      });
    }

    setTemplateSaving(false);
  };

  const handleResetTemplate = () => {
    const fallback = DEFAULT_EMAIL_TEMPLATES[selectedTemplateKey];
    setTemplateSubject(fallback?.subject || "");
    setTemplateBody(fallback?.body_html || "");
    setTemplateStatus({
      type: "info",
      message: "Reverted to default template (not yet saved).",
    });
  };

  const handleCreateDashboard = async () => {
    setLoading(true);
    setStatus(null);

    const defaultLayout = Object.keys(widgetRegistry);

    const { error } = await supabase.from("dashboard_layouts").upsert({
      user_id: "demo-user", // placeholder
      layout: defaultLayout,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setStatus({
        type: "error",
        message: "❌ Failed to create dashboard layout.",
      });
    } else {
      setStatus({
        type: "success",
        message: "✅ Dashboard layout created successfully!",
      });
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

    const identity = allIdentities.find(
      (id) => id.provider === providerToUnlink
    );
    if (!identity) {
      alert("Provider not linked.");
      return;
    }

    const { error } = await supabase.auth.unlinkIdentity(identity);
    if (error) {
      alert(`Failed to unlink ${providerToUnlink}: ${error.message}`);
    } else {
      setLinkedProviders((prev) =>
        prev.filter((id) => id.provider !== providerToUnlink)
      );
      setStatus({
        type: "success",
        message: `✅ Unlinked ${providerToUnlink} successfully.`,
      });
    }
  };

  const handleLink = async (provider) => {
    try {
      const { error } = await supabase.auth.linkIdentity({ provider });
      if (error) {
        alert(`❌ Failed to link ${provider}: ${error.message}`);
      } else {
        alert(`✅ Linked ${provider} successfully.`);
      }
    } catch (err) {
      alert("❌ Unexpected error occurred while linking.");
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case "google":
        return <GoogleIcon sx={{ mr: 1 }} />;
      case "github":
        return <GitHubIcon sx={{ mr: 1 }} />;
      case "azure":
        return <BusinessIcon sx={{ mr: 1 }} />;
      case "email":
        return <EmailIcon sx={{ mr: 1 }} />;
      default:
        return null;
    }
  };

  const linkedProviderKeys = linkedProviders.map((p) => p.provider);
  const unlinkedProviders = availableProviders.filter(
    (p) => !linkedProviderKeys.includes(p)
  );

  const preview = renderPreview();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Dashboard Settings
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

      {/* Theme Preferences */}
      <Typography variant="h6">Theme Preferences</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Choose how the site looks.
      </Typography>

      <RadioGroup
        value={mode}
        onChange={(e) => setMode(e.target.value)} // ✅ no reload
      >
        <FormControlLabel value="light" control={<Radio />} label="Light Theme" />
        <FormControlLabel value="dark" control={<Radio />} label="Dark Theme" />
        <FormControlLabel value="vibrant" control={<Radio />} label="Vibrant Theme" />
      </RadioGroup>

      <Divider sx={{ my: 4 }} />

      {/* Sidebar Preferences */}
      <Typography variant="h6">Sidebar Preferences</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Choose how the sidebar behaves in desktop view.
      </Typography>

      <RadioGroup
        value={sidebarMode}
        onChange={(e) => {
          const value = e.target.value;
          setSidebarMode(value);
          localStorage.setItem("sidebarMode", value);
          window.location.reload(); // refresh to apply change
        }}
      >
        <FormControlLabel value="pinned" control={<Radio />} label="Pinned Sidebar" />
        <FormControlLabel value="collapsible" control={<Radio />} label="Collapsible Sidebar" />
        <FormControlLabel value="hidden" control={<Radio />} label="Hidden Sidebar" />
      </RadioGroup>

      <Divider sx={{ my: 4 }} />

      {/* 🔹 Email Templates Section */}
      <Typography variant="h6" gutterBottom>
        Email Templates (Notifications)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Customise the emails sent for incidents. Use placeholders like{" "}
        <code>{`{{reference}}`}</code>, <code>{`{{requester}}`}</code>,{" "}
        <code>{`{{title}}`}</code>, <code>{`{{description}}`}</code>,{" "}
        <code>{`{{priority}}`}</code>, <code>{`{{status}}`}</code>.
      </Typography>

      {/* Template selector */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        {EMAIL_TEMPLATE_OPTIONS.map((opt) => (
          <Button
            key={opt.key}
            size="small"
            variant={
              selectedTemplateKey === opt.key ? "contained" : "outlined"
            }
            onClick={() => setSelectedTemplateKey(opt.key)}
          >
            {opt.label}
          </Button>
        ))}
      </Stack>

      {templateStatus && (
        <Alert severity={templateStatus.type} sx={{ mb: 2 }}>
          {templateStatus.message}
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        alignItems="flex-start"
      >
        {/* Editor */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TextField
            fullWidth
            label="Email Subject"
            value={templateSubject}
            onChange={(e) => setTemplateSubject(e.target.value)}
            margin="normal"
            disabled={templateLoading}
          />
          <TextField
            fullWidth
            label="Email Body (HTML)"
            value={templateBody}
            onChange={(e) => setTemplateBody(e.target.value)}
            margin="normal"
            multiline
            minRows={8}
            disabled={templateLoading}
            helperText="HTML allowed. Use {{placeholders}} to inject incident data."
          />

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSaveTemplate}
              disabled={templateSaving || templateLoading}
            >
              {templateSaving ? "Saving..." : "Save Template"}
            </Button>
            <Button
              variant="text"
              color="secondary"
              onClick={handleResetTemplate}
              disabled={templateLoading}
            >
              Reset to Default
            </Button>
          </Stack>
        </Box>

        {/* Preview */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Live Preview (sample data)
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            Subject: {preview.subject || "(no subject)"}
          </Typography>
          <Box
            sx={{
              mt: 1,
              p: 1.5,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              maxHeight: 260,
              overflow: "auto",
              bgcolor: "background.default",
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: preview.html || "" }}
            />
          </Box>
        </Box>
      </Stack>

      <Divider sx={{ my: 4 }} />

      {/* Linked Accounts */}
      <Typography variant="h6">Linked Accounts</Typography>
      {linkedProviders.length === 0 ? (
        <Alert severity="info">No linked accounts found.</Alert>
      ) : (
        <List>
          {linkedProviders.map((identity) => (
            <ListItem key={identity.provider} divider>
              {getProviderIcon(identity.provider)}
              <ListItemText
                primary={
                  identity.provider.charAt(0).toUpperCase() +
                  identity.provider.slice(1)
                }
              />
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

      {unlinkedProviders.length > 0 && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6">Link New Accounts</Typography>
          <Stack direction="column" spacing={1} sx={{ mt: 2 }}>
            {unlinkedProviders.map((provider) => (
              <Button
                key={provider}
                variant="outlined"
                startIcon={getProviderIcon(provider)}
                onClick={() => handleLink(provider)}
              >
                Link {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </Button>
            ))}
          </Stack>
        </>
      )}

      {/* Add user */}
      <Divider sx={{ my: 4 }} />
      <Typography variant="h6">Manage Users</Typography>
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => setAddUserOpen(true)}
      >
        Add User
      </Button>
      <AddUserModal
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        tenantId={"demo-tenant"}
      />

      {/* Confirm unlink dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Unlink</DialogTitle>
        <DialogContent>
          Are you sure you want to unlink{" "}
          <strong>{providerToUnlink}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUnlinkConfirmed}
            color="error"
            variant="contained"
          >
            Unlink
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
