import express from 'express';
import {
  adminLogin,
  getSystemOverview,
  listReports,
  resolveReport,
  banUser
} from '../controllers/adminController.js';
import { verifyAdminToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public auth route
router.post('/login', authLimiter, adminLogin);

// Protected Admin Routes
router.get('/overview', verifyAdminToken, getSystemOverview);
router.get('/reports', verifyAdminToken, listReports);
router.patch('/reports/:reportId/resolve', verifyAdminToken, resolveReport);
router.post('/users/ban', verifyAdminToken, banUser);

export default router;
