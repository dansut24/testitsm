// src/main/pages/TenantSetupWizard.js
import React, { useState } from "react";
import {
  Box, Button, TextField, Typography, Stepper, Step, StepLabel, CircularProgress, Alert,
} from "@mui/material";
import { supabase } from "../../common/supabaseClient";
import { uploadTenantLogo, checkSubdomainAvailability, createTenantWithSetup } from "../../common/utils/tenantHelpers";

const steps = ["Company Info", "Admin Info", "Verify Email", "Set Password", "Upload Logo", "Finish"];

const TenantSetupWizard = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    logoFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);

  const handleNext = async () => {
    setError("");
    setLoading(true);

    try {
      if (step === 0) {
        // Check subdomain availability
        const available = await checkSubdomainAvailability(formData.subdomain);
        if (!available) throw new Error("Subdomain is already taken.");
      }

      if (step === 1) {
        // Send OTP
        const { error } = await supabase.auth.signInWithOtp({
          email: formData.email,
          options: { emailRedirectTo: window.location.href },
        });
        if (error) throw error;
      }

      if (step === 2) {
        // Verify OTP
        const { data, error } = await supabase.auth.verifyOtp({
          email: formData.email,
          token: formData.otp,
          type: "email",
        });
        if (error) throw error;
        setSession(data.session);
      }

      if (step === 3) {
        // Set password
        if (formData.password !== formData.confirmPassword)
          throw new Error("Passwords do not match.");
        const { error } = await supabase.auth.updateUser(
          { password: formData.password }
        );
        if (error) throw error;
      }

      if (step === 4) {
        // Upload logo if present
        if (formData.logoFile) {
          await uploadTenantLogo(formData.subdomain, formData.logoFile);
        }
      }

      if (step === 5) {
        // Finalise: create tenant and related entries
        await createTenantWithSetup({
          company_name: formData.companyName,
          subdomain: formData.subdomain,
          created_by: session.user.id,
        });
        window.location.href = `https://${formData.subdomain}-itsm.hi5tech.co.uk/dashboard`;
        return;
      }

      setStep((prev) => prev + 1);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Setup Your Hi5Tech Workspace
      </Typography>
      <Stepper activeStep={step} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {step === 0 && (
        <>
          <TextField label="Company Name" name="companyName" fullWidth margin="normal" value={formData.companyName} onChange={handleChange} />
          <TextField label="Subdomain (e.g. acme)" name="subdomain" fullWidth margin="normal" value={formData.subdomain} onChange={handleChange} />
        </>
      )}

      {step === 1 && (
        <TextField label="Admin Email" name="email" fullWidth margin="normal" value={formData.email} onChange={handleChange} />
      )}

      {step === 2 && (
        <TextField label="Enter OTP Code" name="otp" fullWidth margin="normal" value={formData.otp} onChange={handleChange} />
      )}

      {step === 3 && (
        <>
          <TextField label="Password" type="password" name="password" fullWidth margin="normal" value={formData.password} onChange={handleChange} />
          <TextField label="Confirm Password" type="password" name="confirmPassword" fullWidth margin="normal" value={formData.confirmPassword} onChange={handleChange} />
        </>
      )}

      {step === 4 && (
        <Box>
          <Button component="label" variant="outlined">
            Upload Logo
            <input type="file" accept="image/*" name="logoFile" hidden onChange={handleChange} />
          </Button>
          {formData.logoFile && <Typography sx={{ mt: 1 }}>{formData.logoFile.name}</Typography>}
        </Box>
      )}

      {step === 5 && (
        <Typography>Finalising setup... Click Finish to launch your portal.</Typography>
      )}

      <Box sx={{ mt: 4, textAlign: "right" }}>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : step === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </Box>
  );
};

export default TenantSetupWizard;
