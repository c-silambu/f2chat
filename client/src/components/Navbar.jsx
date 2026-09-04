import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Video, ShieldCheck, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const Navbar = () => {
  const location = useLocation();
  const { isConnected } = useSocket();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-violet-100/80 glass-panel backdrop-blur-xl bg-white/80 shadow-sm shadow-violet-500/5">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform duration-300">
            <Video className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-950 via-purple-900 to-brand-600">
                VibePulse
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-violet-100 text-brand-700 border border-violet-200">
                P2P
              </span>
            </div>
            <span className="text-[11px] text-violet-600/70 font-medium">Instant Random Video</span>
          </div>
        </Link>

        {/* Center Live Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs shadow-sm bg-violet-50/80 border-violet-200">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 animate-pulse'}`} />
          <span className="text-violet-900 font-semibold">
            {isConnected ? 'Network Online' : 'Connecting to signalling...'}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-3">
          <Link
            to="/rules"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              location.pathname === '/rules'
                ? 'bg-violet-100 text-brand-700 border border-violet-200 shadow-sm'
                : 'text-violet-700 hover:text-brand-700 hover:bg-violet-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Safety & Rules</span>
          </Link>

          <Link
            to="/admin/login"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              location.pathname.startsWith('/admin')
                ? 'bg-violet-100 text-brand-700 border border-violet-200 shadow-sm'
                : 'text-violet-700 hover:text-brand-700 hover:bg-violet-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-brand-600" />
            <span className="hidden sm:inline">Staff Portal</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
