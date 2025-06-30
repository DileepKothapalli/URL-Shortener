const express = require('express');
const router = express.Router();
const { redirectUrl } = require('../controllers/redirectController');

//   GET /:shortCode   → 302 <longUrl>
router.get('/:shortCode', redirectUrl);

module.exports = router;
