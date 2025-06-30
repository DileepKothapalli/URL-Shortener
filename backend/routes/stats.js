const express = require('express');
const router  = express.Router();

const Url   = require('../models/url');
const redis = require('../config/redis');

router.get('/stats/:code', async (req, res) => {
  const { code } = req.params;

  try {
    const doc = await Url.findOne({ shortCode: code }).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });

    const pending = parseInt(await redis.get(`clicks:${code}`) || '0', 10);

    return res.json({
      shortCode: code,
      longUrl:   doc.longUrl,
      clicks:    (doc.clicks || 0) + pending,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    console.error('Stats error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
