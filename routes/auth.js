const express = require('express');
const nodemailer = require('nodemailer');
const { URL } = require('url');
const {
  createUser,
  verifyUser,
  getUserByEmail,
  getUserById,
  createResetToken,
  getResetToken,
  markTokenUsed,
  updatePassword
} = require('../db');

const router = express.Router();

function ensureLoggedIn(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'unauthorized' });
  next();
}

router.post('/register', async (req, res) => {
  const { email, password, confirm } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password !== confirm) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const user = await createUser(email, password);
    req.session.user = { id: user.id, email: user.email };
    return res.json({ ok: true, user: { email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await verifyUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.user = { id: user._id?.toString?.() || user.id, email: user.email };
    res.json({ ok: true, user: { email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', ensureLoggedIn, (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found for this email' });
    }
    const { token } = await createResetToken(user._id?.toString?.() || user.id);

    const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${appUrl}/reset/${token}`;
    console.log('Sending reset email with URL:', resetUrl);

    let transporter;
    if (process.env.SMTP_HOST && (process.env.SMTP_USER || process.env.SMTP_PASS || process.env.SMTP_SECURE)) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Boolean(process.env.SMTP_SECURE === 'true'),
        auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        } : undefined
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to: user.email,
      subject: 'Reset your password',
      html: `<p>You requested a password reset.</p>
             <p>Click the link below to reset your password:</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>
             <p>This link will expire in 30 minutes.</p>`
    });

    const preview = nodemailer.getTestMessageUrl(info) || null;
    if (preview) {
      console.log('Password reset email preview URL:', preview);
    }

    res.json({ ok: true, preview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Failed to send reset email: ${err.message}` });
  }
});

router.get('/reset/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const record = await getResetToken(token);
    if (!record || record.used || record.expires_at < Math.floor(Date.now() / 1000)) {
      return res.status(400).json({ error: 'This reset link is invalid or expired.' });
    }
    res.json({ ok: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to open reset page.' });
  }
});

router.post('/reset/:token', async (req, res) => {
  const { token } = req.params;
  const { password, confirm } = req.body;
  try {
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (password !== confirm) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    const record = await getResetToken(token);
    if (!record || record.used || record.expires_at < Math.floor(Date.now() / 1000)) {
      return res.status(400).json({ error: 'This reset link is invalid or expired.' });
    }
    const user = await getUserById(record.user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    await updatePassword(user._id?.toString?.() || user.id, password);
    await markTokenUsed(token);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) return res.json({ user: null });
  res.json({ user: req.session.user });
});

module.exports = router;
