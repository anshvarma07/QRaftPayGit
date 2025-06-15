const express = require('express');
const auth = require('../middleware/auth');
const { getTransactions, createTransaction,getTransactionsByVendor } = require('../controllers/transaction.controller');
const router = express.Router();

router.get('/', auth, getTransactions);
router.get('/vendor/:vendorId', auth, getTransactionsByVendor);
router.post('/', auth, createTransaction);

module.exports = router;
