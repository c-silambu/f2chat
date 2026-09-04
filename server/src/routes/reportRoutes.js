import express from 'express';
import { createReport } from '../controllers/reportController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', apiLimiter, createReport);

export default router;
