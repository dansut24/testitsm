import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LaunchIcon from "@mui/icons-material/Launch";
import InsightsIcon from "@mui/icons-material/Insights";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_RMM_API_BASE || "https://rmm.hi5tech.co.uk";

function fmtTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function Devices() {
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | online | offline

  async function loadDevices() {
    setLoading(true);
    setErr("");

    try {
      const res = await fetch(`${API_BASE}/api/devices`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Failed to load devices (HTTP ${res.status}): ${t || "no body"}`);
      }

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid devices response");
      setDevices(data);
    } catch (e) {
      setErr(e?.message || "Failed to load devices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDevices();
    // optional: auto-refresh every 10s
    const t = setInterval(loadDevices, 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    let online = 0;
    let offline = 0;
    for (const d of devices) {
      if (d?.online) online++;
      else offline++;
    }
    return { online, offline, total: devices.length };
  }, [devices]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return devices
      .filter((d) => {
        if (filter === "online") return !!d.online;
        if (filter === "offline") return !d.online;
        return true;
      })
      .filter((d) => {
        if (!needle) return true;
        const hay = [
          d.device_id,
          d.hostname,
          d.os,
          d.arch,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      })
      .sort((a, b) => {
        // online first, then hostname
        const ao = a.online ? 1 : 0;
        const bo = b.online ? 1 : 0;
        if (ao !== bo) return bo - ao;
        return (a.hostname || "").localeCompare(b.hostname || "");
      });
  }, [devices, q, filter]);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Devices
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Online/offline inventory from your connected agents
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={`Online: ${counts.online}`}
            color="success"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`Offline: ${counts.offline}`}
            color="default"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Button variant="outlined" onClick={loadDevices} disabled={loading}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <TextField
              fullWidth
              value={q}
              onChange={(e) => setQ(e.target.value)}
              label="Search devices"
              placeholder="Search by hostname, device id, OS…"
              size="small"
            />

            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={(_, v) => v && setFilter(v)}
              size="small"
            >
              <ToggleButton value="all">All ({counts.total})</ToggleButton>
              <ToggleButton value="online">Online ({counts.online})</ToggleButton>
              <ToggleButton value="offline">Offline ({counts.offline})</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {err ? (
            <Box sx={{ mt: 2 }}>
              <Typography color="error" variant="body2">
                {err}
              </Typography>
            </Box>
          ) : null}
        </Box>

        <Divider />

        <TableContainer sx={{ maxHeight: "calc(100vh - 260px)" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Hostname</TableCell>
                <TableCell>Device ID</TableCell>
                <TableCell>OS</TableCell>
                <TableCell>Arch</TableCell>
                <TableCell>Last Seen</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <CircularProgress size={18} />
                      <Typography variant="body2">Loading devices…</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography variant="body2" color="text.secondary">
                      No devices match your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}

              {filtered.map((d) => {
                const online = !!d.online;
                const statusChip = online ? (
                  <Chip size="small" label="Online" color="success" />
                ) : (
                  <Chip size="small" label="Offline" variant="outlined" />
                );

                return (
                  <TableRow key={d.device_id} hover>
                    <TableCell>{statusChip}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{d.hostname || "-"}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>{d.device_id}</TableCell>
                    <TableCell>{d.os || "-"}</TableCell>
                    <TableCell>{d.arch || "-"}</TableCell>
                    <TableCell>{fmtTime(d.last_seen_at)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Copy Device ID">
                          <IconButton size="small" onClick={() => copy(d.device_id)}>
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="View metrics (coming next)">
                          <span>
                            <IconButton size="small" disabled>
                              <InsightsIcon fontSize="inherit" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={online ? "Remote session" : "Device offline"}>
                          <span>
                            <Button
                              size="small"
                              variant="contained"
                              endIcon={<LaunchIcon />}
                              disabled={!online}
                              onClick={() => navigate(`/devices/${d.device_id}/remote`)}
                            >
                              Remote
                            </Button>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
        API: {API_BASE}
      </Typography>
    </Box>
  );
}
