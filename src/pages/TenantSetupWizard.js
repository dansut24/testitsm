// src/pages/TenantSetupWizard.js
import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel,
  FormControlLabel, Checkbox, Grid, Alert, CircularProgress
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const defaultModules = ["Incidents", "Service Requests", "Changes", "Problems", "Assets", "Knowledge Base"];
const defaultTeams = ["Service Desk", "Desktop Support", "Server Support", "Network Team"];
const steps = ["Company Info", "Admin Info", "Verify Email", "Modules", "Teams", "Logo", "Finish"];

const TenantSetupWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    otpCode: "",
    modules: [],
    teams: [],
    logoFile: null,
  });
  const [status, setStatus] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [userId, setUserId] = useState(null);
  const [tenantId, setTenantId] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleCheckboxChange = (field, value) => {
    const current = formData[field];
    setFormData({
      ...formData,
      [field]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    });
  };
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, logoFile: file });
  };

  const sendOtp = async () => {
    setVerifying(true);
    setStatus(null);
    const { adminEmail } = formData;
    const { error } = await supabase.auth.signInWithOtp({
      email: adminEmail,
      options: {
        shouldCreateUser: true,
        data: {
          full_name: formData.adminName,
          role: "admin",
        },
      },
    });
    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setOtpSent(true);
    }
    setVerifying(false);
  };

  const verifyOtp = async () => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: formData.adminEmail,
      token: formData.otpCode,
      type: "email",
    });

    if (error || !data?.session?.user) {
      return setStatus({ type: "error", message: error?.message || "OTP verification failed" });
    }

    setUserId(data.session.user.id);
    setStep(3); // Advance to modules selection
  };

  const handleSubmit = async () => {
    setStatus(null);
    const {
      companyName, subdomain, adminPassword, modules, teams, logoFile
    } = formData;

    const domain = `${subdomain.toLowerCase()}.hi5tech.co.uk`;

    // 1. Update password manually
    const { error: pwError } = await supabase.auth.updateUser({ password: adminPassword });
    if (pwError) return setStatus({ type: "error", message: "Password set failed" });

    // 2. Insert Tenant
    const { data: tenantInsert, error: tenantError } = await supabase
      .from("tenants")
      .insert([{ name: companyName, domain, subdomain, created_by: userId }])
      .select()
      .single();

    if (tenantError) return setStatus({ type: "error", message: tenantError.message });
    const newTenantId = tenantInsert.id;
    setTenantId(newTenantId);

    // 3. Update profile
    await supabase.from("profiles").update({ tenant_id: newTenantId }).eq("id", userId);

    // 4. Insert tenant settings
    await supabase.from("tenant_settings").insert({
      tenant_id: newTenantId,
      modules,
      logo_url: "",
    });

    // 5. Create Teams
    for (let team of teams) {
      await supabase.from("teams").insert({ tenant_id: newTenantId, name: team });
    }

    // 6. Upload logo (optional)
    if (logoFile) {
      const { error: uploadError } = await supabase.storage
        .from("tenant-logos")
        .upload(`${subdomain}/logo.png`, logoFile, {
          upsert: true,
          cacheControl: "3600",
        });

      if (!uploadError) {
        const publicUrl = supabase.storage
          .from("tenant-logos")
          .getPublicUrl(`${subdomain}/logo.png`).data.publicUrl;

        await supabase.from("tenant_settings").update({ logo_url: publicUrl }).eq("tenant_id", newTenantId);
      }
    }

    // Redirect
    window.location.href = `https://${subdomain}.hi5tech.co.uk/dashboard`;
  };

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>Tenant Setup</Typography>
      <Stepper activeStep={step} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4 }}>
        {step === 0 && (
          <>
            <TextField
              label="Company Name"
              name="companyName"
              fullWidth
              margin="normal"
              value={formData.companyName}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  companyName: name,
                  subdomain: name.toLowerCase().replace(/\s+/g, ""),
                });
              }}
            />
            <TextField
              label="Subdomain"
              name="subdomain"
              fullWidth
              margin="normal"
              value={formData.subdomain}
              onChange={handleChange}
              InputProps={{ endAdornment: <Typography>.hi5tech.co.uk</Typography> }}
            />
          </>
        )}

        {step === 1 && (
          <>
            <TextField label="Full Name" name="adminName" fullWidth margin="normal" value={formData.adminName} onChange={handleChange} />
            <TextField label="Email" name="adminEmail" fullWidth margin="normal" value={formData.adminEmail} onChange={handleChange} />
            <TextField label="Password" name="adminPassword" fullWidth margin="normal" type="password" value={formData.adminPassword} onChange={handleChange} />
            <Button onClick={sendOtp} variant="outlined" sx={{ mt: 2 }} disabled={verifying}>
              {verifying ? <CircularProgress size={20} /> : "Send Verification Code"}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <TextField
              label="Enter OTP Code"
              name="otpCode"
              fullWidth
              margin="normal"
              value={formData.otpCode}
              onChange={handleChange}
            />
            <Button variant="contained" onClick={verifyOtp} sx={{ mt: 2 }}>Verify</Button>
          </>
        )}

        {step === 3 && (
          <>
            <Typography>Select Modules</Typography>
            <Grid container spacing={1}>
              {defaultModules.map((mod) => (
                <Grid item xs={6} key={mod}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.modules.includes(mod)}
                        onChange={() => handleCheckboxChange("modules", mod)}
                      />
                    }
                    label={mod}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {step === 4 && (
          <>
            <Typography>Select Teams</Typography>
            <Grid container spacing={1}>
              {defaultTeams.map((team) => (
                <Grid item xs={6} key={team}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.teams.includes(team)}
                        onChange={() => handleCheckboxChange("teams", team)}
                      />
                    }
                    label={team}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {step === 5 && (
          <>
            <Typography>Upload Company Logo</Typography>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
          </>
        )}

        {step === 6 && (
          <Typography>All done! Redirecting...</Typography>
        )}

        {status && <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>}

        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
          {step > 0 && step < steps.length - 1 && (
            <Button onClick={handleBack}>Back</Button>
          )}
          {step < steps.length - 2 && (
            <Button variant="contained" onClick={handleNext}>Next</Button>
          )}
          {step === steps.length - 2 && (
            <Button variant="contained" onClick={handleSubmit}>Submit</Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TenantSetupWizard;
