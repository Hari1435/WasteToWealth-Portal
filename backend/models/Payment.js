const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'wallet', 'bank_transfer', 'razorpay'],
    required: false, // Will be set after payment completion
    default: 'card'
  },
  transactionId: {
    type: String,
    unique: true,
    required: false // Will be generated automatically
  },
  razorpayOrderId: String, // Store Razorpay order ID for verification
  gatewayTransactionId: String,
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  refundDetails: {
    refundId: String,
    refundAmount: Number,
    refundDate: Date,
    reason: String
  },
  platformFee: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Generate transaction ID before saving
paymentSchema.pre('save', function (next) {
  if (!this.transactionId) {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 11);
    this.transactionId = `TXN${timestamp}${randomStr}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);