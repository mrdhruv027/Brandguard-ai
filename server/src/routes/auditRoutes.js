const express = require('express');
const router = express.Router();
const { getAuditLogs, getDashboardStats } = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');

router.get('/audit-logs', protect, getAuditLogs);
router.get('/stats/dashboard', protect, getDashboardStats);

module.exports = router;
