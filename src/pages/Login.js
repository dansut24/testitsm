// src/pages/Login.js

import React, { useState } from "react";
import {
  Container, Paper, TextField, Button, Typography, Divider, Stack, Box, Link as MuiLink
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import BusinessIcon from "@mui/icons-material/Business";
import defaultLogo from "../assets/865F7924-3016-4B89-8DF4-F881C33D72E6.png";
import { useThemeMode } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AuthService from "../services/AuthService";
import { supabase } from "../supabaseClient";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const { tenant } = useAuth();

  const logoSrc = tenant?.settings?.logo_url || defaultLogo;

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
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) {
      console.error("Google sign-in error:", error.message);
      setError("Google sign-in failed.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={4} sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
        <img src={logoSrc} alt="Tenant Logo" style={{ height: 60, marginBottom: 16 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Welcome to {tenant?.name || "Hi5Tech"}
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

        <Button variant="contained" fullWidth sx={{ mt: 3, py: 1.2, fontWeight: "bold" }} onClick={handleLogin}>
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

export default Login;
