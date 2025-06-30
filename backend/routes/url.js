const express = require('express');
const router = express.Router();
const {shortenUrl,getMyUrls} = require("../controllers/urlController")
router.post('/shorten', shortenUrl);
router.get('/myUrls',getMyUrls)

module.exports = router;