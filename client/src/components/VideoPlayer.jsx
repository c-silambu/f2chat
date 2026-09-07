import React, { useEffect, useRef, useState } from 'react';
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
  X,
  Maximize2,
  Minimize2,
  Move
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

  // Mobile PiP positioning: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left'
  const [pipPosition, setPipPosition] = useState('bottom-right');
  const [isPipMinimized, setIsPipMinimized] = useState(false);

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

  // Cycle PiP position on mobile tap
  const cyclePipPosition = (e) => {
    e.stopPropagation();
    const positions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    const nextIdx = (positions.indexOf(pipPosition) + 1) % positions.length;
    setPipPosition(positions[nextIdx]);
  };

  const getPipClassNames = () => {
    switch (pipPosition) {
      case 'top-right':
        return 'top-3 right-3 sm:top-4 sm:right-4';
      case 'top-left':
        return 'top-3 left-3 sm:top-4 sm:left-4';
      case 'bottom-left':
        return 'bottom-3 left-3 sm:bottom-4 sm:left-4';
      case 'bottom-right':
      default:
        return 'bottom-3 right-3 sm:bottom-4 sm:right-4';
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] sm:min-h-[480px] lg:min-h-[540px] bg-slate-950 rounded-3xl overflow-hidden border border-violet-100/30 shadow-2xl flex flex-col md:flex-row gap-2 p-2 sm:p-3">
      
      {/* 1. REMOTE (PARTNER) VIDEO CONTAINER - Full Screen on Mobile, Left/Main on Desktop */}
      <div className="relative flex-1 w-full h-full min-h-[360px] md:min-h-full bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 shadow-inner">
        
        {/* Active Remote Stream Video */}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/95 backdrop-blur-md z-10">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute w-28 h-28 rounded-full bg-violet-500/25 animate-radar-ping" />
              <div className="absolute w-20 h-20 rounded-full bg-purple-500/30 animate-pulse" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl glow-brand">
                <Users className="w-7 h-7 animate-bounce" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">
              Looking for a partner...
            </h3>
            <p className="text-xs sm:text-sm text-violet-200/90 max-w-sm font-medium leading-relaxed">
              Pairing you with a live user with ultra-low latency WebRTC.
            </p>
          </div>
        )}

        {/* Remote State: Idle / Start */}
        {matchStatus === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-slate-950 z-10">
            <div className="w-20 h-20 rounded-3xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 mb-5 shadow-lg glow-brand">
              <Sparkles className="w-10 h-10" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">Ready to Connect</h3>
            <p className="text-xs sm:text-sm text-violet-200/90 max-w-sm font-medium leading-relaxed">
              Click <span className="text-brand-300 font-bold">Start Chatting</span> below to begin your random 1-on-1 video call.
            </p>
          </div>
        )}

        {/* Remote State: Partner Disconnected */}
        {matchStatus === 'partner_disconnected' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/95 z-10">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg">
              <WifiOff className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Partner Disconnected</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xs mb-4">
              Your partner skipped or ended the call.
            </p>
          </div>
        )}

        {/* Black Screen / Covered Camera Automated Banner */}
        {matchStatus === 'matched' && isBlackScreen && (
          <div className="absolute top-4 inset-x-4 z-30 animate-in slide-in-from-top duration-200">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 border border-amber-400 text-white shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span>Dark / Covered Camera Detected</span>
                    {blackScreenCountdown !== null && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 font-mono text-xs">
                        Auto-skip in {blackScreenCountdown}s
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Partner camera feed is not visible.
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

        {/* Remote Partner Badge (Top Left / Right) */}
        {matchStatus === 'matched' && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Partner</span>
          </div>
        )}
      </div>

      {/* 2. LOCAL (USER) VIDEO CONTAINER - Floating PiP on Mobile, Side Panel on Desktop (md:) */}
      <div
        className={`
          md:relative md:w-1/3 md:h-full md:min-h-full md:inset-auto md:bg-slate-950 md:rounded-2xl md:border md:border-white/10
          absolute ${getPipClassNames()} z-30 transition-all duration-300 ease-out
          ${
            isPipMinimized
              ? 'w-16 h-20 sm:w-20 sm:h-24 opacity-80 hover:opacity-100'
              : 'w-28 h-40 sm:w-36 sm:h-52'
          }
          bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 backdrop-blur-xl flex items-center justify-center group
        `}
      >
        {/* Local Stream Video Feed */}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-slate-950 p-2 text-center">
            <VideoOff className="w-6 h-6 sm:w-8 sm:h-8 mb-1 text-violet-400" />
            <span className="text-[10px] sm:text-xs font-bold text-violet-200">Camera Off</span>
          </div>
        )}

        {/* Floating PiP Controls (Mobile Only) */}
        <div className="md:hidden absolute top-1.5 right-1.5 z-20 flex items-center gap-1 opacity-90 group-hover:opacity-100">
          <button
            onClick={cyclePipPosition}
            className="p-1 rounded-lg bg-black/60 hover:bg-black/80 text-white/90 shadow-md backdrop-blur-md"
            title="Move Corner"
          >
            <Move className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPipMinimized(!isPipMinimized);
            }}
            className="p-1 rounded-lg bg-black/60 hover:bg-black/80 text-white/90 shadow-md backdrop-blur-md"
            title={isPipMinimized ? 'Expand' : 'Minimize'}
          >
            {isPipMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
        </div>

        {/* Local Stream Info Overlay */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-extrabold text-white shadow-md">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span>You</span>
          </div>
          {isAudioMuted && (
            <div className="p-1 rounded-full bg-rose-600 text-white shadow-md" title="Muted">
              <MicOff className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
