// src/pages/TenantSetupWizard.js

import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel, Checkbox,
  FormControlLabel, Grid, Alert
} from "@mui/material";
import { supabase } from "../supabaseClient";

const defaultTeams = [
  "Service Desk",
  "Desktop Support",
  "Server Support",
  "Network Team",
];

const defaultModules = [
  "Incidents", "Service Requests", "Changes", "Problems", "Assets", "Knowledge Base",
];

const TenantSetupWizard = () => {
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

  const handleSubmit = async () => {
    setStatus(null);

    const { companyName, subdomain, adminEmail, adminName, adminPassword, modules, teams } = formData;
    const domain = `${subdomain.toLowerCase()}.hi5tech.co.uk`;

    // 1. Create Supabase Auth User
    const { data: userData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          full_name: adminName,
          role: "admin",
        },
      },
    });

    if (signUpError) {
      setStatus({ type: "error", message: signUpError.message });
      return;
    }

    const userId = userData?.user?.id;

    // 2. Create Tenant & Link Profile
    const { error: insertError } = await supabase.from("tenants").insert([
      {
        name: companyName,
        domain,
        created_by: userId,
      },
    ]);

    if (insertError) {
      setStatus({ type: "error", message: insertError.message });
      return;
    }

    // 3. Insert Tenant Settings, Teams, Modules
    await Promise.all([
      supabase.from("tenant_settings").insert({
        tenant_id: userId,
        modules,
        logo_url: "",
      }),
      ...teams.map((teamName) =>
        supabase.from("teams").insert({
          tenant_id: userId,
          name: teamName,
        })
      ),
    ]);

    setStatus({ type: "success", message: "Tenant setup complete!" });
    handleNext();
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Tenant Setup
      </Typography>
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
              value={formData.companyName}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  companyName: value,
                  subdomain: value.toLowerCase().replace(/\s+/g, ""),
                });
              }}
              margin="normal"
            />
            <TextField
              label="Subdomain"
              name="subdomain"
              fullWidth
              value={formData.subdomain}
              InputProps={{ endAdornment: <Typography>.hi5tech.co.uk</Typography> }}
              onChange={handleChange}
              margin="normal"
            />
          </>
        )}

        {step === 1 && (
          <>
            <TextField
              label="Full Name"
              name="adminName"
              fullWidth
              value={formData.adminName}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              label="Email"
              name="adminEmail"
              fullWidth
              value={formData.adminEmail}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              label="Password"
              name="adminPassword"
              fullWidth
              type="password"
              value={formData.adminPassword}
              onChange={handleChange}
              margin="normal"
            />
          </>
        )}

        {step === 2 && (
          <>
            <Typography>Select the modules to enable:</Typography>
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
            <Typography>Select default teams:</Typography>
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
            <Typography variant="h6" gutterBottom>All done!</Typography>
            <Typography variant="body1">
              Your tenant setup is complete. You can now log in and start managing your IT environment.
            </Typography>
          </>
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
