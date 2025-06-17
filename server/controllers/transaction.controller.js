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
  try {
    const { vendorId, amount, remarks, qrCode,type } = req.body;
    const buyerId = req.user.id; // Assuming req.user.id correctly provides the buyer's ID.
    const transaction = await Transaction.create({
      buyerId,
      vendorId,
      amount,
      remarks,
      qrCode,
      type //['debit', 'credit', 'payment']
    });

    res.json({ success: true, data: { message: 'Transaction created', transaction } });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Settlement logic to handle settling transactions between vendor and buyer
exports.settleTransactions = async (req, res) => {
  try {
    const { vendorId, buyerId, paymentAmount } = req.body; // Renamed 'amount' to 'paymentAmount' for clarity

    // Input validation
    if (!vendorId || !buyerId || typeof paymentAmount !== 'number' || paymentAmount < 0) {
      return res.status(400).json({ success: false, message: 'Vendor ID, Buyer ID, and a valid payment amount (non-negative) are required' });
    }

    let remainingPayment = paymentAmount; // Amount still left to apply from the current payment
    let totalAmountAppliedToDebits = 0; // Total portion of the payment that settled debits
    const debitsUpdated = []; // To track which specific debit transactions were affected

    // Step 1: Record the incoming payment as a new transaction
    const paymentTransaction = await Transaction.create({
      buyerId,
      vendorId,
      amount: -paymentAmount, // Negative amount signifies money coming INTO the vendor's account
      type: 'payment',
      remarks: `Payment received from Buyer ID: ${buyerId} for ₹${paymentAmount}`,
      paymentStatus: 'Paid', // The payment itself is 'Paid' (i.e., completed)
      // No outstandingAmount for 'payment' type
    });

    // Step 2: Find all outstanding 'debit' transactions (where buyer owes vendor)
    // Ordered by 'createdAt' to ensure oldest debts are settled first (First-In, First-Out)
    const outstandingDebits = await Transaction.find({
      vendorId: mongoose.Types.ObjectId(vendorId),
      buyerId: mongoose.Types.ObjectId(buyerId),
      type: 'debit',
      paymentStatus: { $in: ['Pending', 'Partially Paid'] } // Only consider debts that are not fully paid
    }).sort({ createdAt: 1 }); // Sort by creation date in ascending order (oldest first)


    // Step 3: Iterate through outstanding debits and apply the payment
    for (const debit of outstandingDebits) {
      if (remainingPayment <= 0) break; // If no payment amount is left, stop processing

      const amountToApplyToThisDebit = Math.min(debit.outstandingAmount, remainingPayment);

      debit.outstandingAmount -= amountToApplyToThisDebit;
      remainingPayment -= amountToApplyToThisDebit;
      totalAmountAppliedToDebits += amountToApplyToThisDebit;

      // Update payment status based on remaining outstanding amount
      if (debit.outstandingAmount === 0) {
        debit.paymentStatus = 'Paid';
        debit.paymentDate = new Date(); // Mark when this specific debt was fully paid
      } else {
        debit.paymentStatus = 'Partially Paid';
      }

      await debit.save(); // Save the updated debit transaction to the database
      debitsUpdated.push({
        transactionId: debit._id,
        originalAmount: debit.amount,
        amountApplied: amountToApplyToThisDebit,
        newOutstanding: debit.outstandingAmount,
        newStatus: debit.paymentStatus
      });
    }

    // Step 4: Calculate the current overall outstanding balance for the buyer
    const currentOutstandingBalanceResult = await Transaction.aggregate([
      {
        $match: {
          vendorId: mongoose.Types.ObjectId(vendorId),
          buyerId: mongoose.Types.ObjectId(buyerId),
          type: 'debit',
          paymentStatus: { $in: ['Pending', 'Partially Paid'] } // Sum up only remaining outstanding debits
        }
      },
      {
        $group: {
          _id: null,
          totalOutstanding: { $sum: '$outstandingAmount' }
        }
      }
    ]);

    const remainingDue = currentOutstandingBalanceResult.length > 0 ? currentOutstandingBalanceResult[0].totalOutstanding : 0;

    console.log(`Settlement processed for Vendor:${vendorId} & Buyer:${buyerId}`);
    console.log(`Payment received: ₹${paymentAmount}`);
    console.log(`Amount applied to debits: ₹${totalAmountAppliedToDebits}`);
    console.log(`Remaining unapplied payment (overpayment): ₹${remainingPayment}`);
    console.log(`New overall outstanding balance: ₹${remainingDue}`);


    return res.status(200).json({
      success: true,
      message: 'Settlement processed successfully',
      data: {
        paymentReceived: paymentAmount,
        amountAppliedToDebits: totalAmountAppliedToDebits,
        remainingPaymentUnapplied: remainingPayment, // This will be > 0 if buyer overpaid
        currentOverallDue: remainingDue, // The buyer's total remaining debt
        paymentTransaction: paymentTransaction, // The record of the payment itself
        debitTransactionsUpdated: debitsUpdated, // Details of which specific debts were settled
      }
    });

  } catch (error) {
    console.error('Error in settlement:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
