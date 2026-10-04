const express = require('express');
const router = express.Router();
const {
  generatePayHereHash,
  handlePayHereNotify,
  getPayHereConfig
} = require('../controllers/payhereController');

router.post('/hash', generatePayHereHash);
router.post('/notify', handlePayHereNotify);
router.get('/config', getPayHereConfig);

module.exports = router;
