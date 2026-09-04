import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  SkipForward,
  Play,
  Square,
  ShieldAlert,
  UserX,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const Controls = ({
  isAudioMuted,
  isVideoDisabled,
  isBlurActive,
  onToggleAudio,
  onToggleVideo,
  onToggleBlur,
  onOpenReport,
  onOpenBlock,
  onStart
}) => {
  const { matchStatus, nextUser, cancelQueue, disconnectChat } = useSocket();

  const isMatched = matchStatus === 'matched';
  const isSearching = matchStatus === 'searching';
  const isIdle = matchStatus === 'idle';

  return (
    <div className="w-full glass-panel bg-white/95 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-violet-500/5 border border-violet-100">
      
      {/* Left: Device & Privacy Toggles */}
      <div className="flex items-center gap-2">
        {/* Mic Toggle */}
        <button
          onClick={onToggleAudio}
          className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
            isAudioMuted
              ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 shadow-sm'
              : 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 hover:text-violet-950'
          }`}
          title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
            isVideoDisabled
              ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 shadow-sm'
              : 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 hover:text-violet-950'
          }`}
          title={isVideoDisabled ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        {/* Smart Privacy Blur Toggle */}
        <button
          onClick={onToggleBlur}
          className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
            isBlurActive
              ? 'bg-brand-100 text-brand-700 border border-brand-300 hover:bg-brand-200 shadow-sm'
              : 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 hover:text-violet-950'
          }`}
          title={isBlurActive ? 'Disable Partner Blur' : 'Enable Partner Blur'}
        >
          {isBlurActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Center: Main Match Action */}
      <div className="flex items-center gap-3">
        {isIdle && (
          <button
            onClick={onStart}
            className="px-8 py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-brand-600/30 flex items-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Chatting</span>
          </button>
        )}

        {isSearching && (
          <button
            onClick={cancelQueue}
            className="px-6 py-3.5 rounded-2xl font-bold text-violet-900 bg-violet-100 hover:bg-violet-200 border border-violet-300 flex items-center gap-2.5 transition-colors shadow-sm"
          >
            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
            <span>Stop Searching</span>
          </button>
        )}

        {(isMatched || matchStatus === 'partner_disconnected') && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={nextUser}
              className="px-7 py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-brand-600/30 flex items-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <SkipForward className="w-5 h-5" />
              <span>Next Partner (ESC)</span>
            </button>

            <button
              onClick={disconnectChat}
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors shadow-sm"
              title="End Chat Session"
            >
              <Square className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Right: Moderation / Safety Buttons */}
      <div className="flex items-center gap-2">
        {isMatched && (
          <>
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors shadow-sm"
              title="Report User for Violation"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Report</span>
            </button>

            <button
              onClick={onOpenBlock}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors shadow-sm"
              title="Block User"
            >
              <UserX className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Block</span>
            </button>
          </>
        )}
      </div>

    </div>
  );
};
