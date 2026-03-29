const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  phone: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['farmer', 'buyer'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
    coordinates: {
      type: [Number], // [longitude, latitude] - GeoJSON format
      index: '2dsphere'
    },
    lat: Number, // For easier access
    lng: Number  // For easier access
  },
  // Farmer specific fields
  farmDetails: {
    farmSize: Number, // in acres
    cropTypes: [String],
    farmingExperience: Number // in years
  },
  // Buyer specific fields
  companyDetails: {
    companyName: String,
    companyType: {
      type: String,
      enum: ['fertilizer', 'biogas', 'compost', 'paper', 'construction', 'animal', 'textile', 'other']
    },
    gstNumber: String,
    licenseNumber: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: String,
  otpExpires: Date,
  profileImage: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  // Earnings tracking (for farmers)
  earnings: {
    totalEarnings: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    thisMonthEarnings: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);