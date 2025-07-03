const express = require('express');
const mongoose = require('./config/mongo');
const redisClient = require('./config/redis');
const morgan = require('morgan');
const cors = require('cors');
const urlRoutes = require('./routes/url.js');
const statsRoute = require('./routes/stats');
const redirectRoute = require('./routes/redirect');
// const rateLimiter = require('./middlewares/rateLimiter');
const authRoutes =  require("./routes/auth.js");
const auth   = require('./middlewares/auth');
const buildLimiter = require('./middlewares/rateLimiter');

const app = express();
require('dotenv').config();



const whitelist = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      // requests like curl/Postman have no Origin header
      if (!origin) return cb(null, true);

      if (whitelist.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS: ' + origin));
    }
  })
);


app.use(morgan('dev'));
app.use(express.json());
// app.use(rateLimiter);



const redirectLimiter = buildLimiter({ prefix: 'redir',  windowSec: 60, max: 600 });
const createLimiter   = buildLimiter({ prefix: 'create', windowSec: 60, max: 60 });
 

app.use('/',redirectLimiter, redirectRoute); 
app.use("/auth", authRoutes);

app.use(auth); 

app.use('/urls',createLimiter, urlRoutes); 


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
