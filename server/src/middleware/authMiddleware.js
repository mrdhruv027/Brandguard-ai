const jwt = require('jsonwebtoken');
const Store = require('../models/store');

const JWT_SECRET = process.env.JWT_SECRET || 'brandguard-hackathon-secret-key-2026';

// Generates token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Protect middleware (validates Bearer token or demo headers)
const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization Bearer header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Demo role impersonation header for rapid hackathon testing
  if (!token && req.headers['x-demo-role']) {
    const demoRole = req.headers['x-demo-role'];
    const demoUsers = await Store.users.find({ role: demoRole });
    if (demoUsers && demoUsers.length > 0) {
      req.user = demoUsers[0];
      return next();
    }
  }

  if (!token) {
    // Default fallback to Creator user for friction-free judge experience if no token passed
    const defaultUser = await Store.users.findOne({ role: 'creator' });
    if (defaultUser) {
      req.user = defaultUser;
      return next();
    }
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Store.users.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token verification failed: ' + error.message });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource. Required: [${roles.join(', ')}]`
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
  generateToken,
  JWT_SECRET
};
