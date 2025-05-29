// src/pages/IncidentDetail.js

import React, { useState } from "react";
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent
} from "@mui/material";
import ComputerIcon from "@mui/icons-material/Computer";

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

const RemoteViewer = () => {
  const [videoRef] = useState(React.createRef());

  React.useEffect(() => {
    const viewerId = `viewer_${Math.random().toString(36).substring(2, 15)}`;
    const socket = new WebSocket("wss://webrtc-signaling-server.fly.dev/ws");

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "register", role: "viewer", id: viewerId }));
      const offerHandler = async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.send(
          JSON.stringify({
            type: "offer",
            to: "agent01",
            from: viewerId,
            sdp: offer.sdp,
          })
        );
      };
      offerHandler();
    };

    socket.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "answer") {
        await pc.setRemoteDescription({ type: "answer", sdp: msg.sdp });
      } else if (msg.type === "candidate") {
        await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "candidate",
            to: "agent01",
            from: viewerId,
            candidate: event.candidate,
          })
        );
      }
    };
  }, [videoRef]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      controls={false}
      style={{ width: "100%", height: "100%", background: "black" }}
    />
  );
};

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [openViewer, setOpenViewer] = useState(false);

  const handleTabChange = (e, newValue) => setTab(newValue);

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Button variant="outlined" size="small" onClick={() => navigate(-1)}>
        Back
      </Button>

      <Typography variant="h5" sx={{ mt: 2 }}>
        {dummyIncident.title} <Chip label={dummyIncident.status} color="primary" sx={{ ml: 2 }} />
        <IconButton color="primary" onClick={() => setOpenViewer(true)} sx={{ ml: 2 }}>
          <ComputerIcon />
        </IconButton>
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
      </Paper>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 3 }}>
        <Tab label="Timeline" />
        <Tab label="Comments" />
        <Tab label="Attachments" />
        <Tab label="Actions" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tab === 0 && <Typography variant="body2">[Timeline goes here]</Typography>}
        {tab === 1 && <Typography variant="body2">[Comments go here]</Typography>}
        {tab === 2 && <Typography variant="body2">[Attachments go here]</Typography>}
        {tab === 3 && <Typography variant="body2">[Actions go here]</Typography>}
      </Box>

      <Dialog open={openViewer} onClose={() => setOpenViewer(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Remote Access - agent01</DialogTitle>
        <DialogContent>
          <Box sx={{ height: "70vh" }}>
            <RemoteViewer />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default IncidentDetail;
