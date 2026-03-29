const mongoose = require('mongoose');

const wasteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  wasteType: {
    type: String,
    required: true,
    enum: ['crop_residue', 'fruit_peels', 'vegetable_waste', 'grain_husk', 'leaves', 'stems', 'other']
  },
  cropSource: {
    type: String,
    required: true // e.g., 'rice', 'wheat', 'sugarcane', 'corn'
  },
  quantity: {
    amount: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true,
      enum: ['tons'],
      default: 'tons'
    }
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  location: {
    address: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude] - GeoJSON format
      index: '2dsphere'
    },
    lat: Number, // For easier access
    lng: Number  // For easier access
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [String],
  availability: {
    from: {
      type: Date,
      required: true
    },
    to: {
      type: Date,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'sold_out', 'reserved', 'expired'],
    default: 'available'
  },

  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
wasteSchema.index({ wasteType: 1, 'location.city': 1, 'location.state': 1 });
wasteSchema.index({ farmer: 1 });
wasteSchema.index({ status: 1 });

module.exports = mongoose.model('Waste', wasteSchema);