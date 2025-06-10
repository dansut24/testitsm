import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, loginWithMicrosoft } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  const getSubdomain = () => {
    const host = window.location.hostname;
    const parts = host.split(".");
    return parts.length >= 3 ? parts[0] : null;
  };

  useEffect(() => {
    const fetchLogoFromStorage = async () => {
      const subdomain = getSubdomain();
      if (!subdomain) return;

      // Step 1: Get tenant ID by subdomain
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("id")
        .eq("subdomain", subdomain)
        .single();

      if (tenantError || !tenant?.id) {
        console.error("Tenant not found:", tenantError?.message);
        return;
      }

      // Step 2: Get logo path from tenant_settings
      const { data: settings, error: settingsError } = await supabase
        .from("tenant_settings")
        .select("logo_url")
        .eq("tenant_id", tenant.id)
        .single();

      if (settingsError || !settings?.logo_url) {
        console.error("Logo path not found in tenant_settings:", settingsError?.message);
        return;
      }

      // Step 3: Convert logo path to full public URL
      const { data: publicUrlData } = supabase.storage
        .from("tenant-logos")
        .getPublicUrl(settings.logo_url);

      if (publicUrlData?.publicUrl) {
        setLogoUrl(publicUrlData.publicUrl);
        setDebugInfo(`Subdomain: ${subdomain}\nPublic URL: ${publicUrlData.publicUrl}`);
      } else {
        console.warn("Public URL could not be resolved.");
      }
    };

    fetchLogoFromStorage();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: loginError } = await login(email, password);
    setLoading(false);

    if (loginError) {
      setError("Invalid email or password.");
    } else {
      navigate("/user-dashboard");
    }
  };

  const handleMicrosoftLogin = async () => {
    const { error: msError } = await loginWithMicrosoft();
    if (msError) setError("Microsoft login failed.");
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 10,
        px: 3,
        py: 4,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "white",
        textAlign: "center",
      }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Tenant Logo"
          style={{ width: "150px", marginBottom: 20 }}
        />
      ) : (
        <Typography variant="body2" color="text.secondary" mb={2}>
          No logo loaded
        </Typography>
      )}

      <Typography variant="h5" mb={3}>
        Login
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Password"
          margin="normal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Login"}
        </Button>
      </form>

      <Divider sx={{ my: 3 }}>or</Divider>

      <Button
        fullWidth
        variant="outlined"
        onClick={handleMicrosoftLogin}
        sx={{ mb: 2 }}
      >
        Sign in with Microsoft
      </Button>

      {/* Optional Debug */}
      <Button
        size="small"
        variant="text"
        onClick={() => alert(debugInfo || "No info available")}
      >
        Show Logo Debug Info
      </Button>
    </Box>
  );
};

export default Login;
