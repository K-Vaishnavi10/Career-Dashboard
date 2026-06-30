const express = require('express');
const passport = require('passport');
const router = express.Router();
const { signToken, requireAuth } = require('../middleware/auth.middleware');
const { findUserById } = require('../db/userStore');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ---- Google ----
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google` }),
  (req, res) => {
    const token = signToken(req.user);
    res.redirect(`${FRONTEND_URL}/oauth-callback?token=${token}`);
  }
);

// ---- GitHub ----
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=github` }),
  (req, res) => {
    const token = signToken(req.user);
    res.redirect(`${FRONTEND_URL}/oauth-callback?token=${token}`);
  }
);

// ---- Current user / logout ----
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, provider: user.provider });
  } catch (err) {
    next(err);
  }
});

// JWTs are stateless, so "logout" is just the client discarding the token.
// This endpoint exists for a consistent API surface / future blacklist support.
router.post('/logout', requireAuth, (req, res) => {
  res.json({ success: true });
});

module.exports = router;
