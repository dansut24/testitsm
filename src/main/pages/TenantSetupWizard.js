// src/main/pages/TenantSetupWizard.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Container,
  Alert,
} from "@mui/material";
import { supabase } from "../../common/utils/supabaseClient";

const TenantSetupWizard = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
    otp: "",
    logoFile: null,
  });
  const [status, setStatus] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (resendCooldown > 0) setResendCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) =>
    setFormData({ ...formData, logoFile: e.target.files[0] });

  const sendOtp = async () => {
    setStatus(null);
    const { adminEmail } = formData;

    const { error } = await supabase.auth.signInWithOtp({
      email: adminEmail,
      options: {
        data: { role: "admin" },
        shouldCreateUser: true,
      },
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setResendCooldown(60);
      setStatus({ type: "success", message: "OTP sent to email." });
      setStep(2);
    }
  };

  const verifyOtp = async () => {
    setStatus(null);
    const { adminEmail, otp, adminPassword } = formData;

    const { error } = await supabase.auth.verifyOtp({
      email: adminEmail,
      token: otp,
      type: "email",
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setStatus({ type: "success", message: "Email verified!" });

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const { error: pwError } = await supabase.auth.updateUser({
          password: adminPassword,
        });
        if (pwError) {
          console.error("Password update failed:", pwError.message);
          setStatus({
            type: "error",
            message: "Email verified, but password not set.",
          });
          return;
        }
      }

      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setStatus(null);
    const { companyName, subdomain, logoFile } = formData;
    const domain = `${subdomain}-itsm.hi5tech.co.uk`;

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !sessionData.session || !sessionData.session.user) {
      return setStatus({
        type: "error",
        message: "User session not found. Please log in again.",
      });
    }

    const user = sessionData.session.user;

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert([
        {
          name: companyName,
          subdomain,
          domain,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (tenantError) {
      console.error("❌ Tenant insert failed:", tenantError);
      return setStatus({ type: "error", message: tenantError.message });
    }

    await supabase
      .from("profiles")
      .update({ tenant_id: tenant.id })
      .eq("id", user.id);

    let logo_url = "";
    if (logoFile) {
      const { error: uploadError } = await supabase.storage
        .from("tenant-logos")
        .upload(`${subdomain}/logo.png`, logoFile, { upsert: true });

      if (!uploadError) {
        logo_url = `${subdomain}/logo.png`;
      }
    }

    await supabase
      .from("tenant_settings")
      .insert({ tenant_id: tenant.id, logo_url });

    window.location.href = `https://${domain}/dashboard`;
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tenant Setup
      </Typography>

      <Stepper activeStep={step} alternativeLabel>
        {["Company Info", "Admin", "Verify Email", "Logo", "Finish"].map(
          (label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          )
        )}
      </Stepper>

      <Box sx={{ mt: 4 }}>
        {step === 0 && (
          <>
            <TextField
              label="Company Name"
              name="companyName"
              fullWidth
              margin="normal"
              value={formData.companyName}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  companyName: name,
                  subdomain: name.toLowerCase().replace(/\s+/g, ""),
                });
              }}
            />
            <TextField
              label="Subdomain"
              name="subdomain"
              fullWidth
              margin="normal"
              value={formData.subdomain}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <Typography color="text.secondary">
                    .hi5tech.co.uk
                  </Typography>
                ),
              }}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => setStep(1)}
            >
              Next
            </Button>
          </>
        )}

        {step === 1 && (
          <>
            <TextField
              label="Admin Email"
              name="adminEmail"
              fullWidth
              margin="normal"
              value={formData.adminEmail}
              onChange={handleChange}
            />
            <TextField
              label="Password"
              name="adminPassword"
              type="password"
              fullWidth
              margin="normal"
              value={formData.adminPassword}
              onChange={handleChange}
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              fullWidth
              margin="normal"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={sendOtp}
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Send Verification Code"}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <TextField
              label="Enter OTP Code"
              name="otp"
              fullWidth
              margin="normal"
              value={formData.otp}
              onChange={handleChange}
            />
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={verifyOtp}
            >
              Verify Code
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <Typography gutterBottom>Upload Company Logo</Typography>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => setStep(4)}
            >
              Next
            </Button>
          </>
        )}

        {step === 4 && (
          <>
            <Typography gutterBottom>Ready to create your tenant!</Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleSubmit}
            >
              Create Tenant
            </Button>
          </>
        )}

        {status && (
          <Alert severity={status.type} sx={{ mt: 2 }}>
            {status.message}
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default TenantSetupWizard;
