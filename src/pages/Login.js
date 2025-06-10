// src/pages/Login.js

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
  Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import BusinessIcon from "@mui/icons-material/Business";
import { useThemeMode } from "../context/ThemeContext";
import AuthService from "../services/AuthService";
import { supabase } from "../supabaseClient";
import defaultLogo from "../assets/865F7924-3016-4B89-8DF4-F881C33D72E6.png";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState(defaultLogo);
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();
  const { mode } = useThemeMode();

  const subdomain = window.location.hostname.split(".")[0];

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        // Step 1: Get tenant
        const { data: tenantData, error: tenantError } = await supabase
          .from("tenants")
          .select("id")
          .eq("subdomain", subdomain)
          .maybeSingle();

        if (tenantError || !tenantData?.id) {
          console.warn("Tenant not found:", tenantError);
          return;
        }

        const tenantId = tenantData.id;

        // Step 2: Get tenant_settings.logo_url
        const { data: settings, error: settingsError } = await supabase
          .from("tenant_settings")
          .select("logo_url")
          .eq("tenant_id", tenantId)
          .maybeSingle();

        if (settingsError || !settings?.logo_url) {
          console.warn("No logo found for tenant.");
          return;
        }

        // Step 3: Convert to public URL from storage bucket
        const { data: publicData } = supabase.storage
          .from("tenant-logos")
          .getPublicUrl(settings.logo_url);

        if (publicData?.publicUrl) {
          setLogoUrl(publicData.publicUrl);
        } else {
          console.warn("Could not resolve public URL.");
        }
      } catch (err) {
        console.error("Error loading logo:", err.message);
      }
    };

    fetchLogo();
  }, [subdomain]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    setError("");
    const { email, password } = formData;

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    const { error: loginError } = await AuthService.signIn(email, password);

    if (loginError) {
      console.error("Login error:", loginError.message);
      setError("Invalid login credentials.");
      return;
    }

    navigate("/loading");
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      console.error("Google sign-in error:", error.message);
      setError("Google sign-in failed.");
    }
  };

  const handleTestLogo = async () => {
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("id, subdomain")
      .eq("subdomain", subdomain)
      .maybeSingle();

    if (tenantData?.id) {
      const { data: settings } = await supabase
        .from("tenant_settings")
        .select("logo_url")
        .eq("tenant_id", tenantData.id)
        .maybeSingle();

      const { data: publicData } = settings?.logo_url
        ? supabase.storage.from("tenant-logos").getPublicUrl(settings.logo_url)
        : { data: { publicUrl: "Not found" } };

      setDebugInfo({
        subdomain: tenantData.subdomain,
        tenantId: tenantData.id,
        logoUrl: publicData?.publicUrl || "Not found",
      });
    } else {
      setDebugInfo({
        subdomain,
        error: "Tenant not found",
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={4} sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
        <img src={logoUrl} alt="Tenant Logo" style={{ height: 60, marginBottom: 16 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Welcome to Hi5Tech
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Sign in to your workspace
        </Typography>

        <Stack spacing={1.5} mb={3}>
          <Button variant="outlined" startIcon={<GoogleIcon />} fullWidth onClick={handleGoogleLogin}>
            Sign in with Google
          </Button>
          <Button variant="outlined" startIcon={<BusinessIcon />} fullWidth disabled>
            Sign in with Microsoft
          </Button>
          <Button variant="outlined" startIcon={<GitHubIcon />} fullWidth disabled>
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
          <MuiLink component={Link} to="/reset-password" underline="hover" fontSize="0.875rem">
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
          <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 2, textAlign: "left" }}>
            <Typography variant="body2">Subdomain: {debugInfo.subdomain}</Typography>
            <Typography variant="body2">Tenant ID: {debugInfo.tenantId}</Typography>
            <Typography variant="body2">Logo URL: {debugInfo.logoUrl}</Typography>
          </Box>
        )}
      </Paper>

      <Typography
        variant="caption"
        display="block"
        align="center"
        sx={{ mt: 3, color: "text.secondary" }}
      >
        Powered by Hi5Tech
      </Typography>
    </Container>
  );
};

export default Login;
