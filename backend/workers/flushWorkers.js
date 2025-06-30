require('dotenv').config();
const redis = require('../src/config/redis');
const Url   = require('../src/models/Url');

async function flushOnce() {
  let cursor = '0';
  do {
    const [next, keys] = await redis.scan(cursor, 'MATCH', 'clicks:*', 'COUNT', 1000);
    cursor = next;

    if (keys.length) {
      const pipe   = redis.multi();
      keys.forEach(k => pipe.getDel(k));               // Redis ≥6.2
      const values = await pipe.exec();                // [['null','5'], ...]
      const bulk   = Url.collection.initializeUnorderedBulkOp();
      keys.forEach((k, i) => {
        const code  = k.slice(7);                      // strip "clicks:"
        const hits  = parseInt(values[i][1] || '0', 10);
        if (hits) bulk.find({ _id: code }).updateOne({ $inc: { clicks: hits } });
      });
      if (bulk.length) await bulk.execute();
    }
  } while (cursor !== '0');
}

setInterval(() => flushOnce().catch(console.error), 30_000); // every 30 s
console.log('flushClicks worker running');
