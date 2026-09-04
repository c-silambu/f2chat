import React from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPage = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 hover:text-brand-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-violet-950">Privacy Policy</h1>
      </div>

      <div className="glass-panel bg-white p-8 rounded-3xl border border-violet-100 space-y-4 text-xs sm:text-sm text-violet-900 leading-relaxed font-medium shadow-xl shadow-violet-500/5">
        <p><strong className="text-violet-950 font-bold">1. Peer-to-Peer Architecture:</strong> Audio and video streams are routed directly between connected browsers using encrypted WebRTC connections. Our backend servers do not record, store, or stream your raw camera feeds.</p>
        <p><strong className="text-violet-950 font-bold">2. Anonymity & Data Minimization:</strong> You do not need to provide personal identifiers, email addresses, or phone numbers to use VibePulse. Ephemeral session IDs are used only for routing WebRTC signalling.</p>
        <p><strong className="text-violet-950 font-bold">3. Browser-Side Safety Checks:</strong> When enabled, automated frame checks execute locally inside your web browser. Raw frame pixels are never uploaded or saved to remote databases.</p>
        <p><strong className="text-violet-950 font-bold">4. Incident Reports:</strong> If a report is submitted, metadata (such as timestamps and user-submitted notes) is temporarily retained to assist in identifying malicious actors and bad bots.</p>
      </div>
    </div>
  );
};
