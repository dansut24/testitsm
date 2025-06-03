import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

const Viewer = () => {
  const { tenantId } = useParams();
  const videoRef = useRef(null);
  const logRef = useRef(null);
  const [logs, setLogs] = useState([]);

  const log = (msg) => {
    setLogs((prev) => [...prev, msg]);
    console.log(msg);
  };

  useEffect(() => {
    const video = videoRef.current;
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "turn:flyturnserver.fly.dev:3478",
          username: "user",
          credential: "pass",
        },
      ],
      iceTransportPolicy: "all",
    });

    const ws = new WebSocket("wss://webrtc-signaling-server-old-silence-5681.fly.dev");

    ws.onopen = () => {
      log("[Viewer] WebSocket connected");
      ws.send(JSON.stringify({ type: "register", role: "viewer", tenant: tenantId }));
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      log(`[Viewer] Message: ${data.type}`);

      if (data.type === "offer") {
        if (!data.sdp || !data.sdp.type || !data.sdp.sdp) {
          log("[Viewer] Invalid offer format");
          return;
        }

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: "answer", sdp: pc.localDescription, tenant: tenantId }));
          log("[Viewer] Sent SDP answer");
        } catch (err) {
          log("[Viewer] Error handling offer: " + err);
        }
      } else if (data.type === "ice") {
        try {
          await pc.addIceCandidate(data.candidate);
          log("[Viewer] ICE candidate added");
        } catch (err) {
          log("[Viewer] Failed to add ICE candidate: " + err);
        }
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(JSON.stringify({ type: "ice", candidate: event.candidate, tenant: tenantId }));
        log("[Viewer] Sent ICE candidate");
      }
    };

    pc.oniceconnectionstatechange = () => {
      log("[ICE] State changed to: " + pc.iceConnectionState);
    };

    pc.ontrack = (event) => {
      if (video.srcObject !== event.streams[0]) {
        video.srcObject = event.streams[0];
        log("[Viewer] Remote stream attached");
      }
    };

    return () => {
      ws.close();
      pc.close();
      log("[Viewer] Cleanup on unmount");
    };
  }, [tenantId]);

  return (
    <div style={{ position: "relative", height: "100vh", background: "#000" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100vw", height: "100vh", objectFit: "contain" }}
      />
      <div
        ref={logRef}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "rgba(0,0,0,0.7)",
          color: "#0f0",
          fontSize: "12px",
          padding: "8px",
          maxHeight: "50vh",
          overflowY: "auto",
          width: "40vw",
          borderRadius: "4px",
        }}
      >
        <strong>Logs:</strong>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {logs.map((line, index) => (
            <li key={index} style={{ listStyle: "none" }}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Viewer;
