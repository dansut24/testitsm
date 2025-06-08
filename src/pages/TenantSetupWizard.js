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
  });
  const [status, setStatus] = useState(null);

  const steps = ["Company Info", "Admin Setup", "Modules", "Teams", "Finish"];

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

  const handleSubmit = async () => {
    setStatus(null);
    const {
      companyName, subdomain, adminEmail, adminName,
      adminPassword, modules, teams
    } = formData;

    if (!subdomain) {
      return setStatus({ type: "error", message: "Subdomain is required." });
    }

    const domain = `${subdomain.toLowerCase()}.hi5tech.co.uk`;

    // 1. Create Supabase Auth User
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
    const { data: tenantInsert, error: tenantError } = await supabase
      .from("tenants")
      .insert([{ name: companyName, domain, subdomain, created_by: userId }])
      .select()
      .single();

    if (tenantError || !tenantInsert?.id) {
      return setStatus({ type: "error", message: tenantError?.message || "Tenant creation failed" });
    }

    const tenantId = tenantInsert.id;

    // 3. Update Profile with tenant_id
    await supabase
      .from("profiles")
      .update({ tenant_id: tenantId })
      .eq("id", userId);

    // 4. Add Teams and Modules
    await Promise.all([
      supabase.from("tenant_settings").insert({
        tenant_id: tenantId,
        modules,
        logo_url: "",
      }),
      ...teams.map((team) =>
        supabase.from("teams").insert({ tenant_id: tenantId, name: team })
      ),
    ]);

    // Redirect to tenant dashboard
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
            <TextField
              label="Full Name"
              name="adminName"
              fullWidth
              margin="normal"
              value={formData.adminName}
              onChange={handleChange}
            />
            <TextField
              label="Email"
              name="adminEmail"
              fullWidth
              margin="normal"
              value={formData.adminEmail}
              onChange={handleChange}
            />
            <TextField
              label="Password"
              name="adminPassword"
              type="password"
              fullWidth
              margin="normal"
              value={formData.adminPassword}
              onChange={handleChange}
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
          <Typography variant="body1">Setup complete! Redirecting...</Typography>
        )}

        {status && (
          <Alert severity={status.type} sx={{ mt: 2 }}>
            {status.message}
          </Alert>
        )}

        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
          {step > 0 && step < 4 && <Button onClick={handleBack}>Back</Button>}
          {step < 3 && <Button variant="contained" onClick={handleNext}>Next</Button>}
          {step === 3 && <Button variant="contained" onClick={handleSubmit}>Submit</Button>}
        </Box>
      </Box>
    </Box>
  );
};

export default TenantSetupWizard;
