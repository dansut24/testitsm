// src/common/pages/CentralLogin.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

const THEME_KEY = "hi5tech_theme"; // "dark" | "light"

function getThemeTokens(mode) {
  const isLight = mode === "light";

  return {
    mode,
    page: {
      color: isLight ? "rgba(10,16,34,0.92)" : "rgba(255,255,255,0.92)",
      background: isLight
        ? `
          radial-gradient(1200px 800px at 20% 10%, rgba(124, 92, 255, 0.20), transparent 60%),
          radial-gradient(1000px 700px at 85% 25%, rgba(56, 189, 248, 0.16), transparent 55%),
          radial-gradient(900px 700px at 60% 90%, rgba(34, 197, 94, 0.12), transparent 55%),
          linear-gradient(180deg, #F7F9FF 0%, #EEF3FF 55%, #EAF0FF 100%)
        `
        : `
          radial-gradient(1200px 800px at 20% 10%, rgba(124, 92, 255, 0.28), transparent 60%),
          radial-gradient(1000px 700px at 85% 25%, rgba(56, 189, 248, 0.18), transparent 55%),
          radial-gradient(900px 700px at 60% 90%, rgba(34, 197, 94, 0.10), transparent 55%),
          linear-gradient(180deg, #070A12 0%, #0A1022 45%, #0B1633 100%)
        `,
    },
    glass: {
      border: isLight ? "1px solid rgba(10,16,34,0.10)" : "1px solid rgba(255,255,255,0.10)",
      bg: isLight
        ? "linear-gradient(135deg, rgba(255,255,255,0.70), rgba(255,255,255,0.40))"
        : "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
      shadow: isLight
        ? "0 18px 55px rgba(10,16,34,0.12)"
        : "0 18px 55px rgba(0,0,0,0.35)",
      divider: isLight ? "rgba(10,16,34,0.10)" : "rgba(255,255,255,0.10)",
    },
    pill: {
      bg: isLight ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.06)",
      border: isLight ? "1px solid rgba(10,16,34,0.12)" : "1px solid rgba(255,255,255,0.10)",
      text: isLight ? "rgba(10,16,34,0.88)" : "rgba(255,255,255,0.88)",
    },
    buttonOutlined: {
      borderColor: isLight ? "rgba(10,16,34,0.20)" : "rgba(255,255,255,0.18)",
      color: isLight ? "rgba(10,16,34,0.88)" : "rgba(255,255,255,0.88)",
      background: isLight ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.04)",
    },
  };
}

function getDefaultAfterLogin() {
  const host = window.location.hostname || "";
  if (!host.includes("-control.") && !host.includes("-itsm.") && !host.includes("-self.")) {
    return "/app";
  }
  return "/";
}

function getDefaultTitle() {
  const host = window.location.hostname || "";
  if (host.includes("-control.")) return "Sign in to Control";
  if (host.includes("-self.")) return "Sign in to Self Service";
  if (host.includes("-itsm.")) return "Sign in to ITSM";
  return "Sign in";
}

function GlassPanel({ children, sx, t }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: t.glass.border,
        background: t.glass.bg,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: t.glass.shadow,
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

export default function CentralLogin({ title, afterLogin }) {
  const location = useLocation();

  const [themeMode, setThemeMode] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      // ignore
    }
    return "dark";
  });

  const t = useMemo(() => getThemeTokens(themeMode), [themeMode]);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const computedAfterLogin = useMemo(
    () => afterLogin || getDefaultAfterLogin(),
    [afterLogin]
  );

  const computedTitle = useMemo(() => title || getDefaultTitle(), [title]);

  const redirect =
    new URLSearchParams(location.search).get("redirect") || computedAfterLogin;

  // Nice UX: if you're already signed in and hit /login, bounce to redirect
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data?.session) window.location.assign(redirect);
    })();
    return () => {
      mounted = false;
    };
  }, [redirect]);

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

      // Confirm persistence (cookie storage)
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        setError("Signed in, but session was not created. Please try again.");
        return;
      }

      // Hard nav is most reliable with cross-subdomain cookies
      window.location.assign(redirect);
    } catch (e2) {
      setError(e2?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        color: t.page.color,
        background: t.page.background,
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <GlassPanel t={t} sx={{ p: { xs: 2.2, sm: 3 }, borderRadius: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Stack spacing={0.6} sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 950, fontSize: 22 }} noWrap>
                {computedTitle}
              </Typography>
              <Typography sx={{ opacity: 0.72, fontSize: 13 }} noWrap>
                Use your Hi5Tech account to continue.
              </Typography>
            </Stack>

            <Tooltip title={themeMode === "dark" ? "Switch to light" : "Switch to dark"}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  borderRadius: 999,
                  border: `1px solid ${t.buttonOutlined.borderColor}`,
                  color: t.buttonOutlined.color,
                  background: t.buttonOutlined.background,
                }}
              >
                {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Stack>

          <Divider sx={{ my: 2, borderColor: t.glass.divider }} />

          <Box component="form" onSubmit={onSubmit}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="dense"
              type="email"
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ opacity: 0.75 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  background: t.pill.bg,
                  border: t.pill.border,
                  backdropFilter: "blur(10px)",
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="dense"
              type="password"
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ opacity: 0.75 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  background: t.pill.bg,
                  border: t.pill.border,
                  backdropFilter: "blur(10px)",
                },
              }}
            />

            {error ? (
              <GlassPanel
                t={t}
                sx={{
                  mt: 1.6,
                  p: 1.2,
                  borderRadius: 3,
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: 13, opacity: 0.95 }}>
                  {error}
                </Typography>
              </GlassPanel>
            ) : null}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={busy}
              sx={{
                mt: 2.4,
                py: 1.2,
                borderRadius: 999,
                fontWeight: 950,
                textTransform: "none",
              }}
            >
              {busy ? "Signing in…" : "Sign in"}
            </Button>

            <Typography sx={{ opacity: 0.6, fontSize: 12, mt: 1.4, textAlign: "center" }}>
              Tip: if you were just signed out, give it a second and try again.
            </Typography>
          </Box>
        </GlassPanel>
      </Container>
    </Box>
  );
}
