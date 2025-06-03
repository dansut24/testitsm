import React, { useEffect, useRef } from 'react';

const Viewer = ({ tenantId = 'tenant123' }) => {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const pcRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    // WebSocket signaling connection
    const ws = new WebSocket('wss://webrtc-signaling-server-old-silence-5681.fly.dev');
    wsRef.current = ws;

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'turn:flyturnserver.fly.dev:3478',
          username: 'user',
          credential: 'pass',
        },
      ],
      iceTransportPolicy: 'relay',
    });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(JSON.stringify({ type: 'ice', candidate: event.candidate, tenantId }));
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[ICE] Connection state:', pc.iceConnectionState);
    };

    pc.ontrack = (event) => {
      if (video.srcObject !== event.streams[0]) {
        video.srcObject = event.streams[0];
        console.log('[Viewer] Stream attached');
      }
    };

    ws.onopen = () => {
      console.log('[Viewer] WebSocket connected');
      ws.send(JSON.stringify({ type: 'register', role: 'viewer', tenant: tenantId }));
    };

    ws.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      console.log('[Viewer] Message received:', data);

      if (data.type === 'offer') {
        const offer = data.sdp || data.offer;
        if (!offer || !offer.sdp || !offer.type) {
          console.error('[Viewer] Invalid offer:', offer);
          return;
        }

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: 'answer', answer: pc.localDescription, tenantId }));
        } catch (err) {
          console.error('[Viewer] Error processing offer:', err);
        }
      } else if (data.type === 'ice') {
        try {
          await pc.addIceCandidate(data.candidate);
        } catch (err) {
          console.error('[Viewer] Failed to add ICE:', err);
        }
      }
    };

    return () => {
      pc.close();
      ws.close();
    };
  }, [tenantId]);

  return (
    <div style={{ backgroundColor: '#111', height: '100vh', width: '100vw' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'black' }}
      />
    </div>
  );
};

export default Viewer;
