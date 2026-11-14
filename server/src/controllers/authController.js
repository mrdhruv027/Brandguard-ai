const Store = require('../models/store');
const { generateToken } = require('../middleware/authMiddleware');

// Get all demo accounts for quick role switching
const getDemoUsers = async (req, res) => {
  try {
    const users = await Store.users.find();
    const sanitized = users.map(u => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar
    }));
    return res.json({ success: true, users: sanitized });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await Store.users.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // For demo purposes accept 'password123' or matching password
    if (user.password !== password && password !== 'password123') {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        avatar: user.avatar
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password required' });
    }

    const existing = await Store.users.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const allowedRoles = ['creator', 'brand_manager', 'compliance_admin'];
    const assignedRole = allowedRoles.includes(role) ? role : 'creator';

    const newUser = await Store.users.create({
      name,
      email,
      password,
      role: assignedRole,
      organizationId: 'org-innovexa-001',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    });

    const token = generateToken(newUser);
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organizationId: newUser.organizationId,
        avatar: newUser.avatar
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Current user profile
const getMe = async (req, res) => {
  try {
    const user = req.user;
    return res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        avatar: user.avatar
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDemoUsers,
  login,
  register,
  getMe
};
