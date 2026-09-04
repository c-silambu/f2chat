import React, { useState } from 'react';
import { Shield, X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SafetyBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-violet-100/90 via-purple-50 to-violet-100/90 border-b border-violet-200/80 px-4 py-2.5 shadow-sm">
      <div className="w-full max-w-[1700px] mx-auto flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-violet-900">
          <Shield className="w-4 h-4 text-brand-600 shrink-0" />
          <span>
            <strong className="text-violet-950 font-bold">Community Safety:</strong> You must be 18+ to use VibePulse. Inappropriate, illegal, or abusive conduct will result in an immediate permanent ban.
          </span>
          <Link to="/rules" className="text-brand-700 hover:text-brand-900 underline font-bold ml-1">
            Read Rules
          </Link>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-violet-500 hover:text-violet-900 p-1 transition-colors"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
