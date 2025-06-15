const Transaction = require('../models/transaction.model');

exports.getTransactions = async (req, res) => {
  const userId = req.user.id;
  const transactions = await Transaction.find({
    $or: [{ buyerId: userId }, { vendorId: userId }],
  }).populate('vendorId buyerId');
  res.json({ success: true, data: transactions });
};

exports.getTransactionsByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'Vendor ID is required' });
    }

    const transactions = await Transaction.find({ vendorId }).populate('vendorId buyerId');

    return res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions by vendor:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};



exports.createTransaction = async (req, res) => {
  const { vendorId, amount, remarks, qrCode } = req.body;
  const buyerId = req.user.id;
  const transaction = await Transaction.create({ buyerId, vendorId, amount, remarks, qrCode });
  res.json({ success: true, data: { message: 'Transaction created', transaction } });
};
