const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  runAnalysis,
  applySuggestion,
  ignoreFinding,
  reviseContent,
  submitForReview
} = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

router.post('/submissions', protect, upload.single('file'), createSubmission);
router.get('/submissions', protect, getSubmissions);
router.get('/submissions/:id', protect, getSubmissionById);
router.post('/submissions/:id/analyze', protect, runAnalysis);
router.post('/submissions/:id/apply-suggestion', protect, applySuggestion);
router.post('/submissions/:id/ignore-finding', protect, ignoreFinding);
router.post('/submissions/:id/revise', protect, reviseContent);
router.post('/submissions/:id/submit-for-review', protect, submitForReview);

module.exports = router;
