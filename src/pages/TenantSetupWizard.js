// src/pages/TenantSetupWizard.js

import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel, Checkbox,
  FormControlLabel, Grid, Alert, CircularProgress
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const defaultTeams = ["Service Desk", "Desktop Support", "Server Support", "Network Team"];
const defaultModules = ["Incidents", "Service Requests", "Changes", "Problems", "Assets", "Knowledge Base"];
const steps = ["Company Info", "Admin Setup", "Email Verification", "Modules", "Teams", "Logo", "Finish"];

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
  const [userId, setUserId] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCheckboxChange = (field, value) => {
    const current = formData[field];
    setFormData({
      ...formData,
      [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, logoFile: file });
  };

  const handleSignUp = async () => {
    setStatus(null);
    const { adminEmail, adminName, adminPassword } = formData;

    const { data, error } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: { data: { full_name: adminName, role: "admin" } },
    });

    if (error || !data?.user?.id) {
      setStatus({ type: "error", message: error?.message || "Signup failed" });
    } else {
      setUserId(data.user.id);
      setCheckingEmail(true);
    }
  };

  useEffect(() => {
    let interval;

    const pollEmailConfirmed = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user?.email_confirmed_at) {
        setCheckingEmail(false);
        handleNext();
      }
    };

    if (checkingEmail) {
      interval = setInterval(pollEmailConfirmed, 3000);
    }

    return () => clearInterval(interval);
  }, [checkingEmail]);

  const handleSubmit = async () => {
    setStatus(null);
    const {
      companyName, subdomain, adminEmail, modules, teams, logoFile
    } = formData;

    const domain = `${subdomain.toLowerCase()}.hi5tech.co.uk`;

    const { data: tenantInsert, error: tenantError } = await supabase
      .from("tenants")
      .insert([{ name: companyName, domain, subdomain, created_by: userId }])
      .select()
      .single();

    if (tenantError || !tenantInsert?.id) {
      return setStatus({ type: "error", message: tenantError?.message || "Tenant creation failed" });
    }

    const newTenantId = tenantInsert.id;
    setTenantId(newTenantId);

    await supabase.from("profiles").update({ tenant_id: newTenantId }).eq("id", userId);

    const { error: settingsError } = await supabase
      .from("tenant_settings")
      .insert({ tenant_id: newTenantId, logo_url: "" });

    if (settingsError) {
      return setStatus({ type: "error", message: `Settings insert failed: ${settingsError.message}` });
    }

    for (let team of teams) {
      await supabase.from("teams").insert({ tenant_id: newTenantId, name: team });
    }

    if (logoFile) {
      const { error: uploadError } = await supabase.storage
        .from("tenant-logos")
        .upload(`${subdomain}/logo.png`, logoFile, { upsert: true });

      if (uploadError) {
        return setStatus({ type: "error", message: `Logo upload failed: ${uploadError.message}` });
      }

      const publicUrl = supabase.storage.from("tenant-logos").getPublicUrl(`${subdomain}/logo.png`).data.publicUrl;

      await supabase.from("tenant_settings")
        .update({ logo_url: publicUrl })
        .eq("tenant_id", newTenantId);
    }

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
            <TextField label="Company Name" name="companyName" fullWidth margin="normal"
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
            <TextField label="Subdomain" name="subdomain" fullWidth margin="normal"
              value={formData.subdomain} onChange={handleChange}
              InputProps={{ endAdornment: <Typography>.hi5tech.co.uk</Typography> }}
            />
            <Button variant="contained" onClick={handleNext}>Next</Button>
          </>
        )}

        {step === 1 && (
          <>
            <TextField label="Full Name" name="adminName" fullWidth margin="normal"
              value={formData.adminName} onChange={handleChange} />
            <TextField label="Email" name="adminEmail" fullWidth margin="normal"
              value={formData.adminEmail} onChange={handleChange} />
            <TextField label="Password" name="adminPassword" type="password" fullWidth margin="normal"
              value={formData.adminPassword} onChange={handleChange} />
            <Button variant="contained" onClick={handleSignUp}>Send Verification Email</Button>
          </>
        )}

        {step === 2 && (
          <>
            <Typography>Please check your inbox and confirm your email.</Typography>
            {checkingEmail ? (
              <Box mt={2}><CircularProgress size={28} /></Box>
            ) : (
              <Button variant="contained" onClick={handleNext}>Continue</Button>
            )}
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
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" onClick={handleNext}>Next</Button>
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
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" onClick={handleNext}>Next</Button>
          </>
        )}

        {step === 5 && (
          <>
            <Typography>Upload Company Logo</Typography>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" onClick={handleSubmit}>Submit</Button>
          </>
        )}

        {step === 6 && (
          <Typography variant="body1">Setup complete! Redirecting...</Typography>
        )}

        {status && (
          <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>
        )}
      </Box>
    </Box>
  );
};

export default TenantSetupWizard;
