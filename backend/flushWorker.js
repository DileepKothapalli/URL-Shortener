// flushWorker.js  (new file or extracted from old worker)
require('dotenv').config();
const mongoose = require('mongoose');
const redis    = require('./config/redis');
const Url      = require('./models/url');

if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGO_URI, { bufferCommands: false });
}

async function flushOnce() {
  try {
    let cursor = '0';
    do {
      const [next, keys] = await redis.scan(
        cursor, 'MATCH', 'clicks:*', 'COUNT', 1000
      );
      cursor = next;
      if (!keys.length) continue;

      const pipe = redis.multi();
      keys.forEach(k => pipe.get(k));
      keys.forEach(k => pipe.del(k));
      const results = await pipe.exec();

      const bulk = Url.collection.initializeUnorderedBulkOp();
      let ops = 0;

      for (let i = 0; i < keys.length; i++) {
        const hits = +results[i][1] || 0;
        if (!hits) continue;
        const slug = keys[i].slice(7); // strip "clicks:"
        bulk.find({ shortCode: slug }).updateOne({ $inc: { clickCount: hits } });
        ops++;
      }
      if (ops) {
        await bulk.execute();
        console.log(`Flushed ${ops} click(s)`);
      }
    } while (cursor !== '0');
  } catch (err) {
    console.error('flushOnce error', err);
  }
}

module.exports = { flushOnce };