import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel,
  Alert, CircularProgress
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const steps = ["Company Info", "Admin Setup", "Verify Email", "Complete"];

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
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [polling, setPolling] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = async () => {
    setStatus(null);

    if (step === 1) {
      // Signup
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
        return setStatus({ type: "error", message: error.message });
      }

      setStep(2);
      setPolling(true);
    } else {
      setStep(step + 1);
    }
  };

  // Email confirmation polling
  useEffect(() => {
    let interval;

    const checkConfirmation = async () => {
      await supabase.auth.refreshSession(); // ✅ ensure refresh token
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user?.email_confirmed_at) {
        clearInterval(interval);
        setEmailConfirmed(true);
        setPolling(false);
        setStep(3);
      }
    };

    if (polling) {
      interval = setInterval(checkConfirmation, 3000);
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
            label="Company Name" fullWidth margin="normal"
            name="companyName" value={formData.companyName}
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
            label="Subdomain" fullWidth margin="normal"
            name="subdomain" value={formData.subdomain}
            onChange={handleChange}
            InputProps={{ endAdornment: <Typography>.hi5tech.co.uk</Typography> }}
          />
        </>
      )}

      {step === 1 && (
        <>
          <TextField label="Admin Name" fullWidth name="adminName" margin="normal" value={formData.adminName} onChange={handleChange} />
          <TextField label="Admin Email" fullWidth name="adminEmail" margin="normal" value={formData.adminEmail} onChange={handleChange} />
          <TextField label="Password" type="password" fullWidth name="adminPassword" margin="normal" value={formData.adminPassword} onChange={handleChange} />
        </>
      )}

      {step === 2 && (
        <Box sx={{ textAlign: "center" }}>
          <Typography>We’ve sent a confirmation link to:</Typography>
          <Typography variant="h6">{formData.adminEmail}</Typography>
          <Typography>Please check your inbox and click the link to verify.</Typography>

          {polling && <CircularProgress sx={{ mt: 2 }} />}

          <Box sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={() => setPolling(true)}>Retry Check</Button>
          </Box>
        </Box>
      )}

      {step === 3 && (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ Email verified. You can now continue to setup your company.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate("/start-trial")}
          >
            Continue Setup
          </Button>
        </>
      )}

      {status && <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>}

      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
        {step > 0 && step < steps.length - 1 && (
          <Button onClick={() => setStep(step - 1)}>Back</Button>
        )}
        {step < 2 && (
          <Button onClick={handleNext} variant="contained" disabled={loading}>
            {loading ? "Submitting..." : "Next"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TenantSetupWizard;
