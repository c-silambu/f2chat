import React from 'react';
import { X, UserX, AlertOctagon } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const BlockModal = ({ isOpen, onClose }) => {
  const { blockUser } = useSocket();

  if (!isOpen) return null;

  const handleConfirm = () => {
    blockUser('User requested manual block');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white glass-panel border border-violet-100 rounded-3xl p-7 shadow-2xl shadow-violet-900/10 text-center">
        
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <UserX className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-violet-950 mb-2">Block This User?</h3>
        
        <p className="text-xs sm:text-sm text-violet-800/80 mb-6 leading-relaxed font-medium">
          You will immediately disconnect from this user and our matchmaking system will prevent you two from ever matching again.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/30"
          >
            Confirm Block
          </button>
        </div>

      </div>
    </div>
  );
};
