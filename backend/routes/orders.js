const express = require('express');
const Order = require('../models/Order');
const Waste = require('../models/Waste');
const User = require('../models/User');
const { protect, protectVerified } = require('../middleware/auth');
const { convertToTons, calculatePrice, isQuantityAvailable } = require('../utils/unitConversions');
const { sendOrderCreatedNotification, sendOrderAcceptedNotification, sendOrderRejectedNotification } = require('../utils/orderEmailService');
const mlService = require('../services/mlService');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Order routes working!' });
});

// Calculate delivery charge using ML model
router.post('/calculate-delivery-charge', protectVerified, async (req, res) => {
  try {
    const { truck_type, quantity, distance, region, time_factor } = req.body;

    // Validate required fields
    if (!truck_type || !quantity || !distance) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: truck_type, quantity, distance'
      });
    }

    // Validate input ranges
    const quantityNum = parseFloat(quantity);
    const distanceNum = parseFloat(distance);
    const timeFactorNum = parseFloat(time_factor || 1.0);

    if (quantityNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    if (distanceNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Distance must be greater than 0'
      });
    }

    // Prepare order data for ML prediction
    const orderData = {
      truck_type: truck_type.toLowerCase(),
      quantity: quantityNum,
      distance: distanceNum,
      region: (region || 'suburban').toLowerCase(),
      time_factor: timeFactorNum
    };

    console.log('🚛 Calculating delivery charge:', orderData);

    // Get ML prediction with automatic fallback
    const result = await mlService.calculateDeliveryChargeWithFallback(orderData);

    console.log('💰 Delivery charge result:', result);

    res.json({
      success: true,
      delivery_charge: result.delivery_charge,
      method: result.method,
      confidence_range: result.confidence_range,
      details: result.details,
      input_parameters: orderData
    });

  } catch (error) {
    console.error('Delivery charge calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate delivery charge',
      error: error.message
    });
  }
});

// Batch calculate delivery charges for multiple truck options
router.post('/calculate-delivery-charges-batch', protectVerified, async (req, res) => {
  try {
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Orders array is required and must not be empty'
      });
    }

    console.log('🚛 Batch calculating delivery charges for', orders.length, 'options');

    // Get batch predictions
    const result = await mlService.predictBatchDeliveryCharges(orders);

    res.json({
      success: true,
      predictions: result.data.predictions,
      total_orders: result.data.total_orders,
      successful_predictions: result.data.successful_predictions,
      method: result.method
    });

  } catch (error) {
    console.error('Batch delivery charge calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate delivery charges',
      error: error.message
    });
  }
});

// Check ML API health
router.get('/ml-health', protectVerified, async (req, res) => {
  try {
    const health = await mlService.checkHealth();
    res.json({
      success: true,
      ml_api_status: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check ML API health',
      error: error.message
    });
  }
});

