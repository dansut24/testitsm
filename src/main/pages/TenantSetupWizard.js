
import React, { useState } from "react";
import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../common/utils/supabaseClient";

const steps = [
  "Company Info",
  "Create Admin Account",
  "Confirm Email",
  "Upload Logo",
  "Complete Setup",
];

const TenantSetupWizard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [subdomain, setSubdomain] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = async () => {
    if (activeStep === 0 && (!companyName || !subdomain)) return;
    if (activeStep === 1 && (!email || !password)) return;
    if (activeStep === 2 && !otpCode) return;

    if (activeStep === 1) {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) alert(error.message);
      setLoading(false);
    }

    if (activeStep === 2) {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email",
      });
      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const {
      data: { user },
      error: signUpError,
    } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      alert(signUpError.message);
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("tenants").insert([
      {
        name: companyName,
        subdomain,
        created_by: user.id,
      },
    ]);

    if (insertError) {
      alert(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate(`https://${subdomain}-itsm.hi5tech.co.uk/dashboard`);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", mt: 5 }}>
      {activeStep > 0 && subdomain && (
        <Box
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: "#f0f0f0",
            borderRadius: 1,
            textAlign: "center",
          }}
        >
          <Typography variant="body2">
            Setting up for:{" "}
            <strong>{`${subdomain}-itsm.hi5tech.co.uk`}</strong>
          </Typography>
        </Box>
      )}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <>
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
            helperText="Will be used for your ITSM URL"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">https://</InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">.hi5tech.co.uk</InputAdornment>
              ),
            }}
            value={subdomain}
            onChange={(e) =>
              setSubdomain(
                e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase()
              )
            }
          />
          {Boolean(subdomain) && (
            <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
              Your ITSM will be available at:{" "}
              <strong>{`${subdomain}-itsm.hi5tech.co.uk`}</strong>
            </Typography>
          )}
        </>
      )}

      {activeStep === 1 && (
        <>
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
        </>
      )}

      {activeStep === 2 && (
        <TextField
          label="Enter 6-digit OTP Code"
          fullWidth
          margin="normal"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
        />
      )}

      {activeStep === 3 && (
        <TextField
          type="file"
          fullWidth
          margin="normal"
          onChange={(e) => setLogo(e.target.files?.[0] || null)}
        />
      )}

      {activeStep === 4 && (
        <Typography variant="h6" sx={{ mt: 2 }}>
          Ready to launch your ITSM platform at{" "}
          <strong>{`${subdomain}-itsm.hi5tech.co.uk`}</strong>
        </Typography>
      )}

      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
        <Button disabled={activeStep === 0 || loading} onClick={handleBack}>
          Back
        </Button>
        <Button variant="contained" onClick={handleNext} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </Box>
  );
};

export default TenantSetupWizard;
