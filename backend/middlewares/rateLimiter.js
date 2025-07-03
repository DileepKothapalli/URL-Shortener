const redis = require('../config/redis');

function buildLimiter({ prefix, windowSec, max, failOpen = true }) {
  if (!prefix || !windowSec || !max) {
    console.log(prefix)
    console.log(windowSec)
    console.log(max)
    throw new Error('buildLimiter: prefix, windowSec and max are required');
  }

  return async function rateLimiter(req, res, next) {
    try {
      const ip  = req.ip;                       // trust‑proxy set at app level
      const key = `${prefix}:${ip}`;
      const n   = await redis.incr(key);
      if (n === 1) await redis.expire(key, windowSec);
      if (n > max) {
        
        res.set('Retry-After', windowSec);
        return res.status(429).send('Too many requests');
      }
      return next();
    } catch (err) {
      console.error('Rate limiter error', err);

      if (failOpen) return next();
      return res.status(503).send('Rate‑limit service unavailable');
    }
  };
}

module.exports = buildLimiter;
