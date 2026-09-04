const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const api = {
  // Admin Login
  async adminLogin(username, password) {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  // Admin Overview
  async getAdminOverview(token) {
    const res = await fetch(`${BASE_URL}/api/admin/overview`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return res.json();
  },

  // Admin Reports List
  async getReports(token, status = '') {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${BASE_URL}/api/admin/reports${query}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return res.json();
  },

  // Admin Resolve Report
  async resolveReport(token, reportId, action, notes) {
    const res = await fetch(`${BASE_URL}/api/admin/reports/${reportId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ action, notes })
    });
    return res.json();
  },

  // Admin Ban User
  async banUser(token, sessionId, reason, durationHours) {
    const res = await fetch(`${BASE_URL}/api/admin/users/ban`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sessionId, reason, durationHours })
    });
    return res.json();
  },

  // Public Health check
  async getHealth() {
    const res = await fetch(`${BASE_URL}/api/health`);
    return res.json();
  }
};