// Create order request (buyers only) - New flow with farmer review
router.post('/create-request', protectVerified, async (req, res) => {
  try {
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can create orders'
      });
    }

    const { 
      wasteId, 
      quantity, 
      deliveryDetails, 
      notes,
      distanceInfo 
    } = req.body;

    // Validate waste exists and is available
    const waste = await Waste.findById(wasteId);
    if (!waste) {
      return res.status(404).json({
        success: false,
        message: 'Waste listing not found'
      });
    }

    if (waste.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Waste is not available for purchase'
      });
    }

    // Check quantity availability (convert both to same unit for comparison)
    if (!isQuantityAvailable(quantity.amount, quantity.unit, waste.quantity.amount, waste.quantity.unit)) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${quantity.amount} ${quantity.unit}) exceeds available amount (${waste.quantity.amount} ${waste.quantity.unit})`
      });
    }

    // Calculate waste amount using unit conversion (pricing is always per ton)
    const wasteAmount = calculatePrice(quantity.amount, quantity.unit, waste.pricePerUnit);
    
    console.log('💰 Pricing calculation:', {
      requestedQuantity: `${quantity.amount} ${quantity.unit}`,
      convertedToTons: convertToTons(quantity.amount, quantity.unit),
      pricePerTon: waste.pricePerUnit,
      totalAmount: wasteAmount
    });

    // Prepare distance info with proper validation
    let validDistanceInfo = undefined; // Use undefined instead of null to avoid Mongoose validation
    if (distanceInfo && typeof distanceInfo === 'object') {
      // Ensure calculationMethod is valid
      const validMethods = ['rapidapi', 'geoapify', 'haversine', 'openroute'];
      const calculationMethod = distanceInfo.calculationMethod && validMethods.includes(distanceInfo.calculationMethod) 
        ? distanceInfo.calculationMethod 
        : 'haversine';
      
      validDistanceInfo = {
        distanceKm: parseFloat(distanceInfo.distanceKm) || 0,
        durationMinutes: parseInt(distanceInfo.durationMinutes) || 0,
        calculationMethod: calculationMethod,
        pickupLocation: distanceInfo.pickupLocation || undefined,
        deliveryLocation: distanceInfo.deliveryLocation || undefined
      };
    }

    // Create order with farmer_review status
    const orderData = {
      waste: wasteId,
      farmer: waste.farmer,
      buyer: req.user._id,
      quantity,
      totalAmount: wasteAmount, // Only waste cost initially
      status: 'farmer_review', // New status for farmer to review
      paymentStatus: 'pending',
      deliveryDetails,
      notes,
      pricing: {
        wasteAmount,
        deliveryCharges: 0, // To be set by farmer
        totalAmount: wasteAmount // Will be updated after farmer selects truck
      }
    };

    // Only include distanceInfo if it's properly defined
    if (validDistanceInfo) {
      orderData.distanceInfo = validDistanceInfo;
    }

    const order = new Order(orderData);

    // Ensure orderNumber is generated before save (backup)
    if (!order.orderNumber) {
      console.log('🔧 Manually generating order number as backup...');
      try {
        const count = await Order.countDocuments();
        const timestamp = Date.now();
        order.orderNumber = `ORD${timestamp}${String(count + 1).padStart(3, '0')}`;
        console.log('✅ Manually generated order number:', order.orderNumber);
      } catch (error) {
        console.error('❌ Manual generation failed, using fallback:', error);
        order.orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      }
    }

    console.log('💾 Attempting to save order...');
    console.log('📋 Order data:', {
      orderNumber: order.orderNumber,
      distanceInfo: order.distanceInfo,
      buyer: order.buyer,
      farmer: order.farmer
    });
    
    await order.save();
    console.log('✅ Order saved successfully with number:', order.orderNumber);

    // Populate order details
    await order.populate([
      { path: 'waste', select: 'title wasteType cropSource images location quantity pricePerUnit' },
      { path: 'farmer', select: 'name phone email' },
      { path: 'buyer', select: 'name phone email companyDetails' }
    ]);

    // Send email notification to farmer
    try {
      const emailResult = await sendOrderCreatedNotification(order, order.farmer, order.buyer, order.waste);
      if (emailResult.success) {
        console.log('✅ Order creation email sent to farmer');
      } else {
        console.error('❌ Failed to send order creation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Email notification error:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order request sent to farmer for review',
      data: { order }
    });
  } catch (error) {
    console.error('Create order request error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create order/purchase request (buyers only) - Redirects to payment
router.post('/create', protectVerified, async (req, res) => {
  try {
    // This endpoint now redirects to new flow
    res.status(200).json({
      success: true,
      message: 'Please use /api/orders/create-request endpoint for new order flow',
      redirectTo: '/api/orders/create-request'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get orders for farmer
router.get('/farmer/my-orders', protectVerified, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can access this endpoint'
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { farmer: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('waste', 'title wasteType cropSource images')
        .populate('buyer', 'name phone email companyDetails')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get orders for buyer
router.get('/buyer/my-orders', protectVerified, async (req, res) => {
  try {
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can access this endpoint'
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { buyer: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('waste', 'title wasteType cropSource images')
        .populate('farmer', 'name phone email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get order by ID
router.get('/:id', protectVerified, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('waste', 'title wasteType cropSource images location quantity pricePerUnit')
      .populate('farmer', 'name phone email')
      .populate('buyer', 'name phone email companyDetails');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to view this order
    if (order.farmer._id.toString() !== req.user._id.toString() && 
        order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update order status (farmers only)
router.put('/:id/status', protectVerified, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the farmer for this order
    if (order.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the farmer can update order status'
      });
    }

    // Update order status
    order.status = status;
    order.statusHistory.push({
      status,
      updatedBy: req.user._id,
      notes: notes || `Status updated to ${status}`
    });

    await order.save();

    // Populate order details
    await order.populate([
      { path: 'waste', select: 'title wasteType cropSource' },
      { path: 'farmer', select: 'name phone email' },
      { path: 'buyer', select: 'name phone email' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update shipping details (farmers only)
router.put('/:id/shipping', protectVerified, async (req, res) => {
  try {
    const { 
      trackingNumber, 
      courierService, 
      estimatedDeliveryDate, 
      deliveryStatus,
      deliveryNotes 
    } = req.body;
    
    console.log('Shipping update request:', {
      orderId: req.params.id,
      userId: req.user._id,
      deliveryStatus,
      trackingNumber,
      courierService
    });
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the farmer for this order
    if (order.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the farmer can update shipping details'
      });
    }

    // Update shipping details
    order.shippingDetails = {
      ...order.shippingDetails,
      trackingNumber: trackingNumber || order.shippingDetails.trackingNumber,
      courierService: courierService || order.shippingDetails.courierService,
      estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : order.shippingDetails.estimatedDeliveryDate,
      deliveryStatus: deliveryStatus !== undefined ? deliveryStatus : order.shippingDetails.deliveryStatus,
      deliveryNotes: deliveryNotes !== undefined ? deliveryNotes : order.shippingDetails.deliveryNotes
    };

    // Auto-update dates based on status
    if (deliveryStatus === 'picked_up' && !order.shippingDetails.shippedDate) {
      order.shippingDetails.shippedDate = new Date();
      order.status = 'in_progress';
    } else if (deliveryStatus === 'delivered') {
      order.shippingDetails.actualDeliveryDate = new Date();
      order.status = 'completed';
    }

    // Add to status history
    order.statusHistory.push({
      status: deliveryStatus === 'delivered' ? 'completed' : 'in_progress',
      updatedBy: req.user._id,
      notes: `Shipping updated: ${deliveryStatus}${trackingNumber ? ` - Vehicle: ${trackingNumber}` : ''}`
    });

    await order.save();

    // Populate order details
    await order.populate([
      { path: 'waste', select: 'title wasteType cropSource' },
      { path: 'farmer', select: 'name phone email' },
      { path: 'buyer', select: 'name phone email' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Shipping details updated successfully',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Farmer accepts order with manual delivery charges
router.post('/:id/accept', protectVerified, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can accept orders'
      });
    }

    const { deliveryCharges, deliveryNotes, farmerNotes } = req.body;
    
    if (!deliveryCharges || deliveryCharges <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid delivery charges are required'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the farmer for this order
    if (order.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if order is in correct status
    if (order.status !== 'farmer_review') {
      return res.status(400).json({
        success: false,
        message: 'Order is not available for review'
      });
    }

    // Update order with manual delivery charges
    const deliveryChargesNum = Number(deliveryCharges);
    const finalTotalAmount = order.totalAmount + deliveryChargesNum;
    
    order.deliveryCharges = deliveryChargesNum;
    order.deliveryNotes = deliveryNotes || '';
    order.finalAmount = finalTotalAmount;
    order.farmerNotes = farmerNotes || '';
    order.status = 'accepted'; // Ready for payment
    
    // Update pricing
    order.pricing = {
      wasteAmount: order.totalAmount,
      deliveryCharges: deliveryChargesNum,
      totalAmount: finalTotalAmount,
      currency: 'INR'
    };
    
    // Update the main totalAmount to reflect final amount including delivery charges
    order.totalAmount = finalTotalAmount;
    
    // Add to status history
    order.statusHistory.push({
      status: 'accepted',
      updatedBy: req.user._id,
      notes: `Order accepted with delivery charges: ₹${deliveryCharges}${deliveryNotes ? ` - ${deliveryNotes}` : ''}`
    });

    await order.save();

    // Populate order details
    await order.populate([
      { path: 'waste', select: 'title wasteType cropSource images' },
      { path: 'farmer', select: 'name phone email' },
      { path: 'buyer', select: 'name phone email companyDetails' }
    ]);

    // Send email notification to buyer
    try {
      const emailResult = await sendOrderAcceptedNotification(order, order.farmer, order.buyer, order.waste);
      if (emailResult.success) {
        console.log('✅ Order acceptance email sent to buyer');
      } else {
        console.error('❌ Failed to send order acceptance email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Email notification error:', emailError);
      // Don't fail the order acceptance if email fails
    }

    console.log('✅ Order accepted with manual delivery charges:', {
      orderId: order._id,
      deliveryCharges: deliveryCharges,
      finalAmount: order.finalAmount
    });

    res.status(200).json({
      success: true,
      message: 'Order accepted successfully. Buyer can now proceed with payment.',
      data: { order }
    });
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Farmer rejects order
router.post('/:id/reject', protectVerified, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can reject orders'
      });
    }

    const { farmerNotes } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the farmer for this order
    if (order.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if order is in correct status
    if (order.status !== 'farmer_review') {
      return res.status(400).json({
        success: false,
        message: 'Order is not in review status'
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.farmerNotes = farmerNotes;
    
    // Add to status history
    order.statusHistory.push({
      status: 'cancelled',
      updatedBy: req.user._id,
      notes: `Order rejected by farmer: ${farmerNotes}`
    });

    await order.save();

    // Populate order details
    await order.populate([
      { path: 'waste', select: 'title wasteType cropSource images' },
      { path: 'farmer', select: 'name phone email' },
      { path: 'buyer', select: 'name phone email companyDetails' }
    ]);

    // Send email notification to buyer about rejection
    try {
      const emailResult = await sendOrderRejectedNotification(order, order.farmer, order.buyer, order.waste);
      if (emailResult.success) {
        console.log('✅ Order rejection email sent to buyer');
      } else {
        console.error('❌ Failed to send order rejection email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Email notification error:', emailError);
      // Don't fail the order rejection if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Order rejected successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get orders pending farmer review
router.get('/farmer/pending-review', protectVerified, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can access this endpoint'
      });
    }

    const orders = await Order.find({
      farmer: req.user._id,
      status: 'farmer_review'
    })
      .populate('waste', 'title wasteType cropSource images location quantity pricePerUnit')
      .populate('buyer', 'name phone email companyDetails')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add notes to order
router.put('/:id/notes', protectVerified, async (req, res) => {
  try {
    const { notes, noteType } = req.body; // noteType: 'farmer' or 'buyer'
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to add notes
    const isFarmer = order.farmer.toString() === req.user._id.toString();
    const isBuyer = order.buyer.toString() === req.user._id.toString();
    
    if (!isFarmer && !isBuyer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update appropriate notes field
    if (isFarmer) {
      order.farmerNotes = notes;
    } else if (isBuyer) {
      order.buyerNotes = notes;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Notes updated successfully',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// AI-powered delivery optimization - automatically selects best truck and calculates cost
router.post('/optimize-delivery', protectVerified, async (req, res) => {
  try {
    const { quantity, distance, region } = req.body;

    // Validate required fields
    if (!quantity || !distance) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: quantity, distance'
      });
    }

    // Validate input ranges
    const quantityNum = parseFloat(quantity);
    const distanceNum = parseFloat(distance);
    const regionStr = region || 'suburban';

    if (quantityNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    if (distanceNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Distance must be greater than 0'
      });
    }

    // Define truck types with their capacities
    const truckTypes = [
      { id: 'mini', capacity: 2 },
      { id: 'small', capacity: 5 },
      { id: 'medium', capacity: 10 },
      { id: 'large', capacity: 20 },
      { id: 'extra_large', capacity: 30 }
    ];

    // Filter suitable trucks (capacity >= quantity)
    const suitableTrucks = truckTypes.filter(truck => truck.capacity >= quantityNum);

    if (suitableTrucks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No suitable truck available for this quantity'
      });
    }

    // Get ML predictions for all suitable trucks
    const truckPredictions = [];
    let bestTruck = null;
    let bestCost = Infinity;
    let predictionMethod = 'fallback';

    for (const truck of suitableTrucks) {
      try {
        // Prepare order data for ML prediction
        const orderData = {
          truck_type: truck.id,
          quantity: quantityNum,
          distance: distanceNum,
          region: regionStr,
          time_factor: 1.0
        };

        // Try ML prediction first
        const mlResult = await mlService.predictDeliveryCharge(orderData);
        
        if (mlResult.success) {
          const prediction = {
            truck_type: truck.id,
            capacity: truck.capacity,
            delivery_charge: mlResult.prediction,
            method: 'ml_prediction',
            confidence_range: mlResult.confidence_range,
            efficiency_score: Math.round((truck.capacity / quantityNum) * 100)
          };
          
          truckPredictions.push(prediction);
          predictionMethod = 'ml_prediction';
          
          // Check if this is the best option (lowest cost)
          if (mlResult.prediction < bestCost) {
            bestCost = mlResult.prediction;
            bestTruck = prediction;
          }
        } else {
          throw new Error('ML prediction failed');
        }
      } catch (error) {
        console.warn(`ML prediction failed for ${truck.id}, using fallback:`, error.message);
        
        // Fallback calculation
        const fallbackCost = calculateFallbackCost(truck.id, quantityNum, distanceNum, regionStr);
        const prediction = {
          truck_type: truck.id,
          capacity: truck.capacity,
          delivery_charge: fallbackCost,
          method: 'fallback',
          efficiency_score: Math.round((truck.capacity / quantityNum) * 100)
        };
        
        truckPredictions.push(prediction);
        
        // Check if this is the best option (lowest cost)
        if (fallbackCost < bestCost) {
          bestCost = fallbackCost;
          bestTruck = prediction;
        }
      }
    }

    // Calculate cost savings compared to worst option
    const worstCost = Math.max(...truckPredictions.map(p => p.delivery_charge));
    const costSavings = Math.round(worstCost - bestCost);

    // Return optimization result
    res.status(200).json({
      success: true,
      optimal_truck_type: bestTruck.truck_type,
      delivery_charge: bestTruck.delivery_charge,
      method: bestTruck.method,
      confidence_range: bestTruck.confidence_range,
      efficiency_score: bestTruck.efficiency_score,
      cost_savings: costSavings > 0 ? costSavings : 0,
      all_options: truckPredictions,
      optimization_details: {
        quantity: quantityNum,
        distance: distanceNum,
        region: regionStr,
        trucks_analyzed: truckPredictions.length,
        best_efficiency: bestTruck.efficiency_score
      }
    });

  } catch (error) {
    console.error('Delivery optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize delivery',
      error: error.message
    });
  }
});

// Helper function for fallback cost calculation
function calculateFallbackCost(truckType, quantity, distance, region) {
  const truckRates = {
    mini: 12, small: 20, medium: 35, large: 55, extra_large: 75
  };
  const regionMultipliers = {
    urban: 1.3, suburban: 1.1, rural: 1.0
  };
  
  const baseRate = truckRates[truckType] || truckRates.medium;
  const regionMultiplier = regionMultipliers[region] || regionMultipliers.suburban;
  const quantityFactor = 1 + (quantity / 10) * 0.1;
  
  return Math.round(baseRate * distance * quantityFactor * regionMultiplier * 100) / 100;
}

module.exports = router;