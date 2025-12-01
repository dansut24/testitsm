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
  Paper,
} from "@mui/material";
import { supabase } from "../../common/utils/supabaseClient";

const steps = ["Company Info", "Admin", "Verify Email", "Logo", "Finish"];

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

  // 🔹 Live subdomain status
  const [subdomainStatus, setSubdomainStatus] = useState("idle"); // idle | checking | available | taken | invalid | error
  const [subdomainMessage, setSubdomainMessage] = useState("");

  // 🔹 Logo preview
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      if (resendCooldown > 0) setResendCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Clean up object URL when logo changes
  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({ ...prev, logoFile: file || null }));

    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    if (file) {
      const preview = URL.createObjectURL(file);
      setLogoPreviewUrl(preview);
    } else {
      setLogoPreviewUrl("");
    }
  };

  /**
   * Low-level DB check used by both live-check and final validation
   */
  const querySubdomainInDb = async (normalisedSubdomain) => {
    const { data, error } = await supabase
      .from("tenants")
      .select("id")
      .eq("subdomain", normalisedSubdomain)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }
    return !!data; // true if taken
  };

  /**
   * FINAL validation when moving on / submitting.
   */
  const checkSubdomainAvailable = async () => {
    setStatus(null);
    const { companyName, subdomain } = formData;

    if (!companyName.trim()) {
      setStatus({
        type: "error",
        message: "Please enter your company name.",
      });
      return false;
    }

    if (!subdomain.trim()) {
      setStatus({
        type: "error",
        message: "Please enter a subdomain.",
      });
      return false;
    }

    const normalised = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (normalised !== subdomain) {
      setFormData((prev) => ({ ...prev, subdomain: normalised }));
    }

    if (normalised.length < 3) {
      setStatus({
        type: "error",
        message: "Subdomain should be at least 3 characters.",
      });
      return false;
    }

    try {
      const taken = await querySubdomainInDb(normalised);
      if (taken) {
        setStatus({
          type: "error",
          message:
            "That subdomain is already in use. Please choose another.",
        });
        return false;
      }
      return true;
    } catch (err) {
      console.error("Subdomain check error:", err);
      setStatus({
        type: "error",
        message:
          "Unable to verify subdomain uniqueness. Please try again.",
      });
      return false;
    }
  };

  const handleStep0Next = async () => {
    const ok = await checkSubdomainAvailable();
    if (ok) setStep(1);
  };

  /**
   * 🔹 LIVE subdomain checks while the user types
   */
  useEffect(() => {
    const raw = formData.subdomain;

    if (!raw) {
      setSubdomainStatus("idle");
      setSubdomainMessage("");
      return;
    }

    const normalised = raw.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (normalised !== raw) {
      setFormData((prev) => ({ ...prev, subdomain: normalised }));
      return;
    }

    if (normalised.length < 3) {
      setSubdomainStatus("invalid");
      setSubdomainMessage("Subdomain must be at least 3 characters.");
      return;
    }

    let cancelled = false;

    const run = async () => {
      setSubdomainStatus("checking");
      setSubdomainMessage("Checking availability…");

      try {
        const taken = await querySubdomainInDb(normalised);
        if (cancelled) return;

        if (taken) {
          setSubdomainStatus("taken");
          setSubdomainMessage("This subdomain is already in use.");
        } else {
          setSubdomainStatus("available");
          setSubdomainMessage("This subdomain is available.");
        }
      } catch (err) {
        console.error("Live subdomain check error:", err);
        if (!cancelled) {
          setSubdomainStatus("error");
          setSubdomainMessage("Could not check availability right now.");
        }
      }
    };

    const timeout = setTimeout(run, 500); // debounce 500ms

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [formData.subdomain]);

  const sendOtp = async () => {
    setStatus(null);
    const { adminEmail, adminPassword, confirmPassword } = formData;

    if (!adminEmail || !adminPassword || !confirmPassword) {
      setStatus({
        type: "error",
        message: "Please complete email and both password fields.",
      });
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adminEmail)) {
      setStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    if (adminPassword !== confirmPassword) {
      setStatus({
        type: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: adminEmail,
        options: {
          data: { role: "owner" },
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.error("Supabase signInWithOtp error:", error);
        setStatus({
          type: "error",
          message:
            error.message || "Unable to send verification code. Please try again.",
        });
        return;
      }

      console.log("signInWithOtp response:", data);

      setResendCooldown(60);
      setStatus({
        type: "success",
        message:
          "Verification code sent to your email. It will expire after a short time, so please verify promptly.",
      });
      setStep(2);
    } catch (err) {
      console.error("Unexpected error during sendOtp:", err);
      setStatus({
        type: "error",
        message: "Unexpected error sending verification code.",
      });
    }
  };

  const verifyOtp = async () => {
    setStatus(null);
    const { adminEmail, otp, adminPassword } = formData;

    if (!otp) {
      setStatus({
        type: "error",
        message: "Please enter the verification code.",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: adminEmail,
        token: otp,
        type: "email",
      });

      if (error) {
        console.error("Supabase verifyOtp error:", error);
        setStatus({ type: "error", message: error.message });
        return;
      }

      setStatus({
        type: "success",
        message: "Email verified successfully.",
      });

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const { error: pwError } = await supabase.auth.updateUser({
          password: adminPassword,
        });
        if (pwError) {
          console.error("Password update failed:", pwError.message);
          setStatus({
            type: "error",
            message:
              "Email verified, but password could not be set. Please try again.",
          });
          return;
        }
      }

      setStep(3);
    } catch (err) {
      console.error("Unexpected error during verifyOtp:", err);
      setStatus({
        type: "error",
        message: "Unexpected error verifying code.",
      });
    }
  };

  const handleSubmit = async () => {
    setStatus(null);
    const { companyName, subdomain, logoFile } = formData;
    const domain = `${subdomain}-itsm.hi5tech.co.uk`;

    try {
      const ok = await checkSubdomainAvailable();
      if (!ok) return;

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        console.error("No authenticated user for tenant creation:", userErr);
        setStatus({
          type: "error",
          message:
            "User session not found. Please verify your email and log in again.",
        });
        return;
      }

      const user = userData.user;

      const isVerified =
        user.email_confirmed_at ||
        user.confirmed_at ||
        user.app_metadata?.provider;

      if (!isVerified) {
        setStatus({
          type: "error",
          message:
            "Your email address is not verified. Please complete verification before creating your tenant.",
        });
        return;
      }

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
        setStatus({ type: "error", message: tenantError.message });
        return;
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
        } else {
          console.warn("Logo upload failed:", uploadError);
        }
      }

      await supabase.from("tenant_settings").insert({
        tenant_id: tenant.id,
        logo_url,
        onboarding_complete: false, // 🔹 used for post-setup wizard
      });

      window.location.href = `https://${domain}/dashboard`;
    } catch (err) {
      console.error("Unexpected error in handleSubmit:", err);
      setStatus({
        type: "error",
        message:
          err?.message || "Unexpected error while creating the tenant.",
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tenant Setup
      </Typography>

      <Stepper activeStep={step} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4 }}>
        {/* STEP 0: Company Info */}
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
                setFormData((prev) => ({
                  ...prev,
                  companyName: name,
                  subdomain: name
                    ? name.toLowerCase().replace(/\s+/g, "")
                    : prev.subdomain,
                }));
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
                  <Typography color="text.secondary" sx={{ ml: 0.5 }}>
                    .hi5tech.co.uk
                  </Typography>
                ),
              }}
              helperText={
                subdomainMessage ||
                "This will become your ITSM URL, e.g. mycompany-itsm.hi5tech.co.uk"
              }
              FormHelperTextProps={{
                sx: {
                  color:
                    subdomainStatus === "taken" || subdomainStatus === "invalid"
                      ? "error.main"
                      : subdomainStatus === "available"
                      ? "success.main"
                      : "text.secondary",
                },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleStep0Next}
            >
              Next
            </Button>
          </>
        )}

        {/* STEP 1: Admin */}
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
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              A one-time code will be emailed to you. It will expire after a
              short period; if it does, you will need to request a new code
              before completing setup.
            </Typography>
          </>
        )}

        {/* STEP 2: Verify Email */}
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

        {/* STEP 3: Logo + Preview */}
        {step === 3 && (
          <>
            <Typography gutterBottom>Upload Company Logo</Typography>
            <input type="file" accept="image/*" onChange={handleFileChange} />

            {logoPreviewUrl && (
              <Paper
                elevation={1}
                sx={{
                  mt: 2,
                  p: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    Logo Preview
                  </Typography>
                  <img
                    src={logoPreviewUrl}
                    alt="Logo preview"
                    style={{
                      maxWidth: 200,
                      maxHeight: 80,
                      objectFit: "contain",
                    }}
                  />
                </Box>
              </Paper>
            )}

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

        {/* STEP 4: Finish */}
        {step === 4 && (
          <>
            <Typography gutterBottom>
              Your email is verified and you’re ready to create your tenant.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clicking &quot;Create Tenant&quot; will provision your dedicated
              ITSM environment at:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mt: 0.5, mb: 2 }}
            >
              {formData.subdomain}-itsm.hi5tech.co.uk
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 1 }}
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
