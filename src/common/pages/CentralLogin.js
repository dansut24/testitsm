import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function CentralLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const redirect = new URLSearchParams(location.search).get("redirect");

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message || "Login failed");
        return;
      }
      // After login, go to router that decides where to send the user
      navigate(redirect || "/app", { replace: true });
    } catch (e2) {
      setError(e2?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2 }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={900}>
            Sign in
          </Typography>
          <Typography sx={{ opacity: 0.7, mt: 0.6 }}>
            Access ITSM, Control and Self Service from one login.
          </Typography>

          <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="dense"
              type="email"
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="dense"
              type="password"
              autoComplete="current-password"
            />

            {error ? (
              <Typography sx={{ color: "error.main", mt: 1 }}>{error}</Typography>
            ) : null}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={busy}
              sx={{ mt: 3, py: 1.2, fontWeight: 900 }}
            >
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
