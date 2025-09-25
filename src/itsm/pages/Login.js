import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Divider,
  Stack,
  Box,
  Link as MuiLink,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import BusinessIcon from "@mui/icons-material/Business";
import { supabase } from "../../common/utils/supabaseClient";
import defaultLogo from "../../common/assets/865F7924-3016-4B89-8DF4-F881C33D72E6.png";

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState(defaultLogo);

  const rawSubdomain = window.location.hostname.split(".")[0];
  const baseSubdomain = rawSubdomain.replace("-itsm", "");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
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
      } catch (err) {
        console.error("Error fetching tenant logo:", err);
      }
    };

    fetchLogo();
  }, [baseSubdomain]);

  const handleChange = (e) => {
    const target = e?.target;
    if (!target) return;
    const { name, value } = target;
    if (name) setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    setError("");
    const { email, password } = formData;

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError || !data.session) {
        setError("Invalid login credentials.");
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) setError("Google sign-in failed.");
    } catch (err) {
      setError("An unexpected error occurred with Google sign-in.");
      console.error(err);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", width: "100vw", display: "flex", flexDirection: "column", bgcolor: "#f0f2f5", p: isMobile ? 2 : 6, boxSizing: "border-box", justifyContent: "center" }}>
      {/* Header Section */}
      <Box sx={{ maxWidth: 900, mx: "auto", textAlign: "center", mb: 5 }}>
        <MuiLink component={Link} to="/self-service" underline="hover" fontSize="0.9rem" sx={{ fontWeight: 500, display: "inline-block", mb: 1, color: theme.palette.primary.main }}>
          Go to Self-Service
        </MuiLink>
        <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" }, mb: 1 }}>
          Welcome Back 👋
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }}>
          Manage your services, assets, and requests all in one place.
        </Typography>
      </Box>

      {/* Login Form Section */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: isMobile ? "column" : "row", gap: 4, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
        <Paper elevation={3} sx={{ p: 5, width: "100%", maxWidth: 440, borderRadius: 4, boxShadow: theme.shadows[4] }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <img src={logoUrl} alt="Tenant Logo" style={{ maxHeight: 60, marginBottom: 16 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Sign in to Hi5Tech
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your credentials or continue with a social provider
            </Typography>
          </Box>

          <Stack spacing={2} mt={2}>
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

          <Divider sx={{ my: 4 }}>or</Divider>

          <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} margin="dense" autoComplete="email" />
          <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} margin="dense" autoComplete="current-password" />

          <Box sx={{ textAlign: "right", mt: 1 }}>
            <MuiLink component={Link} to="/reset-password" underline="hover" fontSize="0.875rem">
              Forgot password?
            </MuiLink>
          </Box>

          {error && <Typography color="error" mt={1} sx={{ fontSize: "0.875rem" }}>{error}</Typography>}

          <Button variant="contained" fullWidth sx={{ mt: 4, py: 1.5, fontWeight: 600 }} onClick={handleLogin}>
            Login
          </Button>
        </Paper>

        {!isMobile && (
          <Box sx={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
            <img src={logoUrl} alt="Welcome Visual" style={{ width: "100%", maxHeight: 220, objectFit: "contain", opacity: 0.85 }} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Login;
