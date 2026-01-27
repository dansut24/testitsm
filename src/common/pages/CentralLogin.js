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
import { getModuleBaseUrl } from "../utils/portalUrl";

function normalizeRedirect(r) {
  const s = String(r || "").trim();
  if (!s) return "/";
  // ensure it starts with /
  return s.startsWith("/") ? s : `/${s}`;
}

function isModuleRedirect(path) {
  const p = normalizeRedirect(path).toLowerCase();
  return p === "/itsm" || p === "/control" || p === "/self";
}

function moduleFromRedirect(path) {
  const p = normalizeRedirect(path).toLowerCase();
  return p.replace("/", "");
}

export default function CentralLogin({ title = "Sign in", afterLogin = "/" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const redirect = useMemo(() => {
    const q = new URLSearchParams(location.search).get("redirect");
    return normalizeRedirect(q || afterLogin || "/");
  }, [location.search, afterLogin]);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Login failed");
        return;
      }

      // If redirect is module selection, hard jump to that subdomain
      if (isModuleRedirect(redirect)) {
        const mod = moduleFromRedirect(redirect);
        window.location.replace(`${getModuleBaseUrl(mod)}/`);
        return;
      }

      // Otherwise stay on tenant base host (landing etc)
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
              {title}
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
        </Paper>
      </Container>
    </Box>
  );
}
