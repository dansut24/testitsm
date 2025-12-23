import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link as MuiLink,
} from "@mui/material";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";
import defaultLogo from "../../assets/865F7924-3016-4B89-8DF4-F881C33D72E6.png";
// import AuthService from "../../common/services/AuthService";

const ControlLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState(defaultLogo);
  const [searchParams] = useSearchParams();

  const rawSubdomain = window.location.hostname.split(".")[0];
  const baseSubdomain = rawSubdomain.replace("-control", "");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
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
      } catch {
        // ignore logo errors for now
      }
    };

    fetchLogo();
  }, [baseSubdomain]);

  // Optional: auto-bypass when you visit /login?bypass=1 (handy in dev)
  useEffect(() => {
    const bypass = searchParams.get("bypass");
    if (bypass === "1" || bypass === "true") {
      const redirect = searchParams.get("redirect");
      window.location.href = redirect || "/";
    }
  }, [searchParams]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async () => {
  setError("");

  const { email, password } = formData;
  if (!email || !password) {
    setError("Please enter both email and password.");
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message || "Login failed");
      return;
    }

    // data.session should exist if login succeeded
    const redirect = searchParams.get("redirect");
    window.location.href = redirect || "/";
  } catch (e) {
    setError(e?.message || "Login failed");
  }
};

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={4} sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
        <img
          src={logoUrl}
          alt="Tenant Logo"
          style={{ height: 60, marginBottom: 16 }}
        />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Welcome to Hi5Tech Control
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Sign in to your workspace
        </Typography>

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

        {/* Optional helper hint (remove whenever) */}
        <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
          (Auth bypass enabled)
        </Typography>
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
