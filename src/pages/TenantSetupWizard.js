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
const steps = ["Company Info", "Admin Verification", "Modules", "Teams", "Logo", "Finish"];

const TenantSetupWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: "",
    adminEmail: "",
    otp: "",
    modules: [],
    teams: [],
    logoFile: null,
  });

  const [status, setStatus] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

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
    setStatus(null);
    setLoading(true);
    const { adminEmail } = formData;

    const { error } = await supabase.auth.signInWithOtp({
      email: adminEmail,
    });

    setLoading(false);
    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setOtpSent(true);
      setStatus({ type: "success", message: "OTP sent to your email." });
    }
  };

  const verifyOtp = async () => {
    setStatus(null);
    setLoading(true);

    const { adminEmail, otp } = formData;

    const { data, error } = await supabase.auth.verifyOtp({
      email: adminEmail,
      token: otp,
      type: "email",
    });

    setLoading(false);
    if (error || !data?.user) {
      setStatus({ type: "error", message: error?.message || "Invalid OTP" });
    } else {
      setOtpVerified(true);
      setUserId(data.user.id);
      setStatus({ type: "success", message: "Email verified successfully!" });
      handleNext();
    }
  };

  const handleSubmit = async () => {
    setStatus(null);
    const { companyName, subdomain, adminEmail, modules, teams, logoFile } = formData;
    const domain = `${subdomain.toLowerCase()}.hi5tech.co.uk`;

    try {
      // 1. Create Tenant
      const { data: tenantInsert, error: tenantError } = await supabase
        .from("tenants")
        .insert([{ name: companyName, domain, subdomain, created_by: userId }])
        .select()
        .single();

      if (tenantError) throw tenantError;
      const tenantId = tenantInsert.id;

      // 2. Update Profile
      await supabase.from("profiles").update({ tenant_id: tenantId }).eq("id", userId);

      // 3. Insert Settings
      await supabase.from("tenant_settings").insert({
        tenant_id: tenantId,
        logo_url: "",
      });

      // 4. Insert Teams
      for (let team of teams) {
        await supabase.from("teams").insert({ tenant_id: tenantId, name: team });
      }

      // 5. Upload Logo
      if (logoFile) {
        const { error: uploadError } = await supabase.storage
          .from("tenant-logos")
          .upload(`${subdomain}/logo.png`, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const publicURL = supabase.storage
          .from("tenant-logos")
          .getPublicUrl(`${subdomain}/logo.png`).data.publicUrl;

        await supabase.from("tenant_settings").update({ logo_url: publicURL }).eq("tenant_id", tenantId);
      }

      // Redirect
      window.location.href = `https://${subdomain}.hi5tech.co.uk/dashboard`;
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
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
              InputProps={{ endAdornment: <Typography>.hi5tech.co.uk</Typography> }}
            />
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleNext}>
              Next
            </Button>
          </>
        )}

        {step === 1 && (
          <>
            {!otpSent ? (
              <>
                <TextField
                  label="Admin Email"
                  name="adminEmail"
                  fullWidth
                  margin="normal"
                  value={formData.adminEmail}
                  onChange={handleChange}
                />
                <Button variant="contained" onClick={sendOtp} disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : "Send OTP"}
                </Button>
              </>
            ) : !otpVerified ? (
              <>
                <TextField
                  label="Enter OTP"
                  name="otp"
                  fullWidth
                  margin="normal"
                  value={formData.otp}
                  onChange={handleChange}
                />
                <Button variant="contained" sx={{ mt: 2 }} onClick={verifyOtp} disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : "Verify OTP"}
                </Button>
                <Button onClick={sendOtp} sx={{ mt: 1 }}>Resend OTP</Button>
              </>
            ) : (
              <Typography>Email Verified ✅</Typography>
            )}
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
            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
              <Button onClick={handleBack}>Back</Button>
              <Button variant="contained" onClick={handleNext}>Next</Button>
            </Box>
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
            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
              <Button onClick={handleBack}>Back</Button>
              <Button variant="contained" onClick={handleNext}>Next</Button>
            </Box>
          </>
        )}

        {step === 4 && (
          <>
            <Typography>Upload Company Logo</Typography>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
              <Button onClick={handleBack}>Back</Button>
              <Button variant="contained" onClick={handleNext}>Next</Button>
            </Box>
          </>
        )}

        {step === 5 && (
          <>
            <Typography variant="body1">All set! Submit to finish setup.</Typography>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
              <Button onClick={handleBack}>Back</Button>
              <Button variant="contained" onClick={handleSubmit}>Submit</Button>
            </Box>
          </>
        )}

        {status && <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>}
      </Box>
    </Box>
  );
};

export default TenantSetupWizard;
