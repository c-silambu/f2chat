import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useMediaStream } from '../hooks/useMediaStream';
import { useWebRTC } from '../hooks/useWebRTC';
import { useFrameModeration } from '../hooks/useFrameModeration';
import { VideoPlayer } from '../components/VideoPlayer';
import { Controls } from '../components/Controls';
import { ChatBox } from '../components/ChatBox';
import { ReportModal } from '../components/ReportModal';
import { BlockModal } from '../components/BlockModal';
import { Camera, AlertCircle, RefreshCw, MessageSquare, Video as VideoIcon } from 'lucide-react';

export const ChatPage = () => {
  const { socket, currentRoom, matchStatus, messages, joinQueue, nextUser } = useSocket();
  const {
    localStream,
    isAudioMuted,
    isVideoDisabled,
    permissionError,
    isInitializing,
    startMedia,
    toggleAudio,
    toggleVideo
  } = useMediaStream();

  const { remoteStream, connectionState } = useWebRTC(socket, currentRoom, localStream);

  // Video element ref for partner stream frame safety and black screen detection
  const remoteVideoRef = useRef(null);
  
  const {
    isFlagged,
    isBlurActive,
    isBlackScreen,
    blackScreenCountdown,
    toggleBlur,
    cancelBlackScreenTimer,
    triggerAutoSkip
  } = useFrameModeration(remoteVideoRef, matchStatus === 'matched', nextUser);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('video'); // 'video' | 'chat'
  const [lastViewedMsgCount, setLastViewedMsgCount] = useState(0);

  // Count unread messages when in video tab on mobile
  useEffect(() => {
    if (mobileTab === 'chat') {
      setLastViewedMsgCount(messages.length);
    }
  }, [messages.length, mobileTab]);

  const unreadCount = mobileTab === 'video' ? Math.max(0, messages.length - lastViewedMsgCount) : 0;

  // Start media devices on page load and join queue
  useEffect(() => {
    let active = true;
    startMedia().then((stream) => {
      if (stream && active) {
        joinQueue();
      }
    });

    return () => {
      active = false;
    };
  }, [startMedia]);

  // Keyboard shortcut: ESC to Next Partner
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        nextUser();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextUser]);

  return (
    <div className="w-full max-w-[1750px] mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-3 flex-1 flex flex-col gap-2.5 sm:gap-3 min-h-[calc(100vh-4.5rem)]">
      
      {/* Mobile Tab Switcher (Visible only on < lg screens) */}
      <div className="lg:hidden flex items-center justify-center p-1 bg-violet-100/70 rounded-2xl border border-violet-200/80 shadow-xs max-w-sm mx-auto w-full">
        <button
          onClick={() => setMobileTab('video')}
          className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'video'
              ? 'bg-white text-violet-950 shadow-md scale-100'
              : 'text-violet-700 hover:text-violet-950'
          }`}
        >
          <VideoIcon className="w-4 h-4 text-brand-600" />
          <span>Video Call</span>
        </button>

        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all relative ${
            mobileTab === 'chat'
              ? 'bg-white text-violet-950 shadow-md scale-100'
              : 'text-violet-700 hover:text-violet-950'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-brand-600" />
          <span>Text Chat</span>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Camera/Mic Permission Error Banner */}
      {permissionError && (
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-rose-300 bg-rose-50 text-rose-900 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="text-xs sm:text-sm font-medium">
              <strong className="text-rose-950 font-bold">Media Device Access Required:</strong> {permissionError}
            </div>
          </div>
          <button
            onClick={() => startMedia().then((s) => s && joinQueue())}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 transition-colors shrink-0 shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Grant & Retry</span>
          </button>
        </div>
      )}

      {/* Main Video & Chat Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[500px]">
        
        {/* Left 8 or 9 Cols: Full Video View & Controls */}
        <div
          className={`lg:col-span-8 xl:col-span-9 flex flex-col gap-2.5 sm:gap-3 ${
            mobileTab === 'video' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="flex-1 min-h-[380px] sm:min-h-[460px] lg:min-h-[540px]">
            <VideoPlayer
              localStream={localStream}
              remoteStream={remoteStream}
              isAudioMuted={isAudioMuted}
              isVideoDisabled={isVideoDisabled}
              isBlurActive={isBlurActive}
              isFlagged={isFlagged}
              isBlackScreen={isBlackScreen}
              blackScreenCountdown={blackScreenCountdown}
              onSkipBlackScreen={triggerAutoSkip}
              onCancelBlackScreen={cancelBlackScreenTimer}
              remoteVideoRef={remoteVideoRef}
              connectionState={connectionState}
            />
          </div>

          {/* Bottom Action Controls */}
          <Controls
            isAudioMuted={isAudioMuted}
            isVideoDisabled={isVideoDisabled}
            isBlurActive={isBlurActive}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleBlur={toggleBlur}
            onOpenReport={() => setIsReportOpen(true)}
            onOpenBlock={() => setIsBlockOpen(true)}
            onStart={() => startMedia().then((s) => s && joinQueue())}
          />
        </div>

        {/* Right 4 or 3 Cols: Real-time 1-on-1 Text Chat */}
        <div
          className={`lg:col-span-4 xl:col-span-3 h-full min-h-[380px] ${
            mobileTab === 'chat' ? 'block' : 'hidden lg:block'
          }`}
        >
          <ChatBox />
        </div>

      </div>

      {/* Modals */}
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <BlockModal isOpen={isBlockOpen} onClose={() => setIsBlockOpen(false)} />

    </div>
  );
};
