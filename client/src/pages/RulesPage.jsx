import React from 'react';
import { ShieldCheck, AlertOctagon, UserCheck, Eye, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RulesPage = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 hover:text-brand-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>

      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-violet-100 text-brand-600 border border-violet-200 flex items-center justify-center mx-auto mb-3 shadow-md">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-violet-950 tracking-tight">Community Safety & Code of Conduct</h1>
        <p className="text-sm sm:text-base text-violet-800/80 max-w-xl mx-auto font-medium">
          VibePulse is designed to connect people in a safe, friendly, and respectful environment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="glass-panel bg-white p-7 rounded-3xl border border-rose-200 space-y-4 shadow-lg shadow-rose-500/5">
          <div className="flex items-center gap-2 text-rose-600 font-black text-base">
            <AlertOctagon className="w-5 h-5" />
            <span>Strictly Prohibited Behavior</span>
          </div>
          <ul className="text-xs sm:text-sm text-slate-700 space-y-2.5 list-disc list-inside font-medium leading-relaxed">
            <li>Nudity, sexual acts, or sexually suggestive content.</li>
            <li>Harassment, bullying, threats, or hate speech.</li>
            <li>Any activity involving or endangering minors (immediate permanent ban & report to authorities).</li>
            <li>Broadcasting pre-recorded or automated video streams.</li>
            <li>Spamming links, solicitation, or financial fraud.</li>
          </ul>
        </div>

        <div className="glass-panel bg-white p-7 rounded-3xl border border-emerald-200 space-y-4 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-700 font-black text-base">
            <UserCheck className="w-5 h-5" />
            <span>Good Community Conduct</span>
          </div>
          <ul className="text-xs sm:text-sm text-slate-700 space-y-2.5 list-disc list-inside font-medium leading-relaxed">
            <li>Treat your chat partners with respect and courtesy.</li>
            <li>Keep conversations friendly and welcoming.</li>
            <li>Use the "Next Partner" button if you do not feel comfortable.</li>
            <li>Report suspicious or offensive accounts immediately.</li>
            <li>Protect your personal information (never share passwords or financial data).</li>
          </ul>
        </div>

      </div>

      <div className="glass-panel bg-white p-7 rounded-3xl border border-violet-100 space-y-3 text-xs sm:text-sm text-violet-900 shadow-lg shadow-violet-500/5">
        <h3 className="text-base font-extrabold text-violet-950">How Reporting & Enforcement Works</h3>
        <p className="leading-relaxed font-medium text-violet-850">
          When you click the <strong className="text-violet-950 font-bold">Report</strong> button, your active session with that partner is severed immediately. The reported session is placed into our automated risk queue and sent to human moderators. Repeat offenders are permanently blocked from joining the matchmaking pool.
        </p>
      </div>

    </div>
  );
};
