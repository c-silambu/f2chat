import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const REPORT_REASONS = [
  { id: 'nudity_sexual', label: 'Nudity or Sexual Content' },
  { id: 'harassment', label: 'Harassment or Bullying' },
  { id: 'hate_abuse', label: 'Hate Speech / Abusive Behavior' },
  { id: 'spam_scam', label: 'Spam, Links, or Commercial Scams' },
  { id: 'underage_concern', label: 'Underage Concern / Safety' },
  { id: 'bot_behavior', label: 'Automated Bot / Pre-recorded Video' },
  { id: 'other', label: 'Other Guidelines Violation' }
];

export const ReportModal = ({ isOpen, onClose }) => {
  const { reportUser } = useSocket();
  const [selectedReason, setSelectedReason] = useState('nudity_sexual');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    reportUser(selectedReason, details);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white glass-panel border border-violet-100 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-violet-900/10">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-violet-100">
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base">
            <ShieldAlert className="w-5 h-5" />
            <span>Report User</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Note */}
        <div className="my-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>
            Submitting a report will immediately end the chat, block this partner from rematching, and submit details to our moderation team.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-violet-950 mb-2">
              Reason for Report
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-colors ${
                    selectedReason === r.id
                      ? 'bg-violet-50 border-brand-500 text-brand-700 shadow-xs'
                      : 'bg-white border-violet-100 text-violet-900 hover:bg-violet-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.id}
                    checked={selectedReason === r.id}
                    onChange={() => setSelectedReason(r.id)}
                    className="accent-brand-600 w-4 h-4"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-violet-950 mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={400}
              placeholder="Describe what occurred..."
              className="w-full bg-violet-50/50 border border-violet-200 rounded-2xl p-3 text-xs text-violet-950 placeholder-violet-400 focus:outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-violet-200 resize-none h-20 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-violet-700 hover:bg-violet-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/30"
            >
              Submit & Block
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
