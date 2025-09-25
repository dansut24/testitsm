// Login.js
import React, { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Divider, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import BusinessIcon from "@mui/icons-material/Business";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    setLoading(false);
    if (error) setError(error.message);
    // Note: redirect handled by Supabase OAuth callback
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #4facfe, #00f2fe)",
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 400,
          width: "100%",
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h4" textAlign="center" fontWeight="bold">
          Welcome Back
        </Typography>
        <Typography variant="body2" textAlign="center" color="text.secondary">
          Sign in to continue
        </Typography>

        {error && (
          <Typography variant="body2" color="error" textAlign="center">
            {error}
          </Typography>
        )}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
          disabled={loading}
          fullWidth
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <Divider sx={{ my: 1 }}>OR</Divider>

        <Stack spacing={1}>
          <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleSocialLogin("google")}
            fullWidth
          >
            Sign in with Google
          </Button>
          <Button
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={() => handleSocialLogin("github")}
            fullWidth
          >
            Sign in with GitHub
          </Button>
          <Button
            variant="outlined"
            startIcon={<BusinessIcon />}
            onClick={() => handleSocialLogin("azure")}
            fullWidth
          >
            Sign in with Microsoft
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;
