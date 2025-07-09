import React, { useEffect, useState } from "react";
import {
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

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Left Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 4,
          backgroundColor: "#f8f8f8",
        }}
      >
        <Box sx={{ maxWidth: 400, width: "100%" }}>
          <img src={logoUrl} alt="Tenant Logo" style={{ height: 50, marginBottom: 24 }} />

          <Typography variant="h5" fontWeight={600} mb={1}>
            Sign in to Hi5Tech
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Use your credentials or a social provider
          </Typography>

          <Stack spacing={1.5} mb={3}>
            <Button
              variant="outlined"
              startIcon={<GoogleIcon />}
              fullWidth
              onClick={handleGoogleLogin}
            >
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
        </Box>
      </Box>

      {/* Right Side - Branding / Welcome */}
      <Box
        sx={{
          flex: 1,
          px: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#ffffff",
          position: "relative",
        }}
      >
        <MuiLink
          component={Link}
          to="/self-service"
          underline="hover"
          fontSize="0.9rem"
          sx={{
            position: "absolute",
            top: 24,
            right: 32,
            fontWeight: 500,
          }}
        >
          Go to Self-Service
        </MuiLink>

        <Box sx={{ maxWidth: 500, width: "100%" }}>
          <Typography
            variant="h3"
            fontWeight={700}
            mb={2}
            sx={{ fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" } }}
          >
            Welcome Back 👋
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            mb={3}
            sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }}
          >
            Manage your services, assets, and requests all in one place.
          </Typography>
          <img
            src={logoUrl}
            alt="Welcome Visual"
            style={{
              maxWidth: "100%",
              height: "auto",
              objectFit: "contain",
              opacity: 0.85,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
