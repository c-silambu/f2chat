import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsPage = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 hover:text-brand-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 text-brand-600 flex items-center justify-center border border-violet-200 shadow-sm">
          <FileText className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-violet-950">Terms of Service</h1>
      </div>

      <div className="glass-panel bg-white p-8 rounded-3xl border border-violet-100 space-y-4 text-xs sm:text-sm text-violet-900 leading-relaxed font-medium shadow-xl shadow-violet-500/5">
        <p><strong className="text-violet-950 font-bold">1. Acceptance of Terms:</strong> By accessing and using VibePulse, you certify that you are at least 18 years of age and agree to comply with all applicable local, national, and international laws.</p>
        <p><strong className="text-violet-950 font-bold">2. User Conduct:</strong> You agree not to engage in harassing, unlawful, or sexually explicit behavior. You understand that our platform utilizes automated and human moderation systems to detect violations.</p>
        <p><strong className="text-violet-950 font-bold">3. Disclaimer of Warranty:</strong> Video chat connections are provided "as-is" and "as available". We do not guarantee uninterrupted connectivity or endorse user communications.</p>
        <p><strong className="text-violet-950 font-bold">4. Termination:</strong> We reserve the right to suspend or ban any session or IP address at any time for violation of these terms without notice.</p>
      </div>
    </div>
  );
};
