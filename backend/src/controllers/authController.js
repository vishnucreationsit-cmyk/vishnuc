const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate Access Token with role-based expiry
const generateAccessToken = (id, role) => {
  const expiresIn = role === 'EMPLOYEE' ? '7d' : '1d';
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

// Generate Refresh Token (Long-lived)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, pin } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Role defaults to EMPLOYEE in schema, but can be set via request
    const user = await User.create({ name, email, password, role, pin });

    if (user) {
      res.status(201).json({
        message: 'User registered successfully',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Check if user is active
      if (user.status !== 'ACTIVE') {
        return res.status(403).json({ message: 'Your account is inactive. Please contact admin.' });
      }

      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      // Set refresh token in HttpOnly cookie
      res.cookie('jwt', refreshToken, {
        httpOnly: true, // Cannot be accessed via JS (prevents XSS)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
        sameSite: 'strict', // CSRF protection
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no refresh token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ message: 'Not authorized, invalid or inactive user' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, refresh token failed or expired' });
  }
};

const employeeLogin = async (req, res) => {
  try {
    const { email, pin } = req.body;
    const user = await User.findOne({ email, role: 'EMPLOYEE' });

    if (user && (await user.matchPin(pin))) {
      if (user.status !== 'ACTIVE') {
        return res.status(403).json({ message: 'Your account is inactive. Please contact admin.' });
      }

      const accessToken = generateAccessToken(user._id, user.role);
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or PIN' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerUser, loginUser, logoutUser, refreshToken, employeeLogin };
