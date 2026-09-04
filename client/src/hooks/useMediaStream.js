import { useState, useEffect, useCallback, useRef } from 'react';

export const useMediaStream = () => {
  const [localStream, setLocalStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const streamRef = useRef(null);

  const startMedia = useCallback(async (constraints = { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: true }) => {
    setIsInitializing(true);
    setPermissionError(null);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setLocalStream(stream);
      setIsInitializing(false);
      return stream;
    } catch (err) {
      console.error('Failed to get media devices:', err);
      let message = 'Unable to access camera or microphone.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera/Microphone permission denied. Please allow camera and microphone access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera or microphone device found on your system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera or microphone is already in use by another application.';
      }
      setPermissionError(message);
      setIsInitializing(false);
      return null;
    }
  }, []);

  const stopMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setLocalStream(null);
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const enabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = enabled;
        setIsAudioMuted(!enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const enabled = !videoTracks[0].enabled;
        videoTracks[0].enabled = enabled;
        setIsVideoDisabled(!enabled);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, [stopMedia]);

  return {
    localStream,
    isAudioMuted,
    isVideoDisabled,
    permissionError,
    isInitializing,
    startMedia,
    stopMedia,
    toggleAudio,
    toggleVideo
  };
};
