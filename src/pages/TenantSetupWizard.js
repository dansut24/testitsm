// src/pages/TenantSetupWizard.js

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  Grid,
  Alert,
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const defaultTeams = [
  "Service Desk",
  "Desktop Support",
  "Server Support",
  "Network Team",
];

const defaultModules = [
  "Incidents",
  "Service Requests",
  "Changes",
  "Problems",
  "Assets",
  "Knowledge Base",
];

const steps = [
  "Company Info",
  "Admin Setup",
  "Verify Email",
  "Modules",
  "Teams",
  "Logo",
  "Finish",
];

const TenantSetupWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: "",
    adminName: "",
    adminEmail: "",
    otp: "",
    modules: [],
    teams: [],
    logoFile: null,
  });
  const [status, setStatus] = useState(null);
  const [verified, setVerified] = useState(false);
  const [userId, setUserId] = useState(null);
  const [tenantId, setTenantId] = useState(null);

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

  const sendOTP = async () => {
    setStatus(null);
    const { adminEmail } = formData;

    const { error } = await supabase.auth.signInWithOtp({
      email: adminEmail,
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setStatus({
        type: "success",
        message: "OTP sent to your email. Check your inbox.",
      });
    }
  };

  const verifyOTP = async () => {
    const { adminEmail, otp } = formData;

    const { data, error } = await supabase.auth.verifyOtp({
      email: adminEmail,
      token: otp,
      type: "email",
    });

    if (error || !data?.session) {
      setStatus({
        type: "error",
        message: "OTP verification failed. Please try again.",
      });
    } else {
      setVerified(true);
      setUserId(data.user.id);
      setStatus({ type: "success", message: "Email verified successfully." });
      handleNext();
    }
  };

  const handleSubmit = async () => {
    setStatus(null);
    const {
      companyName,
      subdomain,
      adminName,
      modules,
      teams,
      logoFile,
    } = formData;

    const domain = `${subdomain.toLowerCase()}.hi5tech.co.uk`;

    const newUserId = userId;

    const { data: tenantInsert, error: tenantError } = await supabase
      .from("tenants")
      .insert([{ name: companyName, domain, subdomain, created_by: newUserId }])
      .select()
      .single();

    if (tenantError || !tenantInsert?.id) {
      return setStatus({
        type: "error",
        message: tenantError?.message || "Tenant creation failed",
      });
    }

    const newTenantId = tenantInsert.id;
    setTenantId(newTenantId);

    await supabase
      .from("profiles")
      .update({ tenant_id: newTenantId, full_name: adminName, role: "admin" })
      .eq("id", newUserId);

    const { error: settingsError } = await supabase
      .from("tenant_settings")
      .insert({
        tenant_id: newTenantId,
        logo_url: "",
      });

    if (settingsError) {
      return setStatus({
        type: "error",
        message: `Settings insert failed: ${settingsError.message}`,
      });
    }

    for (let team of teams) {
      await supabase.from("teams").insert({ tenant_id: newTenantId, name: team });
    }

    if (logoFile) {
      const { error: uploadError } = await supabase.storage
        .from("tenant-logos")
        .upload(`${subdomain}/logo.png`, logoFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        return setStatus({
          type: "error",
          message: `Logo upload failed: ${uploadError.message}`,
        });
      }

      const publicURL = supabase.storage
        .from("tenant-logos")
        .getPublicUrl(`${subdomain}/logo.png`).data.publicUrl;

      await supabase
        .from("tenant_settings")
        .update({ logo_url: publicURL })
        .eq("tenant_id", newTenantId);
    }

    window.location.href = `https://${subdomain}.hi5tech.co.uk/dashboard`;
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Tenant Setup
      </Typography>
      <Stepper activeStep={step} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
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
            <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
              Next
            </Button>
          </>
        )}

        {step === 1 && (
          <>
            <TextField
              label="Admin Full Name"
              name="adminName"
              fullWidth
              margin="normal"
              value={formData.adminName}
              onChange={handleChange}
            />
            <TextField
              label="Admin Email"
              name="adminEmail"
              fullWidth
              margin="normal"
              value={formData.adminEmail}
              onChange={handleChange}
            />
            <Button variant="contained" onClick={sendOTP} sx={{ mt: 2 }}>
              Send OTP
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <TextField
              label="Enter OTP"
              name="otp"
              fullWidth
              margin="normal"
              value={formData.otp}
              onChange={handleChange}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="outlined" onClick={sendOTP}>
                Resend OTP
              </Button>
              <Button variant="contained" onClick={verifyOTP}>
                Verify
              </Button>
            </Box>
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
            <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
              Next
            </Button>
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
            <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
              Next
            </Button>
          </>
        )}

        {step === 5 && (
          <>
            <Typography>Upload Company Logo</Typography>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
            <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
              Next
            </Button>
          </>
        )}

        {step === 6 && (
          <>
            <Typography>Submitting setup…</Typography>
            <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
              Submit
            </Button>
          </>
        )}

        {status && (
          <Alert severity={status.type} sx={{ mt: 2 }}>
            {status.message}
          </Alert>
        )}

        {step > 0 && step < steps.length - 1 && (
          <Button onClick={handleBack} sx={{ mt: 2 }}>
            Back
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TenantSetupWizard;
