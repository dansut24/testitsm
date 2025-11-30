import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  Paper,
  Tabs,
  Tab,
  TextField,
  IconButton,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import ComputerIcon from "@mui/icons-material/Computer";

import CommentSection from "../components/CommentSection";
import { getSlaDueDate, getSlaStatus } from "../../common/utils/slaUtils";
import { supabase } from "../../common/utils/supabaseClient";

const STATUS_OPTIONS = ["Open", "In Progress", "On Hold", "Resolved", "Closed"];

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [deviceName, setDeviceName] = useState("");
  const [comments, setComments] = useState([]);
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state for editable fields
  const [editStatus, setEditStatus] = useState("");
  const [editAssignee, setEditAssignee] = useState("");

  // ---- Load incident + comments ----
  useEffect(() => {
    const fetchIncidentAndComments = async () => {
      setLoading(true);
      try {
        // Incident
        const { data: incidentData, error: incidentError } = await supabase
          .from("incidents")
          .select("*")
          .eq("id", id)
          .single();

        if (incidentError) {
          console.error("Incident fetch error:", incidentError);
          setIncident(null);
        } else {
          setIncident(incidentData);
          setEditStatus(incidentData.status || "Open");
          setEditAssignee(incidentData.assignee || "");
          if (incidentData.asset_tag) {
            setDeviceName((prev) => prev || incidentData.asset_tag);
          }
        }

        // Comments (optional: table incident_comments)
        const { data: commentData, error: commentError } = await supabase
          .from("incident_comments")
          .select("*")
          .eq("incident_id", id)
          .order("created_at", { ascending: true });

        if (commentError) {
          console.warn("Comment fetch error (optional table):", commentError);
          setComments([]);
        } else {
          setComments(commentData || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentAndComments();
  }, [id]);

  const handleTabChange = (e, newValue) => setTab(newValue);

  const handleOpenViewer = () => {
    const viewerUrl = `/remote-viewer.html?device=${encodeURIComponent(
      deviceName
    )}`;
    window.open(viewerUrl, "RemoteAccess", "width=1024,height=768");
  };

  // When CommentSection creates a new comment
  const handleAddComment = async (newComment) => {
    try {
      // Allow CommentSection to pass either a string or an object
      const body =
        typeof newComment === "string" ? newComment : newComment.body || "";
      if (!body.trim()) return;

      const author =
        newComment.author ||
        JSON.parse(localStorage.getItem("user") || "null")?.email ||
        "Agent";

      const { data, error } = await supabase
        .from("incident_comments")
        .insert([
          {
            incident_id: id,
            body,
            author,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Failed to add comment:", error);
        return;
      }

      setComments((prev) => [...prev, data]);
    } catch (err) {
      console.error("Comment add error:", err);
    }
  };

  const handleSaveMeta = async () => {
    if (!incident) return;
    setSaving(true);
    try {
      const updates = {
        status: editStatus,
        assignee: editAssignee || null,
      };

      const { data, error } = await supabase
        .from("incidents")
        .update(updates)
        .eq("id", incident.id)
        .select()
        .single();

      if (error) {
        console.error("Failed to update incident:", error);
      } else {
        setIncident(data);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!incident) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Incident not found.</Typography>
      </Box>
    );
  }

  // --- SLA Handling: use column if present, fallback to utils ---
  const slaDueDateRaw =
    incident.sla_due ||
    getSlaDueDate(incident.created_at, incident.priority)?.toISOString?.() ||
    getSlaDueDate(incident.created_at, incident.priority);

  const slaDueDate = slaDueDateRaw ? new Date(slaDueDateRaw) : null;
  const slaStatus = slaDueDate ? getSlaStatus(slaDueDate) : "N/A";

  const referenceLabel = incident.reference || incident.reference_number || id;

  // Build a simple timeline (created, status, SLA, comments)
  const timelineEvents = [
    {
      type: "system",
      label: "Incident created",
      at: incident.created_at,
      extra: `Status: ${incident.status || "Open"}`,
    },
  ];

  if (slaDueDate) {
    timelineEvents.push({
      type: "sla",
      label: "SLA due",
      at: slaDueDate.toISOString(),
      extra: `SLA status: ${slaStatus}`,
    });
  }

  comments.forEach((c) => {
    timelineEvents.push({
      type: "comment",
      label: `Comment from ${c.author || "User"}`,
      at: c.created_at,
      extra: c.body?.slice(0, 120),
    });
  });

  // Sort by time ascending
  timelineEvents.sort((a, b) => new Date(a.at) - new Date(b.at));

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Button variant="outlined" size="small" onClick={() => navigate(-1)}>
        Back
      </Button>

      {/* Header */}
      <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h5">
          {incident.title || "Untitled Incident"}
        </Typography>
        <Chip
          label={incident.status}
          color={
            incident.status === "Resolved" || incident.status === "Closed"
              ? "success"
              : incident.status === "On Hold"
              ? "warning"
              : "primary"
          }
          size="small"
          sx={{ ml: 1 }}
        />
      </Box>

      <Typography variant="body2" color="text.secondary">
        Reference: {referenceLabel}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Internal ID: {id}
      </Typography>

      {/* Main details */}
      <Paper sx={{ mt: 2, p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Description
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {incident.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="body2">
              <strong>Customer:</strong>{" "}
              {incident.customer_name || "Unknown"}
            </Typography>
            <Typography variant="body2">
              <strong>Submitted by:</strong>{" "}
              {incident.submitted_by || "Unknown"}
            </Typography>
            <Typography variant="body2">
              <strong>Category:</strong> {incident.category || "-"}
            </Typography>
            <Typography variant="body2">
              <strong>Priority:</strong> {incident.priority || "-"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2">
              <strong>Created:</strong>{" "}
              {new Date(incident.created_at).toLocaleString()}
            </Typography>
            <Typography variant="body2">
              <strong>Last Updated:</strong>{" "}
              {incident.updated_at
                ? new Date(incident.updated_at).toLocaleString()
                : "-"}
            </Typography>
            <Typography variant="body2">
              <strong>SLA:</strong>{" "}
              {slaDueDate
                ? `${slaStatus} (Due: ${slaDueDate.toLocaleString()})`
                : "N/A"}
            </Typography>
          </Box>

          {/* Editable status/assignee */}
          <Box sx={{ minWidth: 200 }}>
            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              fullWidth
              label="Assignee"
              value={editAssignee}
              onChange={(e) => setEditAssignee(e.target.value)}
              sx={{ mb: 1 }}
            />

            <Button
              variant="contained"
              size="small"
              onClick={handleSaveMeta}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </Box>
        </Stack>

        {/* Device / Remote viewer */}
        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
          <TextField
            size="small"
            label="Asset Tag / Device Name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            sx={{ mr: 2, maxWidth: 280 }}
          />
          <IconButton
            color="primary"
            onClick={handleOpenViewer}
            disabled={!deviceName.trim()}
            title="Connect to Device"
          >
            <ComputerIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Tabs */}
      <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 3 }}>
        <Tab label="Timeline" />
        <Tab label={`Comments (${comments.length})`} />
        <Tab label="Attachments" />
        <Tab label="Actions" />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {tab === 0 && (
          <Box>
            {timelineEvents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No activity recorded yet.
              </Typography>
            ) : (
              timelineEvents.map((ev, idx) => (
                <Box key={idx} sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(ev.at).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{ev.label}</strong>
                  </Typography>
                  {ev.extra && (
                    <Typography variant="body2" color="text.secondary">
                      {ev.extra}
                      {ev.type === "comment" && ev.extra?.length === 120
                        ? "..."
                        : ""}
                    </Typography>
                  )}
                </Box>
              ))
            )}
          </Box>
        )}

        {tab === 1 && (
          <CommentSection comments={comments} onAddComment={handleAddComment} />
        )}

        {tab === 2 && (
          <Typography variant="body2" color="text.secondary">
            [Attachments go here]
          </Typography>
        )}

        {tab === 3 && (
          <Typography variant="body2" color="text.secondary">
            [Actions go here]
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default IncidentDetail;
