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
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import BusinessIcon from "@mui/icons-material/Business";
import { useThemeMode } from "../../common/context/ThemeContext";
import { supabase } from "../../common/utils/supabaseClient";
import defaultLogo from "../../assets/865F7924-3016-4B89-8DF4-F881C33D72E6.png";
import AuthService from "../../common/services/AuthService";

const ControlLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState(defaultLogo);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mode } = useThemeMode();

  const rawSubdomain = window.location.hostname.split(".")[0];
  const baseSubdomain = rawSubdomain.replace("-control", "");

  useEffect(() => {
    const fetchLogo = async () => {
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("id")
        .eq("subdomain", baseSubdomain)
        .maybeSingle();

      if (!tenantData) return;

      const { data: settings } = await supabase
        .from("tenant_settings")
        .select("logo_url")
        .eq("tenant_id", tenantData.id)
        .maybeSingle();

      const { data: publicData } = supabase.storage
        .from("tenant-logos")
        .getPublicUrl(settings?.logo_url || "");

      if (publicData?.publicUrl) setLogoUrl(publicData.publicUrl);
    };

    fetchLogo();
  }, [baseSubdomain]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    setError("");
    const { email, password } = formData;
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    const { error: loginError } = await AuthService.signIn(email, password);
    if (loginError) {
      setError("Invalid login credentials.");
      return;
    }

    const redirect = searchParams.get("redirect");
    navigate(redirect || "/");
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setError("Google sign-in failed.");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={4} sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
        <img src={logoUrl} alt="Tenant Logo" style={{ height: 60, marginBottom: 16 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Welcome to Hi5Tech Control
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

        {error && <Typography color="error" mt={1}>{error}</Typography>}

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, py: 1.2, fontWeight: "bold" }}
          onClick={handleLogin}
        >
          Login
        </Button>
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

export default ControlLogin;
