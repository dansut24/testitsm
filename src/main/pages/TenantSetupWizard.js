// src/main/pages/TenantSetupWizard.js
import React, { useState } from "react";
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

const steps = [
  "Company Info",
  "Admin Email Verification",
  "Create Password",
  "Domain Setup",
  "Finish",
];

const TenantSetupWizard = () => {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  const handleNext = async () => {
    setError("");

    try {
      if (activeStep === 0) {
        if (!companyName) throw new Error("Company name is required");
        setActiveStep((prev) => prev + 1);
      } else if (activeStep === 1) {
        if (!adminEmail) throw new Error("Email is required");
        setLoading(true);

        // Check if user already exists
        const { data: existingUser, error: userFetchError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", adminEmail)
          .single();

        if (existingUser) {
          throw new Error("User with this email is already registered.");
        }

        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: adminEmail,
        });

        if (otpError) throw otpError;
        setOtpSent(true);
        setActiveStep((prev) => prev + 1);
      } else if (activeStep === 2) {
        if (password.length < 6) throw new Error("Password too short");
        if (password !== confirmPassword)
          throw new Error("Passwords do not match");

        const {
          data: verifyData,
          error: verifyError,
        } = await supabase.auth.verifyOtp({
          email: adminEmail,
          token: otpCode,
          type: "email",
        });

        if (verifyError) throw verifyError;

        // Set password now
        const { data: pwData, error: pwError } = await supabase.auth.updateUser({
          password,
        });

        if (pwError) throw pwError;
        setUserId(verifyData.user.id);
        setActiveStep((prev) => prev + 1);
      } else if (activeStep === 3) {
        if (!subdomain.match(/^[a-z0-9]+(-[a-z0-9]+)*$/))
          throw new Error("Invalid subdomain format");

        const { error: tenantError } = await supabase.from("tenants").insert({
          name: companyName,
          slug: subdomain,
          created_by: userId,
        });

        if (tenantError) throw tenantError;

        const { error: settingsError } = await supabase
          .from("tenant_settings")
          .insert({
            slug: subdomain,
          });

        if (settingsError) throw settingsError;

        setActiveStep((prev) => prev + 1);
      } else if (activeStep === 4) {
        window.location.href = `https://${subdomain}-itsm.hi5tech.co.uk`;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError("");
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Tenant Setup Wizard
      </Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {activeStep === 0 && (
        <TextField
          fullWidth
          label="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          sx={{ mb: 2 }}
        />
      )}

      {activeStep === 1 && (
        <TextField
          fullWidth
          label="Admin Email"
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
      )}

      {activeStep === 2 && (
        <>
          <TextField
            fullWidth
            label="OTP Code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
        </>
      )}

      {activeStep === 3 && (
        <TextField
          fullWidth
          label="Subdomain (e.g. mycompany)"
          value={subdomain}
          onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
          sx={{ mb: 2 }}
        />
      )}

      {activeStep === 4 && (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="h6" gutterBottom>
            🎉 All done!
          </Typography>
          <Typography>
            Redirecting to{" "}
            <strong>{subdomain}-itsm.hi5tech.co.uk</strong>...
          </Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button disabled={activeStep === 0 || loading} onClick={handleBack}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Next"}
        </Button>
      </Box>
    </Container>
  );
};

export default TenantSetupWizard;
