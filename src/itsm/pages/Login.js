import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
  Stack,
  Box,
  Grid,
  Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import BusinessIcon from "@mui/icons-material/Business";
import { supabase } from "../../common/utils/supabaseClient";
import defaultLogo from "../../common/assets/865F7924-3016-4B89-8DF4-F881C33D72E6.png";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState(defaultLogo);
  const [debugInfo, setDebugInfo] = useState(null);

  const rawSubdomain = window.location.hostname.split(".")[0];
  const baseSubdomain = rawSubdomain.replace("-itsm", "");

  useEffect(() => {
    const fetchLogo = async () => {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("subdomain", baseSubdomain)
        .maybeSingle();

      if (!tenant) return;

      const { data: settings } = await supabase
        .from("tenant_settings")
        .select("logo_url")
        .eq("tenant_id", tenant.id)
        .maybeSingle();

      if (settings?.logo_url) {
        const { data: publicData } = supabase.storage
          .from("tenant-logos")
          .getPublicUrl(settings.logo_url);

        if (publicData?.publicUrl) setLogoUrl(publicData.publicUrl);
      }
    };

    fetchLogo();
  }, [baseSubdomain]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    setError("");
    const { email, password } = formData;

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError || !data.session) {
      console.error("Login failed:", loginError?.message);
      setError("Invalid login credentials.");
      return;
    }

    navigate("/dashboard");
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) setError("Google sign-in failed.");
  };

  const handleTestLogo = async () => {
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("id, subdomain")
      .eq("subdomain", baseSubdomain)
      .maybeSingle();

    if (!tenantData) {
      setDebugInfo({
        subdomain: baseSubdomain,
        tenantId: "Not found",
        logoUrl: "Not found",
        error: "❌ Tenant not found",
      });
      return;
    }

    const { data: settings } = await supabase
      .from("tenant_settings")
      .select("logo_url")
      .eq("tenant_id", tenantData.id)
      .maybeSingle();

    if (!settings || !settings.logo_url) {
      setDebugInfo({
        subdomain: tenantData.subdomain,
        tenantId: tenantData.id,
        logoUrl: "Not found",
        error: "⚠️ No logo_url set in tenant_settings",
      });
      return;
    }

    const { data: publicData } = supabase.storage
      .from("tenant-logos")
      .getPublicUrl(settings.logo_url);

    setDebugInfo({
      subdomain: tenantData.subdomain,
      tenantId: tenantData.id,
      logoUrl: publicData?.publicUrl || "Not resolved",
    });
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {/* Left Login Section */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f8f8",
          p: 4,
        }}
      >
        <Paper elevation={4} sx={{ p: 4, borderRadius: 4, width: "100%", maxWidth: 400 }}>
          <Box textAlign="center" mb={2}>
            <img
              src={logoUrl}
              alt="Tenant Logo"
              style={{ height: 60, marginBottom: 16 }}
            />
            <Typography variant="h5" fontWeight={600}>
              Sign in to Hi5Tech
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Use your credentials or social account
            </Typography>
          </Box>

          <Stack spacing={1.5} mb={3}>
            <Button
              variant="outlined"
              startIcon={<GoogleIcon />}
              fullWidth
              onClick={handleGoogleLogin}
            >
              Sign in with Google
            </Button>
            <Button
              variant="outlined"
              startIcon={<BusinessIcon />}
              fullWidth
              disabled
            >
              Sign in with Microsoft
            </Button>
            <Button
              variant="outlined"
              startIcon={<GitHubIcon />}
              fullWidth
              disabled
            >
              Sign in with GitHub
            </Button>
          </Stack>

          <Divider sx={{ my: 3 }}>or</Divider>

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="dense"
          />

          <Box sx={{ textAlign: "right", mt: 1 }}>
            <MuiLink
              component={Link}
              to="/reset-password"
              underline="hover"
              fontSize="0.875rem"
            >
              Forgot password?
            </MuiLink>
          </Box>

          {error && (
            <Typography color="error" mt={1}>
              {error}
            </Typography>
          )}

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3, py: 1.2, fontWeight: "bold" }}
            onClick={handleLogin}
          >
            Login
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleTestLogo}
          >
            Test Logo & Subdomain
          </Button>

          {debugInfo && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 2,
                textAlign: "left",
              }}
            >
              <Typography variant="body2">
                Subdomain: {debugInfo.subdomain}
              </Typography>
              <Typography variant="body2">
                Tenant ID: {debugInfo.tenantId}
              </Typography>
              <Typography variant="body2">
                Logo URL: {debugInfo.logoUrl}
              </Typography>
              {debugInfo.error && (
                <Typography variant="body2" color="error">
                  {debugInfo.error}
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Right Side Info / Visual */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          backgroundColor: "#ffffff",
          p: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ position: "absolute", top: 20, right: 30 }}>
          <MuiLink
            component={Link}
            to="/self-service"
            underline="hover"
            fontSize="0.9rem"
            sx={{ fontWeight: 500 }}
          >
            Go to Self-Service
          </MuiLink>
        </Box>

        <Box sx={{ maxWidth: 500 }}>
          <Typography variant="h3" fontWeight={700} mb={2}>
            Welcome Back 👋
          </Typography>
          <Typography variant="h6" color="text.secondary" mb={3}>
            Manage your IT services, assets, and tickets in one place.
          </Typography>
          <img
            src={logoUrl}
            alt="Brand Visual"
            style={{ maxWidth: "100%", height: "auto", marginTop: 16 }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
