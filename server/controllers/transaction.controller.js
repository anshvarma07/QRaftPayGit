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

    const transactions = await Transaction.find({ vendorId })
      .sort({ createdAt: -1 }) 
      .populate('vendorId buyerId');

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

// Settlement logic to handle settling transactions between vendor and buyer
exports.settleTransactions = async (req, res) => {
  try {
    const { vendorId, buyerId, amount } = req.body;

    if (!vendorId || !buyerId || typeof amount !== 'number') {
      return res.status(400).json({ success: false, message: 'Vendor ID, Buyer ID, and amount are required' });
    }

    // Step 1: Fetch all previous transactions
    const transactions = await Transaction.find({ vendorId, buyerId });

    if (transactions.length === 0) {
      return res.status(404).json({ success: false, message: 'No transactions found to settle' });
    }

    // Step 2: Calculate total amount due
    const totalDue = transactions.reduce((sum, txn) => sum + txn.amount, 0);

    // Step 3: Delete old transactions
    await Transaction.deleteMany({ vendorId, buyerId });

    // Step 4: Create new settlement transaction
    let remarks = 'Settlement Transaction';
    let finalAmount = 0;

    if (amount === totalDue) {
      remarks = 'Settlement Completed';
      finalAmount = 0;
    } else if (amount < totalDue) {
      remarks = 'Auto Transaction for Settlement';
      finalAmount = totalDue - amount;
    } else {
      remarks = 'Settlement Overpaid';
      finalAmount = 0;
    }

    const settlementTxn = await Transaction.create({
      buyerId,
      vendorId,
      amount: finalAmount,
      remarks,
      qrCode: '',
    });
    console.log(`Settlement for Vendor:${vendorId} & Buyer:${buyerId} | Paid: ₹${amount}, Due: ₹${totalDue}`);
    return res.status(200).json({
      success: true,
      message: 'Settlement processed successfully',
      data: {
        totalDue,
        amountPaid: amount,
        remainingDue: finalAmount,
        settlementTransaction: settlementTxn
      }
    });

  } catch (error) {
    console.error('Error in settlement:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
