// src/pages/tools/ConnectivityTest.js
import React, { useEffect, useState } from "react";

const ConnectivityTest = () => {
  const [logs, setLogs] = useState(["Running test..."]);
  const appendLog = (msg) => setLogs((prev) => [...prev, msg]);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "turn:flyturnserver.fly.dev:3478",
          username: "user",
          credential: "pass",
        },
      ],
      iceTransportPolicy: "relay",
    });

    let turnFound = false;

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        if (turnFound) {
          appendLog("✅ TURN candidate found — connectivity should work over the internet.");
        } else {
          appendLog("❌ No TURN candidate found — TURN might be unreachable.");
        }
        return;
      }

      const cand = event.candidate.candidate;
      appendLog(`ICE candidate: ${cand}`);
      if (cand.includes("typ relay")) {
        turnFound = true;
        appendLog("🔁 Relay (TURN) candidate detected.");
      }
    };

    pc.oniceconnectionstatechange = () => {
      appendLog(`ICE connection state: ${pc.iceConnectionState}`);
    };

    pc.createDataChannel("test");
    pc.createOffer().then((offer) => pc.setLocalDescription(offer));
  }, []);

  return (
    <div style={{ background: "#111", color: "#0f0", padding: "1rem", fontFamily: "monospace" }}>
      <h2>WebRTC TURN Connectivity Test</h2>
      <pre>{logs.join("\n")}</pre>
    </div>
  );
};

export default ConnectivityTest;
