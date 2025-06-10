// src/pages/TenantSetupWizard.js
import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel, Alert
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const steps = ["Company Info", "Admin Email", "Email Verification", "Finish"];

const TenantSetupWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState(null);
  const [sessionEmail, setSessionEmail] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    let timer;
    if (resendDisabled) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev === 1) {
            setResendDisabled(false);
            clearInterval(timer);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendDisabled]);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const sendOtp = async () => {
    setIsSending(true);
    setStatus(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    setIsSending(false);

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setSessionEmail(email);
      setResendDisabled(true);
      setStatus({ type: "success", message: "Verification code sent to email." });
      handleNext();
    }
  };

  const verifyOtp = async () => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: sessionEmail,
      token: otp,
      type: "email",
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setStatus({ type: "success", message: "Email verified successfully!" });
      handleNext();
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
          <TextField
            label="Company Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
        )}

        {step === 1 && (
          <Box>
            <Typography>We sent a 6-digit code to your email.</Typography>
            <TextField
              label="Enter verification code"
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              margin="normal"
            />
          </Box>
        )}

        {step === 2 && (
          <Typography variant="body1">Setup complete!</Typography>
        )}

        {status && (
          <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>
        )}

        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
          {step > 0 && step < steps.length - 1 && (
            <Button onClick={handleBack}>Back</Button>
          )}
          {step === 0 && (
            <Button
              variant="contained"
              onClick={sendOtp}
              disabled={isSending || resendDisabled}
            >
              {resendDisabled ? `Resend in ${resendTimer}s` : "Send Verification Code"}
            </Button>
          )}
          {step === 1 && (
            <Button variant="contained" onClick={verifyOtp}>Verify Code</Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TenantSetupWizard;
