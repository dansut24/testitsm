// src/pages/TenantSetupWizard.js

import React, { useEffect, useState } from "react";
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel, Checkbox,
  FormControlLabel, Grid, Alert
} from "@mui/material";
import { supabase } from "../supabaseClient";

const defaultTeams = ["Service Desk", "Desktop Support", "Server Support"];
const defaultModules = ["Incidents", "Service Requests", "Assets", "Knowledge Base"];
const steps = ["Admin Signup", "Company Info", "Modules", "Teams", "Logo", "Finish"];

const TenantSetupWizard = () => {
  const [step, setStep] = useState(0);
  const [userConfirmed, setUserConfirmed] = useState(false);
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    companyName: "",
    subdomain: "",
    modules: [],
    teams: [],
    logoFile: null,
  });

  useEffect(() => {
    const checkConfirmed = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUserConfirmed(true);
    };
    checkConfirmed();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") setUserConfirmed(true);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, logoFile: file });
  };

  const handleSignup = async () => {
    setStatus(null);
    const { adminEmail, adminPassword, adminName } = formData;

    const { error } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: { full_name: adminName, role: "admin" },
      },
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setStatus({
        type: "info",
        message: "Signup successful. Please confirm your email before continuing.",
      });
    }
  };

  const handleSubmit = async () => {
    setStatus(null);
    const session = await supabase.auth.getSession();
    const user = session?.data?.session?.user;
    if (!user) {
      return setStatus({ type: "error", message: "User session not found." });
    }

    const {
      companyName, subdomain, modules, teams, logoFile
    } = formData;

    const domain = `${subdomain.toLowerCase()}.hi5tech.co.uk`;
    const userId = user.id;

    // 1. Insert Tenant
    const { data: tenantInsert, error: tenantError } = await supabase
      .from("tenants")
      .insert([{ name: companyName, domain, subdomain, created_by: userId }])
      .select()
      .single();

    if (tenantError || !tenantInsert?.id) {
      return setStatus({ type: "error", message: tenantError?.message || "Tenant creation failed" });
    }

    const newTenantId = tenantInsert.id;

    // 2. Update Profile
    await supabase.from("profiles").update({ tenant_id: newTenantId }).eq("id", userId);

    // 3. Insert Teams
    for (let team of teams) {
      await supabase.from("teams").insert({ tenant_id: newTenantId, name: team });
    }

    // 4. Insert tenant_settings (with or without logo for now)
    let logoUrl = "";
    if (logoFile) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("tenant-logos")
        .upload(`${subdomain}/logo.png`, logoFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        return setStatus({ type: "error", message: `Logo upload failed: ${uploadError.message}` });
      }

      const { data: publicUrlData } = supabase.storage
        .from("tenant-logos")
        .getPublicUrl(`${subdomain}/logo.png`);
      logoUrl = publicUrlData.publicUrl;
    }

    await supabase.from("tenant_settings").insert({
      tenant_id: newTenantId,
      logo_url: logoUrl,
      modules,
    });

    // Redirect to tenant
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
            <TextField label="Full Name" name="adminName" fullWidth margin="normal" onChange={handleChange} />
            <TextField label="Email" name="adminEmail" fullWidth margin="normal" onChange={handleChange} />
            <TextField label="Password" name="adminPassword" type="password" fullWidth margin="normal" onChange={handleChange} />

            <Button variant="contained" sx={{ mt: 2 }} onClick={handleSignup}>Sign Up</Button>

            {status && <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>}

            {userConfirmed && (
              <Box sx={{ mt: 4 }}>
                <Alert severity="success">Email confirmed! You may now continue setup.</Alert>
                <Button variant="contained" sx={{ mt: 2 }} onClick={handleNext}>Continue</Button>
              </Box>
            )}
          </>
        )}

        {step === 1 && (
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

        {status && <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>}

        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
          {step > 0 && step < steps.length - 1 && (
            <Button onClick={handleBack}>Back</Button>
          )}
          {step < steps.length - 2 && userConfirmed && (
            <Button variant="contained" onClick={handleNext}>Next</Button>
          )}
          {step === steps.length - 2 && userConfirmed && (
            <Button variant="contained" onClick={handleSubmit}>Submit</Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TenantSetupWizard;
