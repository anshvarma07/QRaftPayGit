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
  try {
    const QRCode = require('qrcode');
    const { vendorName } = req.body;

    if (!vendorName) {
      return res.status(400).json({ success: false, message: 'Vendor name is required' });
    }

    const qrData = `vendor:${vendorName}:${req.user.id}`;
    console.log('QR Data:', qrData);

    const qrImage = await QRCode.toDataURL(qrData);

    res.status(200).json({
      success: true,
      data: {
        qrCode: qrData,
        image: qrImage,
      },
    });
  } catch (error) {
    console.error('QR Generation Error:', error);
    res.status(500).json({ success: false, message: 'QR generation failed' });
  }
};


