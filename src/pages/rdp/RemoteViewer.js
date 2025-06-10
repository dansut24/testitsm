import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, LinearProgress } from "@mui/material";

const SIGNALING_SERVER = "wss://ws.hi5tech.co.uk";
const VIEWER_ID = "viewer-" + Math.random().toString(36).substr(2, 8);

export default function RemoteViewer({ tenantId }) {
  const { agentId } = useParams();
  const videoRef = useRef(null);
  const pcRef = useRef(new RTCPeerConnection());
  const [status, setStatus] = useState("Initialising...");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(SIGNALING_SERVER);
    setSocket(ws);

    ws.onopen = () => {
      setStatus("Connected to signaling server");
      ws.send(JSON.stringify({
        type: "viewer-join",
        viewerId: VIEWER_ID,
        agentId,
        tenantId,
      }));
    };

    ws.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      if (data.type === "offer") {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: "answer", agentId, viewerId: VIEWER_ID, answer }));
      }
      if (data.type === "ice-candidate") {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error("Error adding ICE candidate", err);
        }
      }
    };

    pcRef.current.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
        setStatus("Streaming...");
      }
    };

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.send(JSON.stringify({
          type: "ice-candidate",
          candidate: event.candidate,
          agentId,
          viewerId: VIEWER_ID,
        }));
      }
    };

    return () => {
      pcRef.current.close();
      ws.close();
    };
  }, [agentId, tenantId]);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#000" }}>
      <Box sx={{ p: 2, backgroundColor: "#111", color: "#fff", display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">Remote Session: {agentId}</Typography>
        <Typography variant="body2" sx={{ color: "lightgreen" }}>{status}</Typography>
      </Box>
      {status !== "Streaming..." && <LinearProgress />}
      <Box sx={{ flexGrow: 1 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "100%", height: "100%", objectFit: "contain", backgroundColor: "#000" }}
        />
      </Box>
    </Box>
  );
}
