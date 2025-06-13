import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from "@mui/material";
import { supabase } from "../../common/utils/supabaseClient";
import { useNavigate } from "react-router-dom";

const steps = ["Company Info", "Admin Setup", "Email Verification", "Logo Upload", "Finish"];

const TenantSetupWizard = () => {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [domain, setDomain] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async () => {
    setError("");

    if (activeStep === 0) {
      if (!companyName) return setError("Company name is required.");
      const generated = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
      setDomain(generated);
      setSubdomain(generated);
      setActiveStep(1);
    }

    else if (activeStep === 1) {
      if (!email || !password) return setError("Email and password are required.");
      setLoading(true);
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      setLoading(false);
      if (signUpError) return setError(signUpError.message);
      setActiveStep(2);
    }

    else if (activeStep === 2) {
      if (!otp) return setError("OTP is required.");
      setLoading(true);
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      setLoading(false);
      if (verifyError) return setError(verifyError.message);
      setActiveStep(3);
    }

    else if (activeStep === 3) {
      setActiveStep(4);
    }

    else if (activeStep === 4) {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const user = session.data.session?.user;

      if (!user) {
        setLoading(false);
        return setError("User session not found.");
      }

      const fullDomain = `${subdomain}-itsm.hi5tech.co.uk`;

      const { data: tenantData, error: tenantError } = await supabase
        .from("tenants")
        .insert({
          name: companyName,
          domain,
          subdomain: fullDomain,
          created_by: user.id,
        })
        .select()
        .single();

      if (tenantError) {
        setLoading(false);
        return setError("Error creating tenant: " + tenantError.message);
      }

      const logoPath = `${subdomain}-itsm/logo.png`;

      if (logoFile) {
        const { error: uploadError } = await supabase.storage
          .from("tenant-logos")
          .upload(logoPath, logoFile, { upsert: true });
        if (uploadError) {
          setLoading(false);
          return setError("Error uploading logo: " + uploadError.message);
        }
      }

      const { error: settingsError } = await supabase
        .from("tenant_settings")
        .insert({
          tenant_id: tenantData.id,
          logo_url: logoFile ? `https://ciilmjntkujdhxtsmsho.supabase.co/storage/v1/object/public/tenant-logos/${logoPath}` : null,
        });

      if (settingsError) {
        setLoading(false);
        return setError("Error saving settings: " + settingsError.message);
      }

      setLoading(false);
      navigate(`https://${subdomain}-itsm.hi5tech.co.uk`);
    }
  };

  const handleLogoChange = (e) => {
    setLogoFile(e.target.files?.[0] || null);
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Subdomain"
              value={`${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}-itsm.hi5tech.co.uk`}
              margin="normal"
              disabled
            />
          </>
        );

      case 1:
        return (
          <>
            <TextField
              fullWidth
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
            />
          </>
        );

      case 2:
        return (
          <>
            <Typography>Enter the 6-digit OTP sent to your email.</Typography>
            <TextField
              fullWidth
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              margin="normal"
            />
          </>
        );

      case 3:
        return (
          <>
            <Typography>Upload your company logo (optional):</Typography>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
          </>
        );

      case 4:
        return <Typography>Finalising setup...</Typography>;

      default:
        return null;
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4} p={3}>
      <Typography variant="h4" gutterBottom>
        Tenant Setup Wizard
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStep()}

      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}

      <Box mt={3}>
        <Button variant="contained" onClick={handleNext} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </Box>
  );
};

export default TenantSetupWizard;
