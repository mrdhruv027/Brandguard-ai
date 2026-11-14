const express = require('express');
const router = express.Router();
const { addComment, submitDecision } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/submissions/:id/comments', protect, addComment);
router.post(
  '/submissions/:id/decision',
  protect,
  authorize('brand_manager', 'compliance_admin'),
  submitDecision
);

module.exports = router;
