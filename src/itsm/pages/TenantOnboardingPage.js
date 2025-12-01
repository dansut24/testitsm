import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Paper,
  Stack,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";
import AddUserModal from "../components/AddUserModal";

const TIMEZONES = [
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Singapore",
];

const TenantOnboardingPage = () => {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const [tenantId, setTenantId] = useState(null);
  const [tenantSettingsId, setTenantSettingsId] = useState(null);

  const [companyName, setCompanyName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [timezone, setTimezone] = useState("Europe/London");

  const [userCount, setUserCount] = useState(0);
  const [addUserOpen, setAddUserOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoadingInitial(true);
        setStatus(null);

        // 1) Current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          if (!cancelled) {
            setStatus({
              type: "error",
              message: "You must be signed in to access tenant onboarding.",
            });
            setLoadingInitial(false);
          }
          return;
        }

        const userId = session.user.id;

        // 2) Profile to get tenant & role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("tenant_id, role")
          .eq("id", userId)
          .maybeSingle();

        if (profileError || !profile?.tenant_id) {
          console.warn("Tenant onboarding: profile not found", profileError);
          if (!cancelled) {
            setStatus({
              type: "error",
              message: "Profile or tenant not found for current user.",
            });
            setLoadingInitial(false);
          }
          return;
        }

        const role = profile.role || "user";
        const isAdmin = ["admin", "owner", "super_admin"].includes(
          role.toLowerCase()
        );
        if (!isAdmin) {
          if (!cancelled) {
            setStatus({
              type: "error",
              message: "Only tenant admins can access this setup flow.",
            });
            setLoadingInitial(false);
          }
          return;
        }

        const tenantIdLocal = profile.tenant_id;
        setTenantId(tenantIdLocal);

        // 3) Tenant record (name, subdomain)
        const { data: tenant, error: tenantError } = await supabase
          .from("tenants")
          .select("id, name, subdomain")
          .eq("id", tenantIdLocal)
          .maybeSingle();

        if (tenantError || !tenant) {
          console.warn("Tenant onboarding: tenant not found", tenantError);
        } else {
          setCompanyName(tenant.name || "");
          setSubdomain(tenant.subdomain || "");
        }

        // 4) Tenant settings (timezone, support email)
        const { data: settings, error: settingsError } = await supabase
          .from("tenant_settings")
          .select("id, timezone, support_email")
          .eq("tenant_id", tenantIdLocal)
          .maybeSingle();

        if (settingsError) {
          console.warn("Tenant onboarding: tenant_settings error", settingsError);
        }

        if (!settings) {
          // Create baseline settings row if missing
          const { data: inserted, error: insertError } = await supabase
            .from("tenant_settings")
            .insert([
              {
                tenant_id: tenantIdLocal,
                timezone: "Europe/London",
                support_email: "",
              },
            ])
            .select()
            .single();

          if (insertError) {
            console.warn(
              "Tenant onboarding: failed to insert tenant_settings",
              insertError
            );
          } else {
            setTenantSettingsId(inserted.id);
            setTimezone(inserted.timezone || "Europe/London");
            setSupportEmail(inserted.support_email || "");
          }
        } else {
          setTenantSettingsId(settings.id);
          setTimezone(settings.timezone || "Europe/London");
          setSupportEmail(settings.support_email || "");
        }

        // 5) User count for this tenant (from your users table)
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id", { count: "exact" })
          .eq("tenant_id", tenantIdLocal);

        if (usersError) {
          console.warn("Tenant onboarding: users count error", usersError);
        } else {
          setUserCount(users?.length ?? 0);
        }

        if (!cancelled) {
          setLoadingInitial(false);
        }
      } catch (err) {
        console.error("Tenant onboarding initial load error:", err);
        if (!cancelled) {
          setStatus({
            type: "error",
            message:
              "There was a problem loading tenant onboarding data. Please try again.",
          });
          setLoadingInitial(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveCompanyInfo = async () => {
    if (!tenantId) return;
    setSaving(true);
    setStatus(null);

    try {
      // Update tenants
      const { error: tenantError } = await supabase
        .from("tenants")
        .update({ name: companyName })
        .eq("id", tenantId);

      if (tenantError) {
        throw tenantError;
      }

      // Update tenant_settings
      if (tenantSettingsId) {
        const { error: settingsError } = await supabase
          .from("tenant_settings")
          .update({
            timezone,
            support_email: supportEmail,
          })
          .eq("id", tenantSettingsId);

        if (settingsError) throw settingsError;
      }

      setStatus({
        type: "success",
        message: "Company profile & timezone updated.",
      });
      setActiveStep(1);
    } catch (err) {
      console.error("Save company info error:", err);
      setStatus({
        type: "error",
        message:
          err?.message || "Could not save company information. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUsersRefreshed = async () => {
    if (!tenantId) return;
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select("id")
        .eq("tenant_id", tenantId);

      if (!error) {
        setUserCount(users?.length ?? 0);
      }
    } catch (err) {
      console.warn("Refresh user count error:", err);
    }
  };

  const handleFinishUsersStep = () => {
    setActiveStep(2);
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  if (loadingInitial) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Tenant Onboarding
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Complete these steps to finish setting up your tenant before inviting
        agents and end-users.
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        <Step>
          <StepLabel>Company profile</StepLabel>
        </Step>
        <Step>
          <StepLabel>Users & roles</StepLabel>
        </Step>
        <Step>
          <StepLabel>Finish</StepLabel>
        </Step>
      </Stepper>

      {status && (
        <Alert severity={status.type} sx={{ mb: 2 }}>
          {status.message}
        </Alert>
      )}

      {/* STEP 0: Company profile */}
      {activeStep === 0 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Company information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This information is used in headers, email templates and self-service
            branding.
          </Typography>

          <TextField
            label="Company name"
            fullWidth
            margin="normal"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <TextField
            label="Subdomain"
            fullWidth
            margin="normal"
            value={subdomain}
            disabled
            helperText={
              subdomain
                ? `${subdomain}-itsm.hi5tech.co.uk`
                : "Subdomain set during tenant creation."
            }
          />

          <TextField
            label="Support email (from address)"
            fullWidth
            margin="normal"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            helperText="This will be used as the primary support / from address in emails."
          />

          <TextField
            select
            label="Default timezone"
            fullWidth
            margin="normal"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            helperText="Used for SLAs, due dates and schedules."
          >
            {TIMEZONES.map((tz) => (
              <MenuItem key={tz} value={tz}>
                {tz}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSaveCompanyInfo}
              disabled={saving}
            >
              {saving ? <CircularProgress size={18} color="inherit" /> : "Save & continue"}
            </Button>
          </Box>
        </Paper>
      )}

      {/* STEP 1: Users & roles */}
      {activeStep === 1 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Users & roles
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add agents and end-users to your tenant. Later you’ll be able to sync
            from Microsoft Entra ID (Azure AD) or import from CSV.
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Current users in this tenant:
            </Typography>
            <Typography variant="h6">{userCount}</Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
            <Button variant="contained" onClick={() => setAddUserOpen(true)}>
              Add user
            </Button>
            <Button variant="outlined" disabled>
              Import from CSV (coming soon)
            </Button>
            <Button variant="outlined" disabled>
              Connect Microsoft Entra ID (coming soon)
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            You can manage detailed roles and permissions later from the Admin
            Settings area.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button onClick={() => setActiveStep(0)}>Back</Button>
            <Button variant="contained" onClick={handleFinishUsersStep}>
              Continue
            </Button>
          </Box>

          {/* Reuse existing AddUserModal */}
          <AddUserModal
            open={addUserOpen}
            onClose={() => {
              setAddUserOpen(false);
              handleUsersRefreshed();
            }}
            tenantId={tenantId}
          />
        </Paper>
      )}

      {/* STEP 2: Finish */}
      {activeStep === 2 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            You’re ready to go 🎉
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your tenant basics are configured. You can now:
          </Typography>
          <ul style={{ marginTop: 0, marginBottom: 16, paddingLeft: 20 }}>
            <li>Raise incidents and service requests</li>
            <li>Invite more agents and end-users</li>
            <li>Fine-tune SLAs, email templates and self-service settings</li>
          </ul>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button onClick={() => setActiveStep(1)}>Back</Button>
            <Button variant="contained" onClick={handleGoToDashboard}>
              Go to Dashboard
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default TenantOnboardingPage;
