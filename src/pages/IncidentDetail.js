import React from "react";
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
} from "@mui/material";
import ComputerIcon from "@mui/icons-material/Computer";
import CommentSection from "../components/CommentSection";

const dummyIncident = {
  id: 1,
  title: "Printer not working",
  description: "The office printer is jammed and not responding.",
  status: "In Progress",
  priority: "High",
  assignee: "John Doe",
  createdAt: "2024-05-01",
  updatedAt: "2024-05-03",
};

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState(0);
  const [deviceName, setDeviceName] = React.useState("");
  const [comments, setComments] = React.useState([]); // ✅ State for comments

  const handleTabChange = (e, newValue) => setTab(newValue);

  const handleOpenViewer = () => {
    const viewerUrl = `/remote-viewer.html?device=${encodeURIComponent(deviceName)}`;
    window.open(viewerUrl, "RemoteAccess", "width=1024,height=768");
  };

  const handleAddComment = (newComment) => {
    setComments((prev) => [...prev, newComment]);
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Button variant="outlined" size="small" onClick={() => navigate(-1)}>
        Back
      </Button>

      <Typography variant="h5" sx={{ mt: 2 }}>
        {dummyIncident.title} <Chip label={dummyIncident.status} color="primary" sx={{ ml: 2 }} />
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Incident ID: #{id}
      </Typography>

      <Paper sx={{ mt: 2, p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Description
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {dummyIncident.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2">
          <strong>Priority:</strong> {dummyIncident.priority}
        </Typography>
        <Typography variant="body2">
          <strong>Assignee:</strong> {dummyIncident.assignee}
        </Typography>
        <Typography variant="body2">
          <strong>Created:</strong> {dummyIncident.createdAt}
        </Typography>
        <Typography variant="body2">
          <strong>Last Updated:</strong> {dummyIncident.updatedAt}
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
