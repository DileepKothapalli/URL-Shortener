const Url = require('../models/url');
const { nanoid } = require('nanoid');
const validator  = require('validator');
const redis = require('../config/redis');

const ONE_DAY = 60 * 60 * 24; // seconds

exports.shortenUrl = async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).json({ message: 'Missing URL' });

  if (!validator.isURL(longUrl, { require_protocol: true }))
    return res.status(400).json({ message: 'Invalid URL' });

  /* 1️⃣  generate a unique shortCode (retry if collision) */
  let shortCode;
  for (;;) {
    shortCode = nanoid(7);                    // ~ 3.5T combos
    const exists = await Url.exists({ shortCode });
    if (!exists) break;
  }

  /* 2️⃣  build the shareable link */
  const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

  /* 3️⃣  save to Mongo with owner = current user */
  await Url.create({
    shortCode,
    longUrl,
    owner: req.user.id,       // ← comes from auth middleware
  });

  /* 4️⃣  cache in Redis for 24 h to speed up redirects */
  await redis.set(shortCode, longUrl, 'EX', ONE_DAY);

  /* 5️⃣  return everything the frontend needs */
  res.status(201).json({
    shortCode,
    shortUrl,
    longUrl,
    clickCount: 0,
  });
};


exports.getMyUrls = async (req, res) => {
  // 1️⃣  Load all URLs owned by the current user
  const urls = await Url
    .find({ owner: req.user.id })
    .sort({ createdAt: -1 })
    .lean();                       // plain objects

  const base = process.env.BASE_URL;

  // 2️⃣  Build the list of Redis keys: clicks:<shortCode>
  const redisKeys = urls.map((u) => `clicks:${u.shortCode}`);

  // 3️⃣  Fetch all pending counts in one round‑trip (mget)
  const pendingArr = redisKeys.length
    ? await redis.mget(...redisKeys)
    : [];

  // 4️⃣  Merge Mongo + Redis data
  const result = urls.map((u, idx) => {
    const pending = parseInt(pendingArr[idx] || '0', 10);
    return {
      shortCode: u.shortCode,
      shortUrl:  `${base}/${u.shortCode}`,
      longUrl:   u.longUrl,
      clicks:    (u.clickCount || 0) + pending,
      createdAt: u.createdAt,
    };
  });

  res.json(result);
};