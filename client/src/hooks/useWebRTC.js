import { useState, useEffect, useRef, useCallback } from 'react';
import { getIceServers } from '../utils/iceServers.js';

export const useWebRTC = (socket, currentRoom, localStream) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState('new'); // 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed'
  
  const peerConnectionRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  // Cleanly close and destroy the peer connection
  const cleanupPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.oniceconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    setConnectionState('new');
    pendingCandidatesRef.current = [];
  }, []);

  useEffect(() => {
    if (!socket || !currentRoom || !localStream) {
      cleanupPeerConnection();
      return;
    }

    const { roomId, isInitiator } = currentRoom;
    console.log(`[WebRTC] Initializing connection for room ${roomId} (isInitiator: ${isInitiator})`);

    const configuration = getIceServers();
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    // 1. Add local media tracks to peer connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // 2. Receive remote stream
    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote stream track:', event.track.kind);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
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

    // 4. Track connection state
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state changed:', pc.connectionState);
      setConnectionState(pc.connectionState);
      if (pc.connectionState === 'failed') {
        console.warn('[WebRTC] Connection failed, attempting ICE restart...');
        pc.restartIce();
      }
    };

    // 5. If initiator, create and send Offer
    const initiateOffer = async () => {
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await pc.setLocalDescription(offer);
        socket.emit('offer', {
          roomId,
          sdp: pc.localDescription
        });
      } catch (err) {
        console.error('[WebRTC] Error creating offer:', err);
      }
    };

    if (isInitiator) {
      initiateOffer();
    }

    // 6. Signalling Event Handlers
    const handleOffer = async (data) => {
      if (data.roomId !== roomId || isInitiator) return;
      try {
        console.log('[WebRTC] Received offer, creating answer...');
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

        // Process any queued ICE candidates
        while (pendingCandidatesRef.current.length > 0) {
          const cand = pendingCandidatesRef.current.shift();
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer', {
          roomId,
          sdp: pc.localDescription
        });
      } catch (err) {
        console.error('[WebRTC] Error handling offer:', err);
      }
    };

    const handleAnswer = async (data) => {
      if (data.roomId !== roomId) return;
      try {
        console.log('[WebRTC] Received answer, setting remote description...');
        if (pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

          // Process queued candidates
          while (pendingCandidatesRef.current.length > 0) {
            const cand = pendingCandidatesRef.current.shift();
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          }
        }
      } catch (err) {
        console.error('[WebRTC] Error handling answer:', err);
      }
    };

    const handleIceCandidate = async (data) => {
      if (data.roomId !== roomId || !data.candidate) return;
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
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice_candidate', handleIceCandidate);
      cleanupPeerConnection();
    };
  }, [socket, currentRoom, localStream, cleanupPeerConnection]);

  return {
    remoteStream,
    connectionState,
    peerConnection: peerConnectionRef.current
  };
};
