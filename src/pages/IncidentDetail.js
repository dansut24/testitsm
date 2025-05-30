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
} from "@mui/material";
import ComputerIcon from "@mui/icons-material/Computer";
import CommentSection from "../components/CommentSection";
import { getSlaDueDate, getSlaStatus } from "../utils/slaUtils";
import supabase from "../supabaseClient";

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [deviceName, setDeviceName] = useState("");
  const [comments, setComments] = useState([]);
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncident = async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setIncident(data);
      setLoading(false);
    };

    fetchIncident();
  }, [id]);

  const handleTabChange = (e, newValue) => setTab(newValue);

  const handleOpenViewer = () => {
    const viewerUrl = `/remote-viewer.html?device=${encodeURIComponent(deviceName)}`;
    window.open(viewerUrl, "RemoteAccess", "width=1024,height=768");
  };

  const handleAddComment = (newComment) => {
    setComments((prev) => [...prev, newComment]);
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

  const slaDueDate = getSlaDueDate(incident.created_at, incident.priority);
  const slaStatus = getSlaStatus(slaDueDate);

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Button variant="outlined" size="small" onClick={() => navigate(-1)}>
        Back
      </Button>

      <Typography variant="h5" sx={{ mt: 2 }}>
        {incident.title} <Chip label={incident.status} color="primary" sx={{ ml: 2 }} />
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Incident ID: #{id}
      </Typography>

      <Paper sx={{ mt: 2, p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Description
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {incident.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2">
          <strong>Priority:</strong> {incident.priority}
        </Typography>
        <Typography variant="body2">
          <strong>Assignee:</strong> {incident.assignee || "-"}
        </Typography>
        <Typography variant="body2">
          <strong>Created:</strong> {new Date(incident.created_at).toLocaleString()}
        </Typography>
        <Typography variant="body2">
          <strong>Last Updated:</strong> {new Date(incident.updated_at).toLocaleString()}
        </Typography>
        <Typography variant="body2">
          <strong>SLA:</strong> {slaStatus} (Due: {new Date(slaDueDate).toLocaleString()})
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <TextField
            size="small"
            label="Asset Tag / Device Name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            sx={{ mr: 2 }}
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

      <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 3 }}>
        <Tab label="Timeline" />
        <Tab label="Comments" />
        <Tab label="Attachments" />
        <Tab label="Actions" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tab === 0 && <Typography variant="body2">[Timeline goes here]</Typography>}
        {tab === 1 && (
          <CommentSection comments={comments} onAddComment={handleAddComment} />
        )}
        {tab === 2 && <Typography variant="body2">[Attachments go here]</Typography>}
        {tab === 3 && <Typography variant="body2">[Actions go here]</Typography>}
      </Box>
    </Box>
  );
};

export default IncidentDetail;
