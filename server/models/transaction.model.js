const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // The original amount of the transaction
  type: {
    type: String,
    enum: ['debit', 'credit', 'payment'], // 'debit': buyer owes vendor; 'credit': vendor reduces buyer's debt; 'payment': buyer pays vendor
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partially Paid', 'Paid'], // Status for 'debit' type transactions
    default: 'Pending'
  },
  outstandingAmount: { type: Number, default: 0 }, // For 'debit' type transactions: the remaining amount due for *this specific debt entry*
  remarks: String,
  qrCode: String,
  createdAt: { type: Date, default: Date.now },
  paymentDate: Date, // Date when a 'debit' transaction's outstanding amount was last reduced or fully paid
  // Optional: You could add a reference to the 'payment' transaction that settled this specific 'debit'
  // settledByPayment: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
});

// Pre-save hook to set outstandingAmount for new 'debit' transactions
transactionSchema.pre('save', function(next) {
  if (this.isNew && this.type === 'debit') {
    this.outstandingAmount = this.amount; // When a new debit is created, its outstanding amount is initially its full amount
  }
  next();
});


module.exports = mongoose.model('Transaction', transactionSchema);