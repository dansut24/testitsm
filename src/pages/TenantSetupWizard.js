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

const steps = [
  "Company Info", "Admin Contact", "Verify Phone", "Modules", "Teams", "Logo", "Finish"
];

const TenantSetupWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: "",
    fullName: "",
    phone: "",
    otp: "",
    modules: [],
    teams: [],
    logoFile: null,
  });
  const [status, setStatus] = useState(null);
  const [verified, setVerified] = useState(false);

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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, logoFile: file });
  };

  const handleSendOTP = async () => {
    setStatus(null);
    const { phone } = formData;
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setStatus({ type: "success", message: "OTP sent. Please enter the code." });
    }
  };

  const handleVerifyOTP = async () => {
    setStatus(null);
    const { phone, otp } = formData;
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (error || !data?.user) {
      setStatus({ type: "error", message: error?.message || "Verification failed." });
    } else {
      setVerified(true);
      setStatus({ type: "success", message: "Phone number verified." });
      handleNext();
    }
  };

  const handleSubmit = async () => {
    setStatus(null);
    const {
      companyName, subdomain, fullName, phone,
      modules, teams, logoFile
    } = formData;

    const domain = `${subdomain.toLowerCase()}.hi5tech.co.uk`;

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return setStatus({ type: "error", message: "No verified user session." });
    }

    const userId = user.id;

    // 1. Insert Tenant
    const { data: tenantData, error: tenantError } = await supabase
      .from("tenants")
      .insert([{ name: companyName, domain, subdomain, created_by: userId }])
      .select()
      .single();

    if (tenantError || !tenantData?.id) {
      return setStatus({ type: "error", message: tenantError?.message || "Tenant creation failed" });
    }

    const tenantId = tenantData.id;

    // 2. Update Profile
    await supabase.from("profiles").update({
      full_name: fullName,
      tenant_id: tenantId,
      role: "admin"
    }).eq("id", userId);

    // 3. Insert Tenant Settings
    await supabase.from("tenant_settings").insert({
      tenant_id: tenantId,
      logo_url: ""
    });

    // 4. Insert Teams
    for (let team of teams) {
      await supabase.from("teams").insert({ tenant_id: tenantId, name: team });
    }

    // 5. Upload Logo
    if (logoFile) {
      const upload = await supabase.storage
        .from("tenant-logos")
        .upload(`${subdomain}/logo.png`, logoFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (!upload.error) {
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
            <Button sx={{ mt: 2 }} variant="contained" onClick={handleNext}>Next</Button>
          </>
        )}

        {step === 1 && (
          <>
            <TextField
              label="Full Name"
              name="fullName"
              fullWidth
              margin="normal"
              value={formData.fullName}
              onChange={handleChange}
            />
            <TextField
              label="Phone Number"
              name="phone"
              fullWidth
              margin="normal"
              value={formData.phone}
              onChange={handleChange}
            />
            <Button sx={{ mt: 2 }} variant="contained" onClick={handleSendOTP}>Send OTP</Button>
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
            <Button sx={{ mt: 2 }} variant="contained" onClick={handleVerifyOTP}>
              Verify Code
            </Button>
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
            <Button sx={{ mt: 2 }} variant="contained" onClick={handleNext}>Next</Button>
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
            <Button sx={{ mt: 2 }} variant="contained" onClick={handleNext}>Next</Button>
          </>
        )}

        {step === 5 && (
          <>
            <Typography>Upload Company Logo</Typography>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
            <Button sx={{ mt: 2 }} variant="contained" onClick={handleNext}>Next</Button>
          </>
        )}

        {step === 6 && (
          <>
            <Typography variant="body1">Click Submit to finalise setup.</Typography>
            <Button sx={{ mt: 2 }} variant="contained" onClick={handleSubmit}>Submit</Button>
          </>
        )}

        {status && (
          <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>
        )}

        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
          {step > 0 && <Button onClick={handleBack}>Back</Button>}
        </Box>
      </Box>
    </Box>
  );
};

export default TenantSetupWizard;
