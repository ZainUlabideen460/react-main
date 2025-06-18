const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded; // Store decoded user data (id, role, email)
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware for input validation
const validateRegisterInput = (req, res, next) => {
  const { name, cnic, email, role, aridno, semester, section, shift, teachersNo } = req.body;

  if (!role || !['student', 'teacher'].includes(role)) {
    return res.status(400).json({ error: 'Invalid or missing role' });
  }

  if (role === 'student') {
    if (!name || !cnic || !email || !aridno || !semester || !section || !shift) {
      return res.status(400).json({ error: 'Missing required student fields' });
    }
  } else if (role === 'teacher') {
    if (!name || !cnic || !email || !teachersNo) {
      return res.status(400).json({ error: 'Missing required teacher fields' });
    }
  }

  next();
};

const validateLoginInput = (req, res, next) => {
  const { email, cnic } = req.body;

  if (!email || !cnic) {
    return res.status(400).json({ error: 'Email and CNIC are required' });
  }

  next();
};

const requireTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied. Teachers only.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  validateRegisterInput,
  validateLoginInput,
  requireTeacher
};