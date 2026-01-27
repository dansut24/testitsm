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

/**
 * CentralLogin
 * - Works on ANY host, but is intended to be used on tenant root:
 *     demoitsm.hi5tech.co.uk/login
 * - Reads ?redirect=/itsm (or /control, /self-service, etc.)
 * - IMPORTANT: If redirect points to a MODULE PATH (/itsm, /control, /self-service),
 *   we go to absolute URL for that module host (demoitsm-itsm, demoitsm-control, demoitsm-self)
 * - Otherwise we navigate within the current host.
 */

function getParentDomain() {
  const host = window.location.hostname || "";
  return host.split(".").slice(1).join(".");
}

function stripModuleSuffixFromTenantBase(firstLabel) {
  return String(firstLabel || "").replace(/-(control|itsm|self)$/i, "");
}

function getTenantBase() {
  const host = window.location.hostname || "";
  const first = host.split(".")[0] || "";
  return stripModuleSuffixFromTenantBase(first);
}

function buildModuleBaseUrl(moduleKey) {
  const tenantBase = getTenantBase();
  const parent = getParentDomain();

  const sub =
    moduleKey === "itsm"
      ? `${tenantBase}-itsm`
      : moduleKey === "control"
      ? `${tenantBase}-control`
      : `${tenantBase}-self`;

  return `https://${sub}.${parent}`;
}

function normalizeRedirect(raw) {
  const r = String(raw || "").trim();
  if (!r) return "/";
  // allow "/itsm" "/control" "/self-service" "/dashboard" etc.
  if (r.startsWith("/")) return r;
  return `/${r}`;
}

function isModuleRedirect(pathname) {
  const p = String(pathname || "").toLowerCase();
  return p === "/itsm" || p.startsWith("/itsm/") || p === "/control" || p.startsWith("/control/") || p === "/self-service" || p.startsWith("/self-service/");
}

function moduleFromRedirect(pathname) {
  const p = String(pathname || "").toLowerCase();
  if (p === "/control" || p.startsWith("/control/")) return "control";
  if (p === "/self-service" || p.startsWith("/self-service/")) return "self";
  // default
  return "itsm";
}

function rewritePathForModule(moduleKey, pathname) {
  // If redirect is "/itsm" or "/itsm/xyz" => module host expects "/" or "/xyz"
  // If redirect is "/control" or "/control/xyz" => module host expects "/" or "/xyz"
  // If redirect is "/self-service" or "/self-service/xyz" => module host expects "/" or "/xyz"
  const p = normalizeRedirect(pathname);
  const lower = p.toLowerCase();

  if (moduleKey === "itsm" && (lower === "/itsm" || lower.startsWith("/itsm/"))) {
    return lower === "/itsm" ? "/" : p.slice("/itsm".length) || "/";
  }
  if (moduleKey === "control" && (lower === "/control" || lower.startsWith("/control/"))) {
    return lower === "/control" ? "/" : p.slice("/control".length) || "/";
  }
  if (moduleKey === "self" && (lower === "/self-service" || lower.startsWith("/self-service/"))) {
    return lower === "/self-service" ? "/" : p.slice("/self-service".length) || "/";
  }

  return "/";
}

function getDefaultTitleForCentral() {
  return "Sign in";
}

export default function CentralLogin({ title, afterLogin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const computedTitle = useMemo(() => title || getDefaultTitleForCentral(), [title]);

  // Default landing after login on CENTRAL host should be root "/"
  // (PortalApp will then decide to show module chooser or auto-redirect)
  const computedAfterLogin = useMemo(() => afterLogin || "/", [afterLogin]);

  const redirect = useMemo(() => {
    const qs = new URLSearchParams(location.search);
    return normalizeRedirect(qs.get("redirect") || computedAfterLogin);
  }, [location.search, computedAfterLogin]);

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

      // If the redirect targets a module, send user to the module HOST (absolute URL)
      if (isModuleRedirect(redirect)) {
        const moduleKey = moduleFromRedirect(redirect);
        const base = buildModuleBaseUrl(moduleKey);
        const path = rewritePathForModule(moduleKey, redirect);
        window.location.href = `${base}${path}`;
        return;
      }

      // Otherwise, route within current app
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
        </Paper>
      </Container>
    </Box>
  );
}
