import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Avatar,
} from "@mui/material";
import supabase from "../../common/utils/supabase";
import { uploadTenantLogo } from "../../common/utils/storageHelpers";

const DOMAIN_SUFFIX = "-itsm.hi5tech.co.uk";

const TenantSetupWizard = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [form, setForm] = useState({
    company_name: "",
    subdomain: "",
    email: "",
    password: "",
    otp: "",
    logoFile: null,
  });

  const [session, setSession] = useState(null);

  useEffect(() => {
    if (resendCountdown > 0) {
      const interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendCountdown]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "company_name") {
      const domain = value.replace(/\s+/g, "").toLowerCase();
      setForm((prev) => ({
        ...prev,
        [name]: value,
        subdomain: domain,
      }));
    } else if (name === "logoFile") {
      setForm((prev) => ({
        ...prev,
        logoFile: files[0],
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: form.email,
    });
    setLoading(false);
    if (error) return alert("Failed to send OTP: " + error.message);
    setOtpSent(true);
    setResendCountdown(60);
  };

  const verifyOtp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email: form.email,
      token: form.otp,
      type: "email",
    });
    if (error) {
      setLoading(false);
      return alert("Invalid OTP: " + error.message);
    }
    setSession(data.session);
    setStep(3);
    setLoading(false);
  };

  const completeSetup = async () => {
    if (!session) return alert("No session found.");

    setLoading(true);

    const userId = session.user.id;
    const subdomain = form.subdomain;
    const fullDomain = `${subdomain}${DOMAIN_SUFFIX}`;

    const { error: tenantError } = await supabase.from("tenants").insert([
      {
        name: form.company_name,
        subdomain,
        domain: fullDomain,
        created_by: userId,
      },
    ]);

    if (tenantError) {
      setLoading(false);
      return alert("Tenant creation error: " + tenantError.message);
    }

    const { error: profileError } = await supabase.from("profiles").update({
      full_name: form.company_name,
      role: "admin",
      password: form.password, // only stored *after* OTP
    }).eq("id", userId);

    if (profileError) {
      setLoading(false);
      return alert("Profile update error: " + profileError.message);
    }

    // Upload logo
    if (form.logoFile) {
      const { error: uploadError } = await uploadTenantLogo(subdomain, form.logoFile);
      if (uploadError) {
        setLoading(false);
        return alert("Logo upload error: " + uploadError.message);
      }
    }

    setLoading(false);
    window.location.href = `https://${fullDomain}/dashboard`;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Typography variant="h5">Tenant Setup</Typography>
            <TextField
              label="Company Name"
              name="company_name"
              fullWidth
              value={form.company_name}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              label="Subdomain"
              name="subdomain"
              fullWidth
              value={`${form.subdomain}${DOMAIN_SUFFIX}`}
              disabled
              sx={{ mt: 2 }}
            />
            <TextField
              label="Email"
              name="email"
              fullWidth
              value={form.email}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              value={form.password}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <Button
              variant="contained"
              onClick={sendOtp}
              disabled={resendCountdown > 0}
              sx={{ mt: 3 }}
            >
              {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : "Send OTP"}
            </Button>
          </>
        );

      case 2:
        return (
          <>
            <Typography variant="h6">Enter OTP</Typography>
            <TextField
              label="OTP Code"
              name="otp"
              fullWidth
              value={form.otp}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <Button variant="contained" onClick={verifyOtp} sx={{ mt: 3 }}>
              Verify & Continue
            </Button>
          </>
        );

      case 3:
        return (
          <>
            <Typography variant="h6">Upload Logo (Optional)</Typography>
            <Button variant="outlined" component="label" sx={{ mt: 2 }}>
              Upload Logo
              <input
                type="file"
                hidden
                name="logoFile"
                onChange={handleChange}
                accept="image/*"
              />
            </Button>
            {form.logoFile && (
              <Avatar
                src={URL.createObjectURL(form.logoFile)}
                sx={{ mt: 2, width: 80, height: 80 }}
              />
            )}
            <Button
              variant="contained"
              onClick={completeSetup}
              sx={{ mt: 4 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Finish Setup"}
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 500, mx: "auto" }}>
      {renderStep()}
    </Box>
  );
};

export default TenantSetupWizard;
