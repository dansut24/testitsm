// src/pages/TenantSetupWizard.js

import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel,
  Checkbox, FormControlLabel, Grid, Alert
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const steps = ["Company Info", "Admin Info", "Email Verification", "Modules", "Teams", "Logo", "Finish"];

const defaultTeams = ["Service Desk", "Desktop Support", "Server Support", "Network Team"];
const defaultModules = ["Incidents", "Service Requests", "Changes", "Problems", "Assets", "Knowledge Base"];

const TenantSetupWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: "",
    adminEmail: "",
    adminName: "",
    otp: "",
    modules: [],
    teams: [],
    logoFile: null,
  });
  const [status, setStatus] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verified, setVerified] = useState(false];
  const [session, setSession] = useState(null);

  const handleNext = async () => {
    setStatus(null);

    if (step === 2 && !verified) {
      setStatus({ type: "error", message: "Please verify your email before continuing." });
      return;
    }

    setStep((prev) => prev + 1);
  };

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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, logoFile: file });
  };

  const sendOtp = async () => {
    const { adminEmail } = formData;

    const { data, error } = await supabase.auth.signInWithOtp({
      email: adminEmail,
      options: { shouldCreateUser: true },
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setVerificationSent(true);
      setStatus({ type: "success", message: "OTP sent to your email." });
    }
  };

  const verifyOtp = async () => {
    const { adminEmail, otp } = formData;

    const { data, error } = await supabase.auth.verifyOtp({
      email: adminEmail,
      token: otp,
      type: "email",
    });

    if (error || !data.session) {
      setStatus({ type: "error", message: "OTP verification failed. Please check and try again." });
    } else {
      setSession(data.session);
      setVerified(true);
      setStatus({ type: "success", message: "Email verified successfully." });
    }
  };

  const handleSubmit = async () => {
    setStatus(null);
    const { companyName, subdomain, adminName, modules, teams, logoFile } = formData;

    const domain = `${subdomain.toLowerCase()}.hi5tech.co.uk`;
    const userId = session.user.id;

    const { data: tenantData, error: tenantError } = await supabase
      .from("tenants")
      .insert({ name: companyName, subdomain, domain, created_by: userId })
      .select()
      .single();

    if (tenantError) return setStatus({ type: "error", message: tenantError.message });

    const tenantId = tenantData.id;

    await supabase.from("profiles").update({ tenant_id: tenantId, full_name: adminName }).eq("id", userId);

    await supabase.from("tenant_settings").insert({
      tenant_id: tenantId,
      logo_url: "",
      modules,
    });

    for (let team of teams) {
      await supabase.from("teams").insert({ tenant_id: tenantId, name: team });
    }

    if (logoFile) {
      const { error: uploadError } = await supabase.storage
        .from("tenant-logos")
        .upload(`${subdomain}/logo.png`, logoFile, { upsert: true });

      if (!uploadError) {
        const publicUrl = supabase.storage
          .from("tenant-logos")
          .getPublicUrl(`${subdomain}/logo.png`).data.publicUrl;

        await supabase.from("tenant_settings")
          .update({ logo_url: publicUrl })
          .eq("tenant_id", tenantId);
      }
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
                setFormData({ ...formData, companyName: name, subdomain: name.toLowerCase().replace(/\s+/g, "") });
              }} />
            <TextField label="Subdomain" name="subdomain" fullWidth margin="normal"
              value={formData.subdomain} onChange={handleChange}
              InputProps={{ endAdornment: <Typography>.hi5tech.co.uk</Typography> }} />
          </>
        )}

        {step === 1 && (
          <>
            <TextField label="Full Name" name="adminName" fullWidth margin="normal"
              value={formData.adminName} onChange={handleChange} />
            <TextField label="Email" name="adminEmail" fullWidth margin="normal"
              value={formData.adminEmail} onChange={handleChange} />
            <Button variant="outlined" onClick={sendOtp} disabled={verificationSent}>
              {verificationSent ? "OTP Sent" : "Send OTP"}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <TextField label="Enter OTP" name="otp" fullWidth margin="normal"
              value={formData.otp} onChange={handleChange} />
            <Button variant="contained" onClick={verifyOtp}>Verify</Button>
            <Button sx={{ ml: 2 }} onClick={sendOtp}>Resend OTP</Button>
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
          <Typography variant="body1">Setup complete! Redirecting...</Typography>
        )}

        {status && (
          <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>
        )}

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
