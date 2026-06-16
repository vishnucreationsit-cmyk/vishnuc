const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/mailer');

// In-memory OTP store: { email: { otp, expiresAt } }
const adminOtpStore = new Map();

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

// Send OTP to Admin email for passwordless login
const sendAdminOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user and verify they are an ADMIN
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized: Not a valid admin account' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    adminOtpStore.set(email.trim().toLowerCase(), { otp, expiresAt });

    // Send OTP via email
    const emailSent = await sendEmail({
      email: email.trim().toLowerCase(),
      subject: 'Your Admin Login OTP - Vishnu Creations',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1a1a2e; border-radius: 16px; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: rgba(239,68,68,0.15); border-radius: 50%; padding: 16px; border: 1px solid rgba(239,68,68,0.3);">
              <span style="font-size: 28px;">🔐</span>
            </div>
          </div>
          <h2 style="text-align: center; color: #ffffff; margin-bottom: 8px; font-size: 22px;">Admin Login Verification</h2>
          <p style="text-align: center; color: #9ca3af; font-size: 14px; margin-bottom: 28px;">Use the OTP below to sign in to your admin dashboard</p>
          <div style="background: #16213e; border: 1px solid #2a2a4a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">Your One-Time Password</p>
            <p style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ef4444; margin: 0;">${otp}</p>
          </div>
          <p style="text-align: center; color: #6b7280; font-size: 12px;">This OTP expires in <strong style="color: #ef4444;">5 minutes</strong>. Do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #2a2a4a; margin: 24px 0;" />
          <p style="text-align: center; color: #4b5563; font-size: 11px;">Vishnu Creations ERP System</p>
        </div>
      `,
    });

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
    }

    res.json({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify Admin OTP and log in
const verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const storedData = adminOtpStore.get(normalizedEmail);

    if (!storedData) {
      return res.status(401).json({ message: 'No OTP found. Please request a new one.' });
    }

    // Check expiry
    if (Date.now() > storedData.expiresAt) {
      adminOtpStore.delete(normalizedEmail);
      return res.status(401).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check OTP match
    if (storedData.otp !== otp.trim()) {
      return res.status(401).json({ message: 'Invalid OTP. Please try again.' });
    }

    // OTP is valid — delete it (single use)
    adminOtpStore.delete(normalizedEmail);

    // Fetch the admin user
    const user = await User.findOne({ email: normalizedEmail, role: 'ADMIN' });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ message: 'Admin account not found or inactive.' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshTokenValue = generateRefreshToken(user._id);

    // Set refresh token in HttpOnly cookie
    res.cookie('jwt', refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerUser, loginUser, logoutUser, refreshToken, employeeLogin, sendAdminOtp, verifyAdminOtp };
