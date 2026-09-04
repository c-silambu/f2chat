import { Report } from '../models/Report.js';
import { getDBStatus } from '../config/db.js';

export const createReport = async (req, res, next) => {
  try {
    const { reporterSessionId, reportedSessionId, roomId, reason, details } = req.body;

    if (!reporterSessionId || !reportedSessionId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required report fields (reporterSessionId, reportedSessionId, reason)'
      });
    }

    if (getDBStatus()) {
      const report = await Report.create({
        reporterSessionId,
        reportedSessionId,
        roomId,
        reason,
        details: details ? details.slice(0, 500) : ''
      });
      return res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        reportId: report._id
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Report received (fallback mode)'
    });
  } catch (err) {
    next(err);
  }
};
