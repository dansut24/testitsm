import React, { useEffect, useRef, useState } from "react";

const Viewer = () => {
  const videoRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const addLog = (msg) => setLogs((prev) => [...prev, msg]);

  useEffect(() => {
    const tenantId = "tenant123";
    const video = videoRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "turn:relay1.expressturn.com:3480?transport=udp",
            "turn:relay1.expressturn.com:3480?transport=tcp",
          ],
          username: "000000002064281179",
          credential: "RzKsDze1P7nN",
        },
      ],
      iceTransportPolicy: "relay", // Force TURN only
    });

    addLog("[Test] Created RTCPeerConnection");

    let turnSucceeded = false;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addLog(`[ICE] Candidate: ${event.candidate.candidate}`);
        if (event.candidate.candidate.includes("relay")) {
          turnSucceeded = true;
        }
      } else {
        addLog("[ICE] ICE Gathering Complete");
        if (turnSucceeded) {
          addLog("✅ TURN relay candidate found — TURN is working!");
        } else {
          addLog("❌ No TURN relay candidate found — TURN might be unreachable.");
        }
        pc.close();
      }
    };

    pc.createDataChannel("test");
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch((err) => addLog(`[Error] Failed to create offer: ${err.message}`));

    return () => {
      pc.close();
    };
  }, []);

  return (
    <div style={{ height: "100vh", backgroundColor: "#111", color: "#0f0", padding: 16 }}>
      <h2>WebRTC TURN Connectivity Test</h2>
      <pre style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>
        {logs.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </pre>
      <video ref={videoRef} autoPlay playsInline muted style={{ display: "none" }} />
    </div>
  );
};

export default Viewer;
