// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

/* ------------------------------------------------------------------ */
/*  SIGN‑UP : POST /auth/signup                                       */
/* ------------------------------------------------------------------ */
exports.signup = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username & password required' });

  const exists = await User.findOne({ username });
  if (exists) return res.status(409).json({ message: 'Username already taken' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, passwordHash });

  const token = genToken(user._id);

  /*  ── OPTION 1: Bearer‑token style (return in JSON) ────────────── */
  res.status(201).json({ token, id: user._id, username: user.username });

  /*  ── OPTION 2: Cookie style (uncomment if you prefer) ──────────
  res
    .cookie('token', token, { httpOnly: true, sameSite: 'lax' })
    .status(201)
    .json({ id: user._id, username: user.username });
  */
};

/* ------------------------------------------------------------------ */
/*  LOG‑IN : POST /auth/login                                         */
/* ------------------------------------------------------------------ */
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username & password required' });

  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const ok = await user.matchPassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = genToken(user._id);

  /*  OPTION 1 – Bearer token in JSON  */
  res.json({ token, id: user._id, username: user.username });

  /*  OPTION 2 – Cookie (uncomment)   */
  // res
  //   .cookie('token', token, { httpOnly: true, sameSite: 'lax' })
  //   .json({ id: user._id, username: user.username });
};

/* ------------------------------------------------------------------ */
/*  LOG‑OUT : POST /auth/logout                                       */
/* ------------------------------------------------------------------ */
exports.logout = (_req, res) => {
  /*  If you went with cookies, clear it:  */
  // res.clearCookie('token');
  res.json({ message: 'Logged out' });
};
