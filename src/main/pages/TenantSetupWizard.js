// main/pages/TenantSetupWizard.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import { supabase } from "../../common/utils/supabaseClient";
import { useNavigate } from "react-router-dom";

const steps = ["Company Info", "Admin Account", "Verify Email", "Finish"];

const TenantSetupWizard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  const handleNext = async () => {
    setError("");
    if (activeStep === 1) {
      // Register with OTP
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email });
      setLoading(false);
      if (error) return setError(error.message);
      setOtpSent(true);
    }
    if (activeStep === 2) {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      setLoading(false);
      if (error) return setError(error.message);
      setUserId(data.user.id);
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleFinish = async () => {
    if (!userId) return setError("User not verified.");
    const domain = `${subdomain}-itsm.hi5tech.co.uk`;
    setLoading(true);
    const { error: insertError } = await supabase.from("tenants").insert([
      {
        name: companyName,
        domain,
        created_by: userId,
      },
    ]);
    setLoading(false);
    if (insertError) return setError(insertError.message);
    navigate(`https://${subdomain}-itsm.hi5tech.co.uk`);
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <TextField
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Subdomain"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              fullWidth
              margin="normal"
              helperText="This will be used for your ITSM URL (e.g. your-subdomain-itsm.hi5tech.co.uk)"
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              label="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              type="email"
            />
            <TextField
              label="Set Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              type="password"
            />
          </>
        );
      case 2:
        return (
          <>
            <Typography variant="body2" mb={1}>
              Enter the 6-digit verification code sent to your email.
            </Typography>
            <TextField
              label="OTP Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              fullWidth
              margin="normal"
              inputProps={{ maxLength: 6 }}
            />
          </>
        );
      case 3:
        return (
          <Typography variant="h6">
            Setup Complete! Redirecting you to your ITSM portal...
          </Typography>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" gutterBottom>
          Tenant Setup
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box mt={4}>{renderStep()}</Box>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <Box mt={4} display="flex" justifyContent="flex-end">
          {activeStep < steps.length - 1 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Next"}
            </Button>
          )}
          {activeStep === steps.length - 1 && (
            <Button
              variant="contained"
              color="success"
              onClick={handleFinish}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Finish"}
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default TenantSetupWizard;
