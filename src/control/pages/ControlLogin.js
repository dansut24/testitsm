// src/control/pages/ControlLogin.js
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

const ControlLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) {
          navigate("/dashboard");
        }
      });
    }
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setStatus(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/control-login`,
      },
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setStatus({ type: "success", message: `Check your email for the login link.` });
    }

    setLoading(false);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 400, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Control Portal Login
      </Typography>

      <Stack spacing={2} mt={2}>
        <TextField
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <Button variant="contained" onClick={handleLogin} disabled={loading || !email}>
          {loading ? "Sending..." : "Send Magic Link"}
        </Button>

        {status && <Alert severity={status.type}>{status.message}</Alert>}
      </Stack>
    </Box>
  );
};

export default ControlLogin;
