import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  ShieldCheck,
  Zap,
  Globe2,
  Lock,
  ArrowRight,
  Sparkles,
  Users,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isConnected } = useSocket();
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const handleStart = () => {
    if (!agreedToTerms) return;
    navigate('/chat');
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-gradient-to-b from-[#fbfbfe] via-white to-violet-50/40 overflow-hidden">
      
      {/* Background Pastel Violet Ambient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-violet-300/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] bg-purple-300/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[400px] h-[300px] bg-indigo-200/25 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 text-center z-10 flex-1 flex flex-col justify-center items-center">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill text-xs font-bold text-violet-800 mb-8 border border-violet-200 shadow-md glow-brand animate-float bg-white/90">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Next-Gen Random 1-on-1 Video Chat Platform</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-6 text-violet-950">
          Meet interesting people{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600">
            instantly across the globe.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-violet-800/80 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
          High-definition, low-latency peer-to-peer video conversations with real-time text chat, proactive moderation, and privacy by design. No registration required.
        </p>

        {/* Action Box */}
        <div className="w-full max-w-lg glass-panel bg-white/95 p-8 rounded-3xl border border-violet-100 shadow-2xl shadow-violet-500/10 space-y-5">
          
          {/* Age & Terms Checkbox */}
          <label className="flex items-start gap-3 text-left cursor-pointer p-3 rounded-2xl bg-violet-50/60 hover:bg-violet-50 border border-violet-100 transition-colors">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 accent-brand-600 rounded cursor-pointer"
            />
            <span className="text-xs text-violet-900 leading-normal font-medium">
              I certify that I am <strong className="text-violet-950 font-bold">18 years or older</strong> and agree to abide by the{' '}
              <a href="/rules" className="text-brand-600 font-bold underline hover:text-brand-800">Community Guidelines</a> and{' '}
              <a href="/terms" className="text-brand-600 font-bold underline hover:text-brand-800">Terms of Service</a>.
            </span>
          </label>

          {/* Start Chatting CTA */}
          <button
            onClick={handleStart}
            disabled={!agreedToTerms}
            className="w-full py-4 px-8 rounded-2xl font-extrabold text-lg text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-brand-600/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Video className="w-6 h-6 fill-current" />
            <span>Start Video Chatting</span>
            <ArrowRight className="w-6 h-6" />
          </button>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-violet-700 font-bold">
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" /> P2P WebRTC
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" /> Auto-Moderated
            </span>
            <span className="flex items-center gap-1.5">
              <EyeOff className="w-4 h-4 text-purple-600" /> 100% Anonymous
            </span>
          </div>

        </div>

      </div>

      {/* Feature Highlights Grid */}
      <div className="relative w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-panel bg-white/90 p-8 rounded-3xl border border-violet-100 shadow-lg shadow-violet-500/5 hover:border-brand-500/40 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 border border-violet-200 text-brand-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-violet-950 mb-2">Ultra-Fast P2P Signalling</h3>
            <p className="text-xs sm:text-sm text-violet-800/80 leading-relaxed font-medium">
              Video and audio streams flow directly between participants via encrypted WebRTC with zero intermediary server bottlenecks.
            </p>
          </div>

          <div className="glass-panel bg-white/90 p-8 rounded-3xl border border-violet-100 shadow-lg shadow-violet-500/5 hover:border-emerald-500/40 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-violet-950 mb-2">Layered Community Safety</h3>
            <p className="text-xs sm:text-sm text-violet-800/80 leading-relaxed font-medium">
              Equipped with smart privacy auto-blur, proactive spam heuristics, instant reporting, and zero-tolerance automated blocklists.
            </p>
          </div>

          <div className="glass-panel bg-white/90 p-8 rounded-3xl border border-violet-100 shadow-lg shadow-violet-500/5 hover:border-purple-500/40 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Globe2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-violet-950 mb-2">Redis-Powered Scalability</h3>
            <p className="text-xs sm:text-sm text-violet-800/80 leading-relaxed font-medium">
              Engineered with atomic matchmaking queues designed to effortlessly scale across multiple node instances and high concurrency.
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-violet-100 bg-white/80 py-8 text-center text-xs text-violet-700 font-medium">
        <div className="w-full max-w-[1700px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} VibePulse Platform. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="/rules" className="hover:text-violet-950 transition-colors font-bold">Rules</a>
            <a href="/terms" className="hover:text-violet-950 transition-colors font-bold">Terms</a>
            <a href="/privacy" className="hover:text-violet-950 transition-colors font-bold">Privacy</a>
            <a href="/admin/login" className="text-brand-600 hover:text-brand-800 transition-colors font-bold">Admin Portal</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
