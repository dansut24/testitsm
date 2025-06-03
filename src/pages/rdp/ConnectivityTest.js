// src/pages/ConnectivityTest.js
import React, { useEffect, useState } from 'react';

const ConnectivityTest = () => {
  const [log, setLog] = useState([]);
  const [relayFound, setRelayFound] = useState(false);

  const logMessage = (msg) => {
    console.log(msg);
    setLog((prev) => [...prev, msg]);
  };

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'turn:flyturnserver.fly.dev:3478',
          username: 'user',
          credential: 'pass'
        }
      ],
      iceTransportPolicy: 'relay'
    });

    logMessage('[Test] Created RTCPeerConnection');

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const c = event.candidate;
        logMessage(`[ICE] Candidate: ${c.candidate}`);
        if (c.candidate.includes('typ relay')) {
          logMessage('[✔] TURN relay candidate found ✅');
          setRelayFound(true);
        }
      } else {
        logMessage('[ICE] ICE Gathering Complete');
        if (!relayFound) {
          logMessage('[❌] No TURN relay candidate found');
        }
      }
    };

    pc.createDataChannel('test');
    pc.createOffer().then((offer) => pc.setLocalDescription(offer));

    return () => pc.close();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', color: '#fff', background: '#111', minHeight: '100vh' }}>
      <h2>WebRTC TURN Connectivity Test</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        {log.map((l, idx) => <div key={idx}>{l}</div>)}
      </pre>
    </div>
  );
};

export default ConnectivityTest;
