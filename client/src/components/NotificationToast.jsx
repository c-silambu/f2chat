import React from 'react';
import { Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const NotificationToast = () => {
  const { notification } = useSocket();

  if (!notification) return null;

  const icons = {
    info: <Info className="w-4 h-4 text-brand-600" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-600" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600" />
  };

  const borders = {
    info: 'border-violet-200 bg-white/95 text-violet-950',
    success: 'border-emerald-200 bg-white/95 text-emerald-950',
    warning: 'border-amber-200 bg-white/95 text-amber-950',
    error: 'border-rose-200 bg-white/95 text-rose-950'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl glass-panel border shadow-2xl shadow-violet-900/10 ${borders[notification.type || 'info']}`}>
        {icons[notification.type || 'info']}
        <span className="text-xs sm:text-sm font-bold">{notification.message}</span>
      </div>
    </div>
  );
};
