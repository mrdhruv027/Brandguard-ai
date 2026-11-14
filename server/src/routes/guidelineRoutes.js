const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadGuideline,
  getGuidelines,
  getRules,
  createRule,
  updateRule,
  deleteRule
} = require('../controllers/guidelineController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

// Guidelines
router.get('/guidelines', protect, getGuidelines);
router.post(
  '/guidelines/upload',
  protect,
  authorize('compliance_admin', 'brand_manager'),
  upload.single('file'),
  uploadGuideline
);

// Rules
router.get('/rules', protect, getRules);
router.post('/rules', protect, authorize('compliance_admin', 'brand_manager'), createRule);
router.put('/rules/:id', protect, authorize('compliance_admin', 'brand_manager'), updateRule);
router.delete('/rules/:id', protect, authorize('compliance_admin'), deleteRule);

module.exports = router;
