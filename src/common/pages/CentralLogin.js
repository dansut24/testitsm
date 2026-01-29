// src/common/pages/CentralLogin.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  Divider,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

import { useHi5Theme } from "../ui/hi5Theme";
import GlassPanel from "../ui/GlassPanel";
import ThemeToggleIconButton from "../ui/ThemeToggleIconButton";

function getDefaultAfterLogin() {
  const host = window.location.hostname || "";
  if (
    !host.includes("-control.") &&
    !host.includes("-itsm.") &&
    !host.includes("-self.")
  ) {
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

// ✅ Prevent redirect loops / unsafe redirects
function sanitizeRedirect(raw, fallback) {
  let r = raw || fallback || "/";

  // If someone passes a full URL, only accept same-origin and convert to path
  if (/^https?:\/\//i.test(r)) {
    try {
      const u = new URL(r);
      if (u.origin === window.location.origin) {
        r = `${u.pathname}${u.search}${u.hash}`;
      } else {
        r = fallback || "/";
      }
    } catch {
      r = fallback || "/";
    }
  }

  // Must be an in-app path
  if (!r.startsWith("/")) r = fallback || "/";

  // Never redirect back to login (common loop cause)
  if (r.startsWith("/login")) r = fallback || "/";

  return r;
}

export default function CentralLogin({ title, afterLogin }) {
  const location = useLocation();
  const { mode, tokens: t, toggleMode } = useHi5Theme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const computedAfterLogin = useMemo(
    () => afterLogin || getDefaultAfterLogin(),
    [afterLogin]
  );

  const computedTitle = useMemo(() => title || getDefaultTitle(), [title]);

  const rawRedirect =
    new URLSearchParams(location.search).get("redirect") || computedAfterLogin;

  const redirect = useMemo(
    () => sanitizeRedirect(rawRedirect, computedAfterLogin),
    [rawRedirect, computedAfterLogin]
  );

  // If already signed in, bounce
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

      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        setError("Signed in, but session was not created. Please try again.");
        return;
      }

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
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Stack spacing={0.6} sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 950, fontSize: 22 }} noWrap>
                {computedTitle}
              </Typography>
              <Typography sx={{ opacity: 0.72, fontSize: 13 }} noWrap>
                Use your Hi5Tech account to continue.
              </Typography>
            </Stack>

            <ThemeToggleIconButton mode={mode} onToggle={toggleMode} t={t} />
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
              <GlassPanel t={t} sx={{ mt: 1.6, p: 1.2, borderRadius: 3 }}>
                <Typography
                  sx={{ fontWeight: 900, fontSize: 13, opacity: 0.95 }}
                >
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
          </Box>
        </GlassPanel>
      </Container>
    </Box>
  );
}
