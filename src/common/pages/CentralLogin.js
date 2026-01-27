// src/common/pages/CentralLogin.js
import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { buildTenantLoginUrl, getTenantBaseHost, isModuleHost } from "../utils/tenantHost";

function getDefaultTitle() {
  const host = window.location.hostname || "";
  if (host.includes("-control.")) return "Sign in to Control";
  if (host.includes("-self.")) return "Sign in to Self Service";
  if (host.includes("-itsm.")) return "Sign in to ITSM";
  return "Sign in to Hi5Tech";
}

/**
 * CentralLogin rules:
 * - If you're on a module host, redirect the browser to tenant login host.
 * - If you're on tenant host, sign in and navigate to redirect (default /app).
 */
export default function CentralLogin({ title }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const computedTitle = useMemo(() => title || getDefaultTitle(), [title]);

  const redirect =
    new URLSearchParams(location.search).get("redirect") || "/app";

  // If user lands on /login on a module host, bounce to tenant login.
  // IMPORTANT: This must be a hard redirect (different host).
  if (isModuleHost()) {
    const target = buildTenantLoginUrl(
      // if module asked for /control or /itsm, preserve it, else go /app
      redirect && redirect.startsWith("/") ? redirect : "/app"
    );
    window.location.replace(target);
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr) {
        setError(signInErr.message || "Login failed");
        return;
      }

      // We are on TENANT host here. After login go to landing (/app) or requested redirect.
      navigate(redirect, { replace: true });
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
          <Stack spacing={0.8}>
            <Typography variant="h5" fontWeight={950}>
              {computedTitle}
            </Typography>
            <Typography sx={{ opacity: 0.7 }}>
              Use your Hi5Tech account to continue.
            </Typography>
          </Stack>

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

          <Typography sx={{ mt: 2, opacity: 0.6, fontSize: 12 }}>
            Tenant: {getTenantBaseHost(window.location.hostname)}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
