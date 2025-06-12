const express = require('express');
const auth = require('../middleware/auth');
const { getTransactions, createTransaction } = require('../controllers/transaction.controller');
const router = express.Router();

router.get('/', auth, getTransactions);
router.post('/', auth, createTransaction);

module.exports = router;
