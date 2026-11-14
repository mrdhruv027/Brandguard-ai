const express = require('express');
const router = express.Router();
const { getDemoUsers, login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/demo-users', getDemoUsers);
router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);

module.exports = router;
