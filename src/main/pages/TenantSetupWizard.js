// src/main/pages/TenantSetupWizard.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

const steps = ["Company Info", "Admin Setup", "Verification", "Complete"];

const TenantSetupWizard = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [domainSlug, setDomainSlug] = useState("");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const slug = companyName.trim().toLowerCase().replace(/\s+/g, "");
    setDomainSlug(slug);
  }, [companyName]);

  const sendOtp = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setLoading(false);
    if (error) return setError(error.message);

    setOtpSent(true);
  };

  const verifyOtpAndRegister = async () => {
    setLoading(true);
    setError("");

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (verifyError) {
      setLoading(false);
      return setError(verifyError.message);
    }

    const user = data.user;
    if (!user) {
      setLoading(false);
      return setError("Verification failed.");
    }

    // Set password after verifying
    const { error: pwError } = await supabase.auth.updateUser({
      password,
    });

    if (pwError) {
      setLoading(false);
      return setError(pwError.message);
    }

    const { error: tenantError } = await supabase.from("tenants").insert([
      {
        name: companyName,
        subdomain: domainSlug,
        domain: `${domainSlug}-itsm.hi5tech.co.uk`,
        created_by: user.id,
      },
    ]);

    if (tenantError) {
      setLoading(false);
      return setError(tenantError.message);
    }

    setLoading(false);
    setActiveStep((prev) => prev + 1);
    setTimeout(() => {
      window.location.href = `https://${domainSlug}-itsm.hi5tech.co.uk`;
    }, 2000);
  };

  const handleNext = () => {
    if (activeStep === 0 && !companyName) {
      return setError("Please enter your company name.");
    }

    if (activeStep === 1 && (!email || !password || password !== confirmPassword)) {
      return setError("Check your email and password fields.");
    }

    if (activeStep === 2 && otp.length !== 6) {
      return setError("Enter a 6-digit code.");
    }

    setError("");
    setActiveStep((prev) => prev + 1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Your Subdomain"
              value={`${domainSlug}-itsm.hi5tech.co.uk`}
              disabled
              margin="normal"
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              fullWidth
              label="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
            />
            <Button
              onClick={sendOtp}
              disabled={otpSent || loading}
              variant="contained"
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={20} /> : "Send Verification Code"}
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <TextField
              fullWidth
              label="Enter Verification Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              margin="normal"
            />
            <Button
              onClick={verifyOtpAndRegister}
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : "Complete Setup"}
            </Button>
          </>
        );
      case 3:
        return <Typography variant="h6">✅ Setup Complete! Redirecting...</Typography>;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tenant Setup Wizard
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent()}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {activeStep < 2 && (
        <Button onClick={handleNext} sx={{ mt: 3 }}>
          Next
        </Button>
      )}
    </Container>
  );
};

export default TenantSetupWizard;
