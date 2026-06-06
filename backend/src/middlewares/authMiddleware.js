const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT Access Token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user to the request object (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (req.user.status !== 'ACTIVE') {
        return res.status(401).json({ message: 'Not authorized, user account is inactive' });
      }

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Role-based authorization middleware
// Usage: authorizeRoles('ADMIN', 'MANAGER')
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: Role (${req.user ? req.user.role : 'none'}) is not allowed to access this resource` 
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
