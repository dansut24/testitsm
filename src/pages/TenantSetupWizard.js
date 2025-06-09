// src/pages/TenantSetupWizard.js
import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel,
  Alert, CircularProgress
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const steps = ["Company Info", "Admin Setup", "Verification", "Finish"];

const TenantSetupWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = async () => {
    if (step === 1) {
      // Handle signup
      setStatus(null);
      setLoading(true);
      const { adminEmail, adminPassword, adminName } = formData;

      const { data, error } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: { full_name: adminName, role: "admin" },
          emailRedirectTo: `${window.location.origin}/tenant-setup`,
        },
      });

      setLoading(false);

      if (error) {
        setStatus({ type: "error", message: error.message });
        return;
      }

      setStep(2);
      setPolling(true);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setStep((prev) => prev - 1);

  // Poll for email confirmation
  useEffect(() => {
    let interval;
    if (polling) {
      interval = setInterval(async () => {
        const { data: refreshedSession } = await supabase.auth.refreshSession();
        const { data: userInfo } = await supabase.auth.getUser();

        if (userInfo?.user?.email_confirmed_at) {
          clearInterval(interval);
          setEmailConfirmed(true);
          setPolling(false);
          setStep((prev) => prev + 1);
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [polling]);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>Tenant Setup</Typography>
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {step === 0 && (
        <>
          <TextField
            fullWidth margin="normal"
            label="Company Name" name="companyName"
            value={formData.companyName}
            onChange={(e) => {
              const name = e.target.value;
              setFormData({
                ...formData,
                companyName: name,
                subdomain: name.toLowerCase().replace(/\s+/g, "")
              });
            }}
          />
          <TextField
            fullWidth margin="normal"
            label="Subdomain" name="subdomain"
            value={formData.subdomain}
            onChange={handleChange}
            InputProps={{
              endAdornment: <Typography>.hi5tech.co.uk</Typography>
            }}
          />
        </>
      )}

      {step === 1 && (
        <>
          <TextField
            fullWidth margin="normal"
            label="Full Name" name="adminName"
            value={formData.adminName}
            onChange={handleChange}
          />
          <TextField
            fullWidth margin="normal"
            label="Email" name="adminEmail"
            value={formData.adminEmail}
            onChange={handleChange}
          />
          <TextField
            fullWidth margin="normal" type="password"
            label="Password" name="adminPassword"
            value={formData.adminPassword}
            onChange={handleChange}
          />
        </>
      )}

      {step === 2 && (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body1">
            We've sent a confirmation email to <strong>{formData.adminEmail}</strong>.
            Please check your inbox and click the link to verify your email.
          </Typography>
          {polling && <CircularProgress sx={{ mt: 3 }} />}
        </Box>
      )}

      {step === 3 && (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            Email verified! You may now proceed to complete your setup.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate("/start-trial")}
          >
            Continue
          </Button>
        </>
      )}

      {status && (
        <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>
      )}

      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
        {step > 0 && step < steps.length - 1 && (
          <Button onClick={handleBack}>Back</Button>
        )}
        {step < steps.length - 2 && (
          <Button variant="contained" onClick={handleNext} disabled={loading}>
            {loading ? "Submitting..." : "Next"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TenantSetupWizard;
