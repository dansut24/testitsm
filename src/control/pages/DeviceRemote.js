// src/control/pages/DeviceRemote.js
import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Typography, Alert, Stack } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

// Use whatever your control portal already uses for API base.
// If you already have a config file, use that instead.
const API_BASE =
  process.env.REACT_APP_RMM_API_BASE ||
  "https://rmm.hi5tech.co.uk";

// Update this when you publish the installer
const VIEWER_DOWNLOAD_URL =
  process.env.REACT_APP_VIEWER_DOWNLOAD_URL ||
  "https://github.com/<your-org-or-user>/<repo>/releases/latest"; // TODO

export default function DeviceRemote() {
  const { deviceId } = useParams();
  const navigate = useNavigate();

  const [launching, setLaunching] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const canLaunch = useMemo(() => !!deviceId && !launching, [deviceId, launching]);

  useEffect(() => {
    setErr("");
    setInfo("");
  }, [deviceId]);

  async function startDesktopSession() {
    if (!deviceId) return;

    setLaunching(true);
    setErr("");
    setInfo("Requesting viewer launch…");

    try {
      const res = await fetch(`${API_BASE}/api/viewer_session/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // If your portal already has auth headers/cookies, they’ll go along automatically.
          // If you use JWT headers, we’ll add them once you show how auth is done in this portal.
        },
        body: JSON.stringify({ device_id: deviceId }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t || "Failed to start viewer session"}`);
      }

      const data = await res.json();
      const launchUrl = data && data.launch_url;

      if (!launchUrl || typeof launchUrl !== "string") {
        throw new Error("Server did not return launch_url");
      }

      setInfo("Launching desktop viewer…");

      // Attempt to open the installed app
      window.location.href = launchUrl;

      // Fallback hint (cannot reliably detect install from browser)
      setTimeout(() => {
        setInfo(
          "If nothing opened, the Viewer may not be installed. Use the Download button below."
        );
      }, 1500);
    } catch (e) {
      setErr(e.message || "Failed to launch viewer");
      setInfo("");
    } finally {
      setLaunching(false);
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="h6">Remote Session</Typography>
      </Stack>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            Device ID
          </Typography>
          <Typography sx={{ mb: 2, fontFamily: "monospace" }}>{deviceId}</Typography>

          {err ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {err}
            </Alert>
          ) : null}

          {info ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              {info}
            </Alert>
          ) : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="contained"
              onClick={startDesktopSession}
              disabled={!canLaunch}
            >
              {launching ? "Launching…" : "Start Session (Desktop Viewer)"}
            </Button>

            <Button
              variant="outlined"
              component="a"
              href={VIEWER_DOWNLOAD_URL}
              target="_blank"
              rel="noreferrer"
            >
              Download Viewer
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Tip: Install the Viewer once, then you can launch remote sessions from the portal with one click.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
