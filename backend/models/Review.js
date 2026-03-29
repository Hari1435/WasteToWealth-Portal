const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  reviewType: {
    type: String,
    enum: ['farmer_review', 'buyer_review'],
    required: true
  },
  aspects: {
    quality: Number, // 1-5
    communication: Number, // 1-5
    timeliness: Number, // 1-5
    packaging: Number // 1-5 (for farmer reviews)
  },
  isVerified: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure one review per order per user
reviewSchema.index({ order: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);