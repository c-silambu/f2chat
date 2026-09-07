import { useState, useEffect, useRef, useCallback } from 'react';
import { getIceServers } from '../utils/iceServers.js';

export const useWebRTC = (socket, currentRoom, localStream) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState('new'); // 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed'
  
  const peerConnectionRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const hasOfferedRef = useRef(false);

  // Cleanly close and destroy the peer connection
  const cleanupPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.oniceconnectionstatechange = null;
      try {
        peerConnectionRef.current.close();
      } catch (e) {
        // ignore
      }
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    setConnectionState('new');
    pendingCandidatesRef.current = [];
    hasOfferedRef.current = false;
  }, []);

  useEffect(() => {
    if (!socket || !currentRoom || !localStream) {
      cleanupPeerConnection();
      return;
    }

    const { roomId, isInitiator } = currentRoom;
    console.log(`[WebRTC] Initializing connection for room ${roomId} (isInitiator: ${isInitiator})`);
    hasOfferedRef.current = false;

    const configuration = getIceServers();
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    // 1. Add local media tracks to peer connection
    localStream.getTracks().forEach((track) => {
      try {
        pc.addTrack(track, localStream);
      } catch (e) {
        console.warn('[WebRTC] Track add error:', e);
      }
    });

    // 2. Receive remote stream
    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote stream track:', event.track.kind);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else if (event.track) {
        const stream = new MediaStream([event.track]);
        setRemoteStream(stream);
      }
    };

    // 3. ICE Candidate gathering
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', {
          roomId,
          candidate: event.candidate
        });
      }
    };

    // Helper: Flush pending candidates safely
    const processPendingCandidates = async () => {
      while (pendingCandidatesRef.current.length > 0) {
        const cand = pendingCandidatesRef.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (err) {
          console.warn('[WebRTC] Error adding pending ICE candidate:', err);
        }
      }
    };

    // 4. Track connection state
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state changed:', pc.connectionState);
      setConnectionState(pc.connectionState);
      if (pc.connectionState === 'failed') {
        console.warn('[WebRTC] Connection failed, attempting ICE restart...');
        try {
          pc.restartIce();
        } catch (e) {
          // ignore
        }
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setConnectionState('connected');
      } else if (pc.iceConnectionState === 'failed') {
        setConnectionState('failed');
      }
    };

    // 5. Offer initiation routine
    const initiateOffer = async () => {
      if (hasOfferedRef.current || pc.signalingState === 'closed') return;
      try {
        hasOfferedRef.current = true;
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await pc.setLocalDescription(offer);
        socket.emit('offer', {
          roomId,
          sdp: pc.localDescription
        });
        console.log('[WebRTC] Offer sent to room', roomId);
      } catch (err) {
        console.error('[WebRTC] Error creating offer:', err);
        hasOfferedRef.current = false;
      }
    };

    // Notify room that peer is ready
    socket.emit('peer_ready', { roomId });

    // If initiator, wait a small tick (100ms) or peer_ready to ensure both sockets are joined
    if (isInitiator) {
      const offerTimeout = setTimeout(() => {
        initiateOffer();
      }, 150);

      // Also listen if peer announces readiness first
      socket.on('peer_ready', (data) => {
        if (data.roomId === roomId && !hasOfferedRef.current) {
          initiateOffer();
        }
      });

      return () => {
        clearTimeout(offerTimeout);
        socket.off('peer_ready');
        socket.off('offer');
        socket.off('answer');
        socket.off('ice_candidate');
        cleanupPeerConnection();
      };
    }

    // 6. Signalling Event Handlers
    const handleOffer = async (data) => {
      if (data.roomId !== roomId || isInitiator || pc.signalingState === 'closed') return;
      try {
        console.log('[WebRTC] Received offer, setting remote desc & creating answer...');
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        await processPendingCandidates();

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer', {
          roomId,
          sdp: pc.localDescription
        });
        console.log('[WebRTC] Answer sent for room', roomId);
      } catch (err) {
        console.error('[WebRTC] Error handling offer:', err);
      }
    };

    const handleAnswer = async (data) => {
      if (data.roomId !== roomId || pc.signalingState === 'closed') return;
      try {
        console.log('[WebRTC] Received answer, setting remote description...');
        if (pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          await processPendingCandidates();
        }
      } catch (err) {
        console.error('[WebRTC] Error handling answer:', err);
      }
    };

    const handleIceCandidate = async (data) => {
      if (data.roomId !== roomId || !data.candidate || pc.signalingState === 'closed') return;
      try {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          pendingCandidatesRef.current.push(data.candidate);
        }
      } catch (err) {
        console.error('[WebRTC] Error adding ICE candidate:', err);
      }
    };

    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice_candidate', handleIceCandidate);

    return () => {
      socket.off('peer_ready');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice_candidate');
      cleanupPeerConnection();
    };
  }, [socket, currentRoom, localStream, cleanupPeerConnection]);

  return {
    remoteStream,
    connectionState,
    peerConnection: peerConnectionRef.current
  };
};
