import React, { useState, useEffect } from "react";
import {
  Box, Button, TextField, Typography, Stepper, Step, StepLabel,
  CircularProgress, Alert
} from "@mui/material";
import supabase from "../../common/utils/supabaseClient";
import { uploadTenantLogo } from "../../common/helpers/storageHelpers";

const steps = ["Company Info", "Admin Setup", "Verify OTP", "Logo", "Complete"];

const TenantSetupWizard = () => {
  const [step, setStep] = useState(0);

  // Company & Domain
  const [companyName, setCompanyName] = useState("");
  const [domain, setDomain] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  // Admin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (companyName) {
      const clean = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
      setDomain(clean);
    }
  }, [companyName]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setUser(data.user);
    setOtpSent(true);
    setResendCooldown(60);
    setStep(2);
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "email"
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    setUser(data.user);
    setStep(3);
    setLoading(false);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return null;
    const path = `${domain}-itsm/logo.png`;
    return await uploadTenantLogo(logoFile, path);
  };

  const handleCompleteSetup = async () => {
    setLoading(true);
    setError("");

    const logoUrl = await handleLogoUpload();

    const { data, error: tenantError } = await supabase.from("tenants").insert({
      name: companyName,
      domain,
      subdomain: `${domain}-itsm`,
      logo_url: logoUrl,
      created_by: user?.id,
    });

    if (tenantError) {
      setError(tenantError.message);
      setLoading(false);
      return;
    }

    // Set tenant_settings, teams, etc here if needed

    window.location.href = `https://${domain}-itsm.hi5tech.co.uk`;
  };

  const handleContinue = () => setStep((prev) => prev + 1);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Tenant Setup Wizard
      </Typography>

      <Stepper activeStep={step} sx={{ my: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {step === 0 && (
        <Box>
          <TextField
            label="Company Name"
            fullWidth
            margin="normal"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <TextField
            label="Subdomain"
            fullWidth
            margin="normal"
            value={domain}
            InputProps={{
              endAdornment: <Typography>.itsm.hi5tech.co.uk</Typography>,
              readOnly: true
            }}
          />
          <Button variant="contained" fullWidth onClick={handleContinue} disabled={!companyName}>
            Continue
          </Button>
        </Box>
      )}

      {step === 1 && (
        <Box>
          <TextField
            label="Admin Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleSendOtp}
            disabled={!email || !password || loading}
          >
            {loading ? <CircularProgress size={20} /> : "Send Verification Code"}
          </Button>
        </Box>
      )}

      {step === 2 && (
        <Box>
          <TextField
            label="Enter OTP"
            fullWidth
            margin="normal"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleVerifyOtp}
            disabled={!otpCode || loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : "Verify"}
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={handleSendOtp}
            disabled={resendCooldown > 0}
            sx={{ mt: 1 }}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
          </Button>
        </Box>
      )}

      {step === 3 && (
        <Box>
          <Button variant="outlined" component="label" fullWidth>
            Upload Company Logo
            <input type="file" hidden onChange={(e) => setLogoFile(e.target.files[0])} />
          </Button>
          {logoFile && <Typography sx={{ mt: 1 }}>{logoFile.name}</Typography>}

          <Button variant="contained" fullWidth onClick={handleContinue} sx={{ mt: 2 }}>
            Continue
          </Button>
        </Box>
      )}

      {step === 4 && (
        <Box>
          <Typography sx={{ mb: 2 }}>
            All ready to go! This will complete the setup and redirect you to your ITSM.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={handleCompleteSetup}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Finish and Launch ITSM"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TenantSetupWizard;
