import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, Key, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.adminLogin(username, password);
      if (res.success && res.token) {
        login(res.token, res.admin);
        navigate('/admin/dashboard');
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Could not connect to authentication server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative bg-gradient-to-b from-[#fbfbfe] to-violet-50/50">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-violet-300/20 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md bg-white glass-panel border border-violet-100 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-violet-500/10 relative z-10">
        
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-bold text-violet-700 hover:text-brand-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 border border-violet-200 text-brand-600 flex items-center justify-center mx-auto mb-4 shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-violet-950 tracking-tight">Staff Moderation Portal</h2>
          <p className="text-xs sm:text-sm text-violet-800/80 mt-1 font-medium">
            Access live telemetry, user reports, and moderation tools.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-violet-950 mb-1.5">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-violet-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-violet-50/50 border border-violet-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-violet-950 placeholder-violet-400 focus:outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-violet-200 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-violet-950 mb-1.5">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-violet-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-violet-50/50 border border-violet-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-violet-950 placeholder-violet-400 focus:outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-violet-200 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-600/30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-violet-100 text-center text-xs text-violet-700 font-medium">
          Default Dev Admin: <code className="text-brand-700 font-bold bg-violet-50 px-1.5 py-0.5 rounded border border-violet-200">admin</code> / <code className="text-brand-700 font-bold bg-violet-50 px-1.5 py-0.5 rounded border border-violet-200">admin123</code>
        </div>

      </div>
    </div>
  );
};
