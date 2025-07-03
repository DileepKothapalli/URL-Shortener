// controllers/redirectController.js
const Url   = require('../models/url');
const redis = require('../config/redis');
const { flushOnce } = require('../flushWorker'); 

const ONE_DAY = 60 * 60 * 24; // seconds

const FLUSH_INTERVAL = 30_000; // 30 s
let   lastFlush      = 0;
let   flushing       = null;   // in‑flight Promise

function maybeFlush () {
  const now = Date.now();
  if (now - lastFlush < FLUSH_INTERVAL) return; // too soon
  if (flushing) return;                         // already running

  lastFlush = now;
  // off‑load to next tick so redirect returns instantly
  setImmediate(() => {
    flushing = flushOnce()
      .catch(err => console.error('flushOnce error', err))
      .finally(() => { flushing = null; });
  });
}


exports.redirectUrl = async (req, res) => {
  const { shortCode } = req.params;

  try {
    /* 1️⃣  Atomically get longUrl and bump the click counter */
    const pipe   = redis.multi();
    pipe.get(shortCode);                    // fetch cached URL (may be null)
    pipe.incr(`clicks:${shortCode}`);       // bump click counter
    const [[, longUrl]] = await pipe.exec(); // [[null, value], [null, 6]];

    /* 2️⃣  Cache miss → load from Mongo and stash in Redis */
    let target = longUrl;

    if (!target) {
      const doc = await Url.findOne({ shortCode }).lean();
      if (!doc) return res.status(404).send('Not found');

      target = doc.longUrl;
      await redis.set(shortCode, target, 'EX', ONE_DAY);
    }

    maybeFlush();    

    /* 3️⃣  Redirect */
    res.redirect(target); // 302 by default
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).send('Server error');
  }
};
