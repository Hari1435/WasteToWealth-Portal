const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: false // Will be generated in pre-save hook
  },
  waste: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Waste',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    amount: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'farmer_review', 'accepted', 'rejected', 'paid', 'shipped', 'delivered', 'cancelled', 'completed', 'in_progress', 'payment_pending', 'payment_failed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  deliveryDetails: {
    method: {
      type: String,
      enum: ['pickup', 'delivery'],
      required: true
    },
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    scheduledDate: Date,
    actualDate: Date,
    trackingNumber: String,
    courierService: String,
    estimatedDeliveryDate: Date,
    deliveryInstructions: String
  },

  // Distance and Location Information
  distanceInfo: {
    type: {
      distanceKm: {
        type: Number,
        default: 0
      },
      durationMinutes: {
        type: Number,
        default: 0
      },
      calculationMethod: {
        type: String,
        enum: ['rapidapi', 'geoapify', 'haversine', 'openroute'],
        default: 'haversine',
        required: false
      },
      pickupLocation: {
        address: String,
        coordinates: {
          lat: Number,
          lng: Number
        }
      },
      deliveryLocation: {
        address: String,
        coordinates: {
          lat: Number,
          lng: Number
        }
      }
    },
    required: false,
    default: undefined
  },

  // Truck and Delivery Information
  truckDetails: {
    truckType: String,
    truckName: String,
    capacity: Number,
    deliveryCost: Number,
    costBreakdown: {
      baseCost: Number,
      fuelCost: Number,
      handlingCharges: Number,
      totalCost: Number
    },
    estimatedTime: Number, // in minutes
    fuelEfficiency: Number,
    selectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    selectedAt: Date
  },

  // Manual Delivery Charges (Set by Farmer)
  deliveryCharges: {
    type: Number,
    default: 0
  },
  deliveryNotes: {
    type: String,
    default: ''
  },
  finalAmount: {
    type: Number // totalAmount + deliveryCharges
  },
  
  // Enhanced Pricing
  pricing: {
    wasteAmount: Number, // Original waste cost
    deliveryCharges: Number, // Truck delivery cost
    totalAmount: Number, // wasteAmount + deliveryCharges
    currency: {
      type: String,
      default: 'INR'
    }
  },

  shippingDetails: {
    shippedDate: Date,
    trackingNumber: String,
    courierService: String,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    deliveryStatus: {
      type: String,
      enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'],
      default: 'pending'
    },
    deliveryNotes: String
  },
  notes: String,
  farmerNotes: String,
  buyerNotes: String,
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  console.log('🔄 Pre-save hook triggered for order');
  
  if (!this.orderNumber) {
    try {
      console.log('🔢 Generating order number...');
      const count = await mongoose.model('Order').countDocuments();
      const timestamp = Date.now();
      const orderNumber = `ORD${timestamp}${String(count + 1).padStart(3, '0')}`;
      this.orderNumber = orderNumber;
      console.log('✅ Generated order number:', orderNumber);
    } catch (error) {
      console.error('❌ Error generating order number:', error);
      // Enhanced fallback order number generation
      const fallbackNumber = `ORD${Date.now()}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      this.orderNumber = fallbackNumber;
      console.log('🔄 Using fallback order number:', fallbackNumber);
    }
  } else {
    console.log('📋 Order number already exists:', this.orderNumber);
  }
  
  // Ensure orderNumber is always present
  if (!this.orderNumber) {
    const emergencyNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    this.orderNumber = emergencyNumber;
    console.log('🚨 Emergency order number generated:', emergencyNumber);
  }
  
  next();
});

// Validate that orderNumber exists after save
orderSchema.post('save', function(doc) {
  if (!doc.orderNumber) {
    console.error('🚨 CRITICAL: Order saved without orderNumber!', doc._id);
  } else {
    console.log('✅ Order saved successfully with number:', doc.orderNumber);
  }
});

module.exports = mongoose.model('Order', orderSchema);