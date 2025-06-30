const express = require('express');
const mongoose = require('./config/mongo');
const redisClient = require('./config/redis');
const morgan = require('morgan');
const cors = require('cors');
const urlRoutes = require('./routes/url.js');
const statsRoute = require('./routes/stats');
const redirectRoute = require('./routes/redirect');
const rateLimiter = require('./middlewares/rateLimiter');
const authRoutes =  require("./routes/auth.js");
const auth   = require('./middlewares/auth');

const app = express();
require('dotenv').config();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,   // http://localhost:5173
  credentials: true,                   // allow cookies (for JWT)
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(rateLimiter);

app.use('/', redirectRoute); 
app.use("/auth", authRoutes);

app.use(auth); 


app.use('/urls', urlRoutes); 


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
