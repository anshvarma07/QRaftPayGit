const express = require('express');
const auth = require('../middleware/auth');
const { getDashboard, generateQR } = require('../controllers/vendor.controller');
const router = express.Router();

router.get('/dashboard', auth, getDashboard);
router.post('/generateQR', auth, generateQR);

module.exports = router;
