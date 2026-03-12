const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );
}
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [normalizedEmail]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), normalizedEmail, passwordHash, 'USER']
    );
    const user = {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail,
      role: 'USER'
    };
    const token = createToken(user);
    return res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
});
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const [rows] = await pool.query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = ?',
      [normalizedEmail]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    const token = createToken(safeUser);
    return res.json({ token, user: safeUser });
  } catch (error) {
    next(error);
  }
});
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Email not registered.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      'UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?',
      [otp, expiry, normalizedEmail]
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}. It expires in 5 minutes.`
    });

    res.json({ message: 'OTP sent to your email.' });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const [rows] = await pool.query(
      'SELECT otp, otp_expiry FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = rows[0];

    if (user.otp != otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({ message: 'OTP expired.' });
    }

    res.json({ message: 'OTP verified successfully.' });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password_hash = ?, otp = NULL, otp_expiry = NULL WHERE email = ?',
      [passwordHash, normalizedEmail]
    );

    res.json({ message: 'Password reset successful.' });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
