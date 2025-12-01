// src/itsm/components/TenantOnboardingBanner.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  LinearProgress,
} from "@mui/material";
import { supabase } from "../../common/utils/supabaseClient";

const TenantOnboardingBanner = () => {
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [tenantSettings, setTenantSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadOnboarding = async () => {
      try {
        // 1) Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          console.warn("OnboardingBanner: no user", userError);
          setLoading(false);
          return;
        }
        const user = userData.user;

        // 2) Get their profile/tenant
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("tenant_id, role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError || !profile?.tenant_id) {
          console.warn("OnboardingBanner: no tenant profile", profileError);
          setLoading(false);
          return;
        }

        const tenantId = profile.tenant_id;

        // 3) Load tenant_settings
        const { data: settings, error: settingsError } = await supabase
          .from("tenant_settings")
          .select("id, tenant_id, onboarding_complete, logo_url")
          .eq("tenant_id", tenantId)
          .maybeSingle();

        if (settingsError) {
          console.warn("OnboardingBanner: tenant_settings error", settingsError);
          setLoading(false);
          return;
        }

        if (!settings) {
          // no settings means nothing to show
          setLoading(false);
          return;
        }

        setTenantSettings(settings);
        setLoading(false);
      } catch (err) {
        console.error("OnboardingBanner: unexpected error", err);
        setLoading(false);
      }
    };

    loadOnboarding();
  }, []);

  const handleMarkComplete = async () => {
    if (!tenantSettings?.id) {
      setHidden(true);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("tenant_settings")
        .update({ onboarding_complete: true })
        .eq("id", tenantSettings.id);

      if (error) {
        console.error("OnboardingBanner: mark complete error", error);
      } else {
        setTenantSettings((prev) =>
          prev ? { ...prev, onboarding_complete: true } : prev
        );
      }
    } catch (err) {
      console.error("OnboardingBanner: unexpected save error", err);
    } finally {
      setSaving(false);
    }
  };

  // Simple local hide (without updating DB)
  const handleHideForNow = () => {
    setHidden(true);
  };

  if (loading) {
    // While fetching, we could show a very slim progress bar or nothing.
    return (
      <Box sx={{ mb: 2 }}>
        <LinearProgress sx={{ borderRadius: 999 }} />
      </Box>
    );
  }

  // If no settings or onboarding already complete, or user hid it, show nothing
  if (!tenantSettings || tenantSettings.onboarding_complete || hidden) {
    return null;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          label="Tenant Onboarding"
          color="primary"
          size="small"
          sx={{ fontWeight: 600 }}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          Finish setting up your ITSM workspace.
        </Typography>
      </Stack>

      <Typography variant="body1">
        Welcome to Hi5Tech ITSM 🎉  
        Before you roll this out to end users, we recommend completing the steps
        below so everything looks and behaves correctly.
      </Typography>

      <Box>
        <Typography
          variant="subtitle2"
          sx={{ mb: 0.5, textTransform: "uppercase", fontSize: 11 }}
          color="text.secondary"
        >
          Recommended setup steps
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="body2">
            • Add your internal users and assign roles (Agents, Approvers, etc.)
          </Typography>
          <Typography variant="body2">
            • Configure authentication methods (email login, Google, Azure AD)
          </Typography>
          <Typography variant="body2">
            • Review email templates for incident/service request notifications
          </Typography>
          <Typography variant="body2">
            • Set your SLAs & priorities for Incidents and Requests
          </Typography>
          <Typography variant="body2">
            • Configure self-service portal & knowledge base basics
          </Typography>
        </Stack>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ mt: 1 }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={handleMarkComplete}
          disabled={saving}
        >
          {saving ? "Saving..." : "Mark onboarding as complete"}
        </Button>
        <Button
          variant="text"
          size="small"
          onClick={handleHideForNow}
          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          Hide for now
        </Button>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        You can always revisit these settings under{" "}
        <strong>Settings &gt; Tenant / Admin</strong>. Once you&apos;re happy,
        mark onboarding as complete to hide this banner for everyone in your
        tenant.
      </Typography>
    </Paper>
  );
};

export default TenantOnboardingBanner;
