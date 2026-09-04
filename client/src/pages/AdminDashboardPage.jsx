import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldAlert,
  CheckCircle,
  Server,
  Activity,
  UserX,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Clock,
  Database,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const AdminDashboardPage = () => {
  const { token, admin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'logs' | 'system'
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [ovRes, repRes] = await Promise.all([
        api.getAdminOverview(token),
        api.getReports(token, filterStatus)
      ]);

      if (ovRes.success) setOverview(ovRes.data);
      if (repRes.success) setReports(repRes.data || []);
    } catch (err) {
      console.error('Failed to fetch admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // Poll every 8s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleResolve = async (reportId, action) => {
    setActionLoading(reportId);
    try {
      await api.resolveReport(token, reportId, action, `Action taken by ${admin?.username}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to resolve report:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanSession = async (sessionId) => {
    if (!confirm(`Are you sure you want to suspend session: ${sessionId}?`)) return;
    try {
      await api.banUser(token, sessionId, 'Banned via Moderator Dashboard', 72);
      await fetchData();
    } catch (err) {
      console.error('Failed to ban session:', err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel bg-white p-7 rounded-3xl border border-violet-100 shadow-xl shadow-violet-500/5">
        <div>
          <h1 className="text-2xl font-black text-violet-950 tracking-tight flex items-center gap-2.5">
            <span>Moderation Operations</span>
            <span className="text-xs px-3 py-1 rounded-full bg-violet-100 text-brand-700 font-bold border border-violet-200">
              {admin?.role || 'Admin'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-violet-700 mt-1 font-medium">
            Logged in as <strong className="text-violet-950">{admin?.username}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel bg-white p-6 rounded-3xl border border-violet-100 shadow-lg shadow-violet-500/5">
          <div className="flex items-center justify-between text-violet-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Reports</span>
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-violet-950">
            {overview?.stats?.pendingReports ?? 0}
          </div>
          <div className="text-xs text-amber-700 font-semibold mt-1">Requires moderator action</div>
        </div>

        <div className="glass-panel bg-white p-6 rounded-3xl border border-violet-100 shadow-lg shadow-violet-500/5">
          <div className="flex items-center justify-between text-violet-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reports</span>
            <AlertTriangle className="w-5 h-5 text-brand-600" />
          </div>
          <div className="text-3xl font-black text-violet-950">
            {overview?.stats?.totalReports ?? 0}
          </div>
          <div className="text-xs text-violet-600 font-medium mt-1">Historical violation flags</div>
        </div>

        <div className="glass-panel bg-white p-6 rounded-3xl border border-violet-100 shadow-lg shadow-violet-500/5">
          <div className="flex items-center justify-between text-violet-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Banned Sessions</span>
            <UserX className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-violet-950">
            {overview?.stats?.bannedUsers ?? 0}
          </div>
          <div className="text-xs text-rose-700 font-semibold mt-1">Active suspensions</div>
        </div>

        <div className="glass-panel bg-white p-6 rounded-3xl border border-violet-100 shadow-lg shadow-violet-500/5">
          <div className="flex items-center justify-between text-violet-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Server Health</span>
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 capitalize">
            {overview?.services?.mongodb === 'connected' ? '100% Online' : 'Dev Mock'}
          </div>
          <div className="text-xs text-violet-600 font-medium mt-1">Uptime: {overview?.services?.uptimeSeconds ? `${Math.floor(overview.services.uptimeSeconds / 60)}m` : '0m'}</div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-violet-100 pb-3">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-brand-500/20'
              : 'text-violet-700 hover:text-brand-700 hover:bg-violet-50'
          }`}
        >
          Incident Reports
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'logs'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-brand-500/20'
              : 'text-violet-700 hover:text-brand-700 hover:bg-violet-50'
          }`}
        >
          Moderation Events
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'system'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-brand-500/20'
              : 'text-violet-700 hover:text-brand-700 hover:bg-violet-50'
          }`}
        >
          System Health
        </button>
      </div>

      {/* Tab 1: Incident Reports Table */}
      {activeTab === 'reports' && (
        <div className="glass-panel bg-white rounded-3xl border border-violet-100 overflow-hidden shadow-xl shadow-violet-500/5">
          <div className="p-4 border-b border-violet-100 flex items-center justify-between bg-violet-50/40">
            <span className="text-xs sm:text-sm font-extrabold text-violet-950">Live Incident Stream</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-violet-200 rounded-xl px-3 py-1.5 text-xs text-violet-950 focus:outline-none focus:ring-2 focus:ring-violet-200 font-semibold shadow-xs"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Only</option>
              <option value="action_taken">Action Taken</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-violet-900">
              <thead className="bg-violet-50/60 text-violet-800 uppercase text-[10px] tracking-wider font-bold border-b border-violet-100">
                <tr>
                  <th className="p-4">Reported ID</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderator Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-100">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-violet-400 font-medium">
                      No reports found in this category. System clean!
                    </td>
                  </tr>
                ) : (
                  reports.map((rep) => (
                    <tr key={rep._id} className="hover:bg-violet-50/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-brand-700">
                        {rep.reportedSessionId}
                      </td>
                      <td className="p-4 font-bold text-rose-600 capitalize">
                        {rep.reason.replace('_', ' ')}
                      </td>
                      <td className="p-4 text-slate-700 max-w-xs truncate font-medium">
                        {rep.details || '—'}
                      </td>
                      <td className="p-4 text-violet-600 whitespace-nowrap font-medium">
                        {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          rep.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : rep.status === 'action_taken'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {rep.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleResolve(rep._id, 'action_taken')}
                              disabled={actionLoading === rep._id}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors shadow-xs"
                            >
                              Ban & Confirm
                            </button>
                            <button
                              onClick={() => handleResolve(rep._id, 'dismissed')}
                              disabled={actionLoading === rep._id}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleBanSession(rep.reportedSessionId)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200"
                          title="Direct Suspend"
                        >
                          Suspend
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Recent Moderation Logs */}
      {activeTab === 'logs' && (
        <div className="glass-panel bg-white p-7 rounded-3xl border border-violet-100 space-y-4 shadow-xl shadow-violet-500/5">
          <h3 className="text-base font-extrabold text-violet-950 mb-2">Automated Moderation Logs</h3>
          {(!overview?.recentModerationEvents || overview.recentModerationEvents.length === 0) ? (
            <p className="text-xs text-violet-400 font-medium">No automated moderation events logged recently.</p>
          ) : (
            <div className="space-y-2">
              {overview.recentModerationEvents.map((evt, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-violet-50/60 border border-violet-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-200 text-brand-800 font-extrabold uppercase text-[10px]">
                      {evt.type}
                    </span>
                    <span className="text-violet-900 font-medium">{evt.details}</span>
                  </div>
                  <span className="text-violet-500 font-semibold text-[11px]">{new Date(evt.createdAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: System Health */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel bg-white p-7 rounded-3xl border border-violet-100 space-y-4 shadow-xl shadow-violet-500/5">
            <h3 className="text-base font-extrabold text-violet-950 flex items-center gap-2">
              <Server className="w-5 h-5 text-brand-600" />
              <span>Signalling Node Diagnostics</span>
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-violet-100">
                <span className="text-violet-700 font-medium">Node Runtime</span>
                <span className="font-mono text-violet-950 font-bold">{overview?.services?.nodeVersion || process.version}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-violet-100">
                <span className="text-violet-700 font-medium">Heap Memory Usage</span>
                <span className="font-mono text-emerald-600 font-bold">{overview?.services?.memoryUsageMb || 35} MB</span>
              </div>
              <div className="flex justify-between py-2 border-b border-violet-100">
                <span className="text-violet-700 font-medium">Matchmaker Redis State</span>
                <span className="font-mono text-brand-700 font-bold uppercase">{overview?.services?.redis}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-violet-700 font-medium">Database Engine</span>
                <span className="font-mono text-brand-700 font-bold uppercase">{overview?.services?.mongodb}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
