import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { supabase } from "../../common/utils/supabaseClient";
import { useNavigate } from "react-router-dom";

function TenantSetupWizard() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  // Generate subdomain slug automatically
  useEffect(() => {
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
    setSubdomain(slug);
  }, [companyName]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Fetch latest session after OTP verification
  const refreshSession = async () => {
    const { data } = await supabase.auth.refreshSession();
    setSession(data.session);
    setUser(data.session?.user || null);
  };

  const handleSendOTP = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    setCountdown(60);
    setStep(2);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });
    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }
    await refreshSession();
    setStep(3);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);

    const domain = `${subdomain}-itsm.hi5tech.co.uk`;
    const tenantInsert = await supabase
      .from("tenants")
      .insert({
        name: companyName,
        domain,
        subdomain,
        created_by: user.id,
      })
      .select()
      .single();

    if (tenantInsert.error) {
      setLoading(false);
      return alert(tenantInsert.error.message);
    }

    const tenantId = tenantInsert.data.id;

    // Insert default team
    await supabase.from("teams").insert([
      {
        name: "Service Desk",
        tenant_id: tenantId,
      },
    ]);

    // Upload logo if provided
    if (logoFile) {
      const path = `${subdomain}-itsm/logo.png`;
      const { error: uploadError } = await supabase.storage
        .from("tenant-logos")
        .upload(path, logoFile, {
          upsert: true,
          contentType: logoFile.type,
        });

      if (uploadError) {
        console.error("Logo upload failed:", uploadError.message);
      } else {
        const logoUrl = `https://ciilmjntkujdhxtsmsho.supabase.co/storage/v1/object/public/tenant-logos/${path}`;
        await supabase
          .from("tenant_settings")
          .insert({ tenant_id: tenantId, logo_url: logoUrl });
      }
    } else {
      await supabase
        .from("tenant_settings")
        .insert({ tenant_id: tenantId });
    }

    setLoading(false);
    navigate(`https://${subdomain}-itsm.hi5tech.co.uk/dashboard`);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Setup Your Hi5Tech ITSM
      </Typography>

      {step === 1 && (
        <>
          <TextField
            label="Company Name"
            fullWidth
            margin="normal"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <TextField
            label="Admin Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <TextField
            label="Password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
          <Box display="flex" alignItems="center" mt={2}>
            <TextField
              label="Subdomain"
              fullWidth
              margin="normal"
              value={subdomain}
              disabled
              InputProps={{
                endAdornment: (
                  <Typography sx={{ ml: 1, color: "#888" }}>
                    -itsm.hi5tech.co.uk
                  </Typography>
                ),
              }}
            />
          </Box>
          <Box mt={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSendOTP}
              disabled={countdown > 0}
            >
              {countdown > 0 ? `Resend Code (${countdown}s)` : "Send Verification Code"}
            </Button>
          </Box>
        </>
      )}

      {step === 2 && (
        <>
          <TextField
            label="Enter OTP Code"
            fullWidth
            margin="normal"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button variant="contained" fullWidth onClick={handleVerifyOTP} sx={{ mt: 2 }}>
            Verify OTP
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <Box mt={2}>
            <Typography variant="subtitle1">Upload Company Logo</Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files[0])}
            />
          </Box>
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handleSubmit}
          >
            Finish Setup
          </Button>
        </>
      )}

      {loading && (
        <Box mt={3} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}

export default TenantSetupWizard;
