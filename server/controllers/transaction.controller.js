const Transaction = require('../models/transaction.model');

exports.getTransactions = async (req, res) => {
  const userId = req.user.id;
  const transactions = await Transaction.find({
    $or: [{ buyerId: userId }, { vendorId: userId }],
  }).populate('vendorId buyerId');
  res.json({ success: true, data: transactions });
};

exports.createTransaction = async (req, res) => {
  const { vendorId, amount, remarks, qrCode } = req.body;
  const buyerId = req.user.id;
  const transaction = await Transaction.create({ buyerId, vendorId, amount, remarks, qrCode });
  res.json({ success: true, data: { message: 'Transaction created', transaction } });
};
