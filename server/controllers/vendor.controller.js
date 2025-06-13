const Transaction = require('../models/transaction.model');

exports.getDashboard = async (req, res) => {
  const vendorId = req.user.id;
  const transactions = await Transaction.find({ vendorId });

  const totalEarnings = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  res.json({
    success: true,
    data: {
      totalEarnings,
      totalTransactions: transactions.length,
      recentTransactions: transactions.slice(-5),
    },
  });
};

exports.generateQR = async (req, res) => {
  const QRCode = require('qrcode');
  const qrData = `vendor:${req.body.vendorName}:${req.user.id}`;
  console.log(qrData)
  const qrImage = await QRCode.toDataURL(qrData);
  res.json({ success: true, data: { qrCode: qrData, image: qrImage } });
};


