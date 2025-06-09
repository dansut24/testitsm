// src/pages/TenantSetupWizard.js
import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel, Alert, CircularProgress,
} from "@mui/material";
import { supabase } from "../supabaseClient";

const steps = ["Verify Email", "Finish"];

const TenantSetupWizard = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOtp = async () => {
    setStatus(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithOtp({
      email: formData.email,
    });

    setLoading(false);

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setStatus({ type: "success", message: "OTP sent to email." });
    }
  };

  const handleVerifyOtp = async () => {
    setStatus(null);
    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: formData.otp,
      type: "email",
    });

    setLoading(false);

    if (error) {
      setStatus({ type: "error", message: "OTP verification failed: " + error.message });
    } else {
      setStatus({ type: "success", message: "Email verified successfully!" });
      setStep(1);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>Tenant Setup Wizard</Typography>
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {step === 0 && (
        <>
          <TextField
            label="Email"
            name="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleSendOtp}
            disabled={loading || !formData.email}
            sx={{ mt: 1 }}
          >
            {loading ? <CircularProgress size={22} /> : "Send OTP"}
          </Button>

          <TextField
            label="Enter OTP"
            name="otp"
            fullWidth
            margin="normal"
            value={formData.otp}
            onChange={handleChange}
            sx={{ mt: 3 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleVerifyOtp}
            fullWidth
            disabled={loading || !formData.otp}
          >
            {loading ? <CircularProgress size={22} /> : "Verify OTP"}
          </Button>
        </>
      )}

      {step === 1 && (
        <>
          <Typography variant="h6" sx={{ mt: 4 }}>
            ✅ Email verified — continue tenant setup here.
          </Typography>
        </>
      )}

      {status && (
        <Alert severity={status.type} sx={{ mt: 3 }}>
          {status.message}
        </Alert>
      )}
    </Box>
  );
};

export default TenantSetupWizard;
