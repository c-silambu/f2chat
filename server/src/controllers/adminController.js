import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { Admin } from '../models/Admin.js';
import { User } from '../models/User.js';
import { Report } from '../models/Report.js';
import { ModerationEvent } from '../models/ModerationEvent.js';
import { getDBStatus } from '../config/db.js';
import { isRedisOnline } from '../config/redis.js';

// In-memory fallback admin credentials
const DEFAULT_ADMIN = {
  id: 'admin-master',
  username: config.adminUsername,
  role: 'superadmin'
};

export const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    let isValid = false;
    let adminPayload = null;

    // First check hardcoded config fallback
    if (username === config.adminUsername && password === config.adminPassword) {
      isValid = true;
      adminPayload = DEFAULT_ADMIN;
    } else if (getDBStatus()) {
      const admin = await Admin.findOne({ username: username.toLowerCase() });
      if (admin && await admin.comparePassword(password)) {
        isValid = true;
        adminPayload = { id: admin._id, username: admin.username, role: admin.role };
        admin.lastLogin = new Date();
        await admin.save();
      }
    }

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials'
      });
    }

    const token = jwt.sign(adminPayload, config.jwtSecret, { expiresIn: '12h' });

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful',
      token,
      admin: adminPayload
    });
  } catch (err) {
    next(err);
  }
};

export const getSystemOverview = async (req, res, next) => {
  try {
    const dbConnected = getDBStatus();
    const redisConnected = isRedisOnline();

    let totalUsers = 0;
    let pendingReports = 0;
    let totalReports = 0;
    let bannedUsers = 0;
    let recentModerationEvents = [];
    let recentReports = [];

    if (dbConnected) {
      [
        totalUsers,
        pendingReports,
        totalReports,
        bannedUsers,
        recentModerationEvents,
        recentReports
      ] = await Promise.all([
        User.countDocuments(),
        Report.countDocuments({ status: 'pending' }),
        Report.countDocuments(),
        User.countDocuments({ status: 'banned' }),
        ModerationEvent.find().sort({ createdAt: -1 }).limit(10),
        Report.find().sort({ createdAt: -1 }).limit(10)
      ]);
    }

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          pendingReports,
          totalReports,
          bannedUsers
        },
        services: {
          mongodb: dbConnected ? 'connected' : 'in-memory-fallback',
          redis: redisConnected ? 'connected' : 'in-memory-fallback',
          nodeVersion: process.version,
          uptimeSeconds: Math.floor(process.uptime()),
          memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        },
        recentReports,
        recentModerationEvents
      }
    });
  } catch (err) {
    next(err);
  }
};

export const listReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    if (!getDBStatus()) {
      return res.status(200).json({
        success: true,
        data: [],
        total: 0,
        page: 1,
        message: 'Running in dev fallback mode'
      });
    }

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

export const resolveReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { action, notes } = req.body; // action: 'action_taken' | 'dismissed'

    if (!getDBStatus()) {
      return res.status(200).json({ success: true, message: 'Report updated (dev mode)' });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = action || 'reviewed';
    report.moderatorNotes = notes || '';
    report.moderatorId = req.admin.username;
    report.resolvedAt = new Date();
    await report.save();

    // If action taken was ban, ban the user
    if (action === 'action_taken') {
      await User.findOneAndUpdate(
        { sessionId: report.reportedSessionId },
        { status: 'banned', banReason: `Report #${report._id}: ${report.reason}` }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Report resolved successfully',
      data: report
    });
  } catch (err) {
    next(err);
  }
};

export const banUser = async (req, res, next) => {
  try {
    const { sessionId, reason, durationHours } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Missing sessionId' });
    }

    const expiresAt = durationHours ? new Date(Date.now() + durationHours * 3600 * 1000) : null;

    if (getDBStatus()) {
      await User.findOneAndUpdate(
        { sessionId },
        {
          status: 'banned',
          banReason: reason || 'Violation of terms of service',
          banExpiresAt: expiresAt
        },
        { upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      message: `User ${sessionId} has been suspended`,
      expiresAt
    });
  } catch (err) {
    next(err);
  }
};
