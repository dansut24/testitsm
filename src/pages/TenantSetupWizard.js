// src/pages/TenantSetupWizard.js

import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel,
  Checkbox, FormControlLabel, Grid, Alert
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const defaultTeams = [
  "Service Desk", "Desktop Support", "Server Support", "Network Team"
];

const defaultModules = [
  "Incidents", "Service Requests", "Changes", "Problems", "Assets", "Knowledge Base"
];

const steps = ["Company Info", "Admin Setup", "Modules", "Teams", "Logo", "Finish"];

const TenantSetupWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    modules: [],
    teams: [],
    logoFile: null,
  });
  const [status, setStatus] = useState(null);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, logoFile: file });
  };

  const handleSubmit = async () => {
    setStatus(null);
    const {
      companyName, subdomain, adminEmail, adminName,
      adminPassword, modules, teams, logoFile
    } = formData;

    const domain = `${subdomain.toLowerCase()}.hi5tech.co.uk`;

    // 1. Sign Up User
    const { data: userData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: { full_name: adminName, role: "admin" },
      },
    });

    if (signUpError || !userData?.user) {
      return setStatus({ type: "error", message: signUpError?.message || "User creation failed" });
    }

    const userId = userData.user.id;

    // 2. Create Tenant
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert([{ name: companyName, domain, subdomain, created_by: userId }])
      .select()
      .single();

    if (tenantError || !tenant?.id) {
      return setStatus({ type: "error", message: tenantError?.message || "Tenant creation failed" });
    }

    const tenantId = tenant.id;

    // 3. Update Profile with tenant ID
    await supabase.from("profiles").update({ tenant_id: tenantId }).eq("id", userId);

    // 4. Create tenant_settings row (logo URL to be updated next)
    const { error: settingsError } = await supabase
      .from("tenant_settings")
      .insert({ tenant_id: tenantId, modules, logo_url: "" });

    if (settingsError) {
      return setStatus({ type: "error", message: `Settings insert failed: ${settingsError.message}` });
    }

    // 5. Create teams
    for (let team of teams) {
      await supabase.from("teams").insert({ tenant_id: tenantId, name: team });
    }

    // 6. Upload logo if provided
    if (logoFile) {
      const path = `${subdomain}/logo.png`;
      const { error: uploadError } = await supabase.storage
        .from("tenant-logos")
        .upload(path, logoFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        return setStatus({ type: "error", message: `Logo upload failed: ${uploadError.message}` });
      }

      const { data: publicUrlData } = supabase.storage
        .from("tenant-logos")
        .getPublicUrl(path);

      await supabase
        .from("tenant_settings")
        .update({ logo_url: publicUrlData.publicUrl })
        .eq("tenant_id", tenantId);
    }

    // 7. Redirect
    window.location.href = `https://${subdomain}.hi5tech.co.uk/dashboard`;
  };

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
              InputProps={{
                endAdornment: <Typography>.hi5tech.co.uk</Typography>,
              }}
            />
          </>
        )}

        {step === 1 && (
          <>
            <TextField label="Full Name" name="adminName" fullWidth margin="normal" value={formData.adminName} onChange={handleChange} />
            <TextField label="Email" name="adminEmail" fullWidth margin="normal" value={formData.adminEmail} onChange={handleChange} />
            <TextField label="Password" name="adminPassword" type="password" fullWidth margin="normal" value={formData.adminPassword} onChange={handleChange} />
          </>
        )}

        {step === 2 && (
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

        {step === 3 && (
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

        {step === 4 && (
          <>
            <Typography>Upload Company Logo</Typography>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
          </>
        )}

        {step === 5 && (
          <Typography variant="body1">Setup complete! Redirecting...</Typography>
        )}

        {status && (
          <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>
        )}

        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
          {step > 0 && step < steps.length - 1 && <Button onClick={handleBack}>Back</Button>}
          {step < steps.length - 2 && <Button variant="contained" onClick={handleNext}>Next</Button>}
          {step === steps.length - 2 && <Button variant="contained" onClick={handleSubmit}>Submit</Button>}
        </Box>
      </Box>
    </Box>
  );
};

export default TenantSetupWizard;
