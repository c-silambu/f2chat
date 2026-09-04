import React, { useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Users,
  Loader2,
  Sparkles,
  ShieldAlert,
  WifiOff,
  AlertTriangle,
  FastForward,
  X
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const VideoPlayer = ({
  localStream,
  remoteStream,
  isAudioMuted,
  isVideoDisabled,
  isBlurActive,
  isFlagged,
  isBlackScreen,
  blackScreenCountdown,
  onSkipBlackScreen,
  onCancelBlackScreen,
  remoteVideoRef,
  connectionState
}) => {
  const localVideoRef = useRef(null);
  const internalRemoteVideoRef = useRef(null);
  const activeRemoteRef = remoteVideoRef || internalRemoteVideoRef;
  const { matchStatus } = useSocket();

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream
  useEffect(() => {
    if (activeRemoteRef.current) {
      if (remoteStream) {
        activeRemoteRef.current.srcObject = remoteStream;
      } else {
        activeRemoteRef.current.srcObject = null;
      }
    }
  }, [remoteStream, activeRemoteRef]);

  return (
    <div className="relative w-full h-full min-h-[420px] lg:min-h-[540px] bg-white rounded-3xl overflow-hidden border border-violet-100 shadow-xl shadow-violet-500/5 flex flex-col md:flex-row gap-3 p-2.5 sm:p-3.5">
      
      {/* 1. REMOTE (PARTNER) VIDEO CONTAINER */}
      <div className="relative flex-1 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-violet-100 shadow-inner">
        
        {/* Active Remote Stream */}
        {matchStatus === 'matched' && remoteStream ? (
          <video
            ref={activeRemoteRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-all duration-300 ${
              isBlurActive ? 'blur-2xl scale-105' : ''
            }`}
          />
        ) : null}

        {/* Remote State: Searching */}
        {matchStatus === 'searching' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/95 backdrop-blur-md">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute w-28 h-28 rounded-full bg-violet-500/25 animate-radar-ping" />
              <div className="absolute w-18 h-18 rounded-full bg-purple-500/30 animate-pulse" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xl glow-brand">
                <Users className="w-7 h-7 animate-bounce" />
              </div>
            </div>
            <h3 className="text-xl font-black text-white mb-2 tracking-tight">Searching for a partner...</h3>
            <p className="text-xs sm:text-sm text-violet-200/90 max-w-sm font-medium leading-relaxed">
              Matching you with someone around the world using low-latency P2P WebRTC.
            </p>
          </div>
        )}

        {/* Remote State: Idle / Start */}
        {matchStatus === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="w-20 h-20 rounded-3xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 mb-5 shadow-lg glow-brand">
              <Sparkles className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Ready to Connect</h3>
            <p className="text-xs sm:text-sm text-violet-200/90 max-w-sm font-medium leading-relaxed">
              Click <span className="text-brand-300 font-bold">Start Chatting</span> below to begin your random 1-on-1 video call.
            </p>
          </div>
        )}

        {/* Remote State: Partner Disconnected */}
        {matchStatus === 'partner_disconnected' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/95">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg">
              <WifiOff className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Partner Disconnected</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xs mb-4">
              Your partner has skipped or ended the call.
            </p>
          </div>
        )}

        {/* Black Screen / Covered Camera Automated Banner */}
        {matchStatus === 'matched' && isBlackScreen && (
          <div className="absolute top-4 inset-x-4 z-30 animate-in slide-in-from-top duration-200">
            <div className="p-4 rounded-2xl bg-slate-900/95 border border-amber-400 text-white shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span>Black Screen / Covered Camera Detected</span>
                    {blackScreenCountdown !== null && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 font-mono text-xs">
                        Auto-skip in {blackScreenCountdown}s
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Partner camera feed is dark or covered. Skipping automatically...
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onSkipBlackScreen}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
                >
                  <FastForward className="w-4 h-4" />
                  <span>Skip Now</span>
                </button>
                <button
                  onClick={onCancelBlackScreen}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs transition-colors"
                  title="Keep Waiting"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flagged / Privacy Warning Indicator */}
        {isFlagged && !isBlackScreen && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600/95 text-white text-xs font-bold backdrop-blur-md shadow-lg">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>Safety Warning Detected</span>
          </div>
        )}

        {/* Remote Status Badge */}
        {matchStatus === 'matched' && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-violet-100 text-xs font-extrabold text-violet-950 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Partner</span>
          </div>
        )}
      </div>

      {/* 2. LOCAL (USER) VIDEO CONTAINER */}
      <div className="relative md:w-1/3 min-h-[200px] md:min-h-full bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-violet-100 shadow-inner">
        {localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover mirror-video ${
              isVideoDisabled ? 'hidden' : 'block'
            }`}
          />
        ) : null}

        {/* Video Disabled Placeholder */}
        {isVideoDisabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-slate-950">
            <VideoOff className="w-10 h-10 mb-2 text-violet-400" />
            <span className="text-xs font-bold text-violet-200">Camera is Off</span>
          </div>
        )}

        {/* Local Stream Info Overlay */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-violet-100 text-xs font-extrabold text-violet-950 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
            <span>You</span>
          </div>
          {isAudioMuted && (
            <div className="p-1.5 rounded-full bg-rose-600 text-white shadow-md" title="Microphone muted">
              <MicOff className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
