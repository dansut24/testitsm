// src/itsm/components/TenantOnboardingBanner.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Stack,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/HourglassBottom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { supabase } from "../../common/utils/supabaseClient";

const TenantOnboardingBanner = () => {
  const [loading, setLoading] = useState(true);
  const [shouldShow, setShouldShow] = useState(false);
  const [tenantSettings, setTenantSettings] = useState(null);
  const [stepsState, setStepsState] = useState({
    email_setup: false,
    users_imported: false,
    azure_connected: false,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1) Get current user + profile (for tenant + role)
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (!cancelled) {
            setShouldShow(false);
            setLoading(false);
          }
          return;
        }

        const userId = session.user.id;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("tenant_id, role")
          .eq("id", userId)
          .maybeSingle();

        if (profileError || !profile?.tenant_id) {
          console.warn("Onboarding banner: profile/tenant not found", profileError);
          if (!cancelled) {
            setShouldShow(false);
            setLoading(false);
          }
          return;
        }

        // Only show for admins / owners
        const role = profile.role || "user";
        const isAdmin = ["admin", "owner", "super_admin"].includes(
          role.toLowerCase()
        );
        if (!isAdmin) {
          if (!cancelled) {
            setShouldShow(false);
            setLoading(false);
          }
          return;
        }

        // 2) Fetch tenant_settings for this tenant
        const { data: settings, error: settingsError } = await supabase
          .from("tenant_settings")
          .select("id, tenant_id, onboarding_complete, onboarding_steps")
          .eq("tenant_id", profile.tenant_id)
          .maybeSingle();

        if (settingsError) {
          console.warn("Onboarding banner: tenant_settings error", settingsError);
          if (!cancelled) {
            setShouldShow(false);
            setLoading(false);
          }
          return;
        }

        // If no row yet, create a default row so we can track onboarding
        let effectiveSettings = settings;
        if (!settings) {
          const { data: inserted, error: insertError } = await supabase
            .from("tenant_settings")
            .insert([
              {
                tenant_id: profile.tenant_id,
                onboarding_complete: false,
                onboarding_steps: {
                  email_setup: false,
                  users_imported: false,
                  azure_connected: false,
                },
              },
            ])
            .select()
            .single();

          if (insertError) {
            console.warn("Onboarding banner: insert tenant_settings failed", insertError);
            if (!cancelled) {
              setShouldShow(false);
              setLoading(false);
            }
            return;
          }
          effectiveSettings = inserted;
        }

        const onboardingComplete = !!effectiveSettings.onboarding_complete;
        const rawSteps = effectiveSettings.onboarding_steps || {};

        const normalizedSteps = {
          email_setup: !!rawSteps.email_setup,
          users_imported: !!rawSteps.users_imported,
          azure_connected: !!rawSteps.azure_connected,
        };

        if (!cancelled) {
          setTenantSettings(effectiveSettings);
          setStepsState(normalizedSteps);
          setShouldShow(!onboardingComplete); // show only if not complete
          setLoading(false);
        }
      } catch (err) {
        console.error("Onboarding banner error:", err);
        if (!cancelled) {
          setShouldShow(false);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkStepDone = async (key) => {
    if (!tenantSettings) return;

    const newSteps = {
      ...stepsState,
      [key]: true,
    };

    const allDone =
      newSteps.email_setup && newSteps.users_imported && newSteps.azure_connected;

    try {
      const { data, error } = await supabase
        .from("tenant_settings")
        .update({
          onboarding_steps: newSteps,
          onboarding_complete: allDone,
        })
        .eq("id", tenantSettings.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Onboarding banner: update steps error", error);
        return;
      }

      setStepsState(newSteps);
      setTenantSettings(data);
      if (allDone) setShouldShow(false);
    } catch (err) {
      console.error("Onboarding banner: mark step done error", err);
    }
  };

  const handleDismissForever = async () => {
    if (!tenantSettings) {
      setShouldShow(false);
      return;
    }
    try {
      const { error } = await supabase
        .from("tenant_settings")
        .update({ onboarding_complete: true })
        .eq("id", tenantSettings.id);

      if (error) {
        console.error("Onboarding banner: dismiss error", error);
        return;
      }
      setShouldShow(false);
    } catch (err) {
      console.error("Onboarding banner: dismiss exception", err);
    }
  };

  if (loading || !shouldShow) return null;

  const totalSteps = 3;
  const completedCount = Object.values(stepsState).filter(Boolean).length;
  const progress = (completedCount / totalSteps) * 100;

  const steps = [
    {
      key: "email_setup",
      label: "Connect outbound email (Resend or SMTP)",
      description: "Ensure incident notifications & approvals can be emailed.",
    },
    {
      key: "users_imported",
      label: "Add or import users",
      description: "Create agents and end-users via CSV or manual entry.",
    },
    {
      key: "azure_connected",
      label: "Connect Microsoft Entra ID (Azure AD)",
      description: "Enable SSO and automatic user/group provisioning.",
    },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        border: "1px solid",
        borderColor: "primary.light",
        background:
          "linear-gradient(135deg, rgba(33,150,243,0.06) 0%, rgba(76,175,80,0.05) 100%)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.7 }}>
            Tenant onboarding
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Finish setting up your tenant so agents and self-service users are ready to go.
          </Typography>
        </Box>
        <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {completedCount} of {totalSteps} steps complete
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mt: 0.5, borderRadius: 999 }}
          />
        </Box>
      </Box>

      {/* Steps */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {steps.map((step) => {
          const done = stepsState[step.key];
          return (
            <Paper
              key={step.key}
              variant="outlined"
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 2,
                borderColor: done ? "success.light" : "divider",
                backgroundColor: done ? "rgba(76,175,80,0.04)" : "background.paper",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {done ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <PendingIcon color="warning" fontSize="small" />
                )}
                <Typography variant="subtitle2">{step.label}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
              <Box sx={{ mt: "auto", pt: 1 }}>
                {done ? (
                  <Chip size="small" label="Completed" color="success" />
                ) : (
                  <Button
                    size="small"
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => handleMarkStepDone(step.key)}
                  >
                    Mark as done
                  </Button>
                )}
              </Box>
            </Paper>
          );
        })}
      </Stack>

      {/* Footer actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Only visible to tenant admins. You can complete or dismiss this once your setup is done.
        </Typography>
        <Button size="small" color="inherit" onClick={handleDismissForever}>
          Don’t show again
        </Button>
      </Box>
    </Paper>
  );
};

export default TenantOnboardingBanner;
