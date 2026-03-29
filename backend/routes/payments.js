const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Waste = require('../models/Waste');
const User = require('../models/User');
const { protect, protectVerified } = require('../middleware/auth');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Payment routes working!',
    razorpayConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  });
});

// Create payment order for approved order request (Step 3)
router.post('/create-order', protectVerified, async (req, res) => {
  try {
    const { orderId } = req.body; // Now we use existing approved order

    console.log('💳 Creating payment for approved order:', { orderId });

    // Validate required fields
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Check if user is buyer
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can create payment orders'
      });
    }

    // Find the approved order
    const order = await Order.findById(orderId).populate(['waste', 'farmer', 'buyer']);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to the buyer
    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only pay for your own orders'
      });
    }

    // Check if order is accepted by farmer or payment is pending (for retries)
    if (order.status !== 'accepted' && order.status !== 'payment_pending') {
      return res.status(400).json({
        success: false,
        message: 'Order must be accepted by farmer before payment'
      });
    }

    // Check if payment is already processed
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this order'
      });
    }

    // Use final pricing from farmer's confirmation
    const finalAmount = order.finalAmount || order.pricing?.totalAmount || order.totalAmount;
    const orderNumber = order.orderNumber;

    // Update order status to payment_pending
    order.status = 'payment_pending';
    order.statusHistory.push({
      status: 'payment_pending',
      updatedBy: req.user._id,
      notes: 'Payment initiated for approved order'
    });
    await order.save();

    // Create actual Razorpay order
    const shortReceipt = `ORD${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;
    const razorpayOrderOptions = {
      amount: Math.round(finalAmount * 100), // Razorpay expects amount in paise as INTEGER
      currency: 'INR',
      receipt: shortReceipt, // Keep under 40 characters
      notes: {
        order_id: orderNumber,
        waste_id: order.waste._id.toString(),
        buyer_id: req.user._id.toString()
      }
    };

    // Validate Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials missing:', {
        keyId: !!process.env.RAZORPAY_KEY_ID,
        keySecret: !!process.env.RAZORPAY_KEY_SECRET
      });
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured properly'
      });
    }

    // Validate order amount
    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount'
      });
    }

    console.log('🔄 Creating Razorpay order with options:', {
      amount: razorpayOrderOptions.amount,
      currency: razorpayOrderOptions.currency,
      receipt: razorpayOrderOptions.receipt,
      finalAmount: finalAmount,
      amountInPaise: razorpayOrderOptions.amount,
      isInteger: Number.isInteger(razorpayOrderOptions.amount)
    });

    let razorpayOrder;
    try {
      // Create actual Razorpay order
      razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);
      console.log('✅ Razorpay order created successfully:', {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        status: razorpayOrder.status
      });
    } catch (razorpayError) {
      console.error('❌ Razorpay API Error:', {
        message: razorpayError.message,
        statusCode: razorpayError.statusCode,
        error: razorpayError.error
      });
      
      return res.status(500).json({
        success: false,
        message: 'Payment gateway error: ' + (razorpayError.error?.description || razorpayError.message),
        details: process.env.NODE_ENV === 'development' ? razorpayError.error : undefined
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        order,
        razorpayOrder,
        paymentDetails: {
          wasteAmount: order.pricing?.wasteAmount || order.totalAmount,
          deliveryCharges: order.deliveryCharges || order.pricing?.deliveryCharges || 0,
          finalAmount: finalAmount,
          currency: 'INR'
        }
      }
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verify payment and confirm order
router.post('/verify', protectVerified, async (req, res) => {
  try {
    console.log('🔍 Starting payment verification with data:', req.body);
    
    const { 
      orderId, 
      razorpayPaymentId, 
      razorpayOrderId, 
      razorpaySignature,
      paymentMethod 
    } = req.body;

    console.log('📋 Finding order with ID:', orderId);
    
    // Find the order
    const order = await Order.findById(orderId).populate(['waste', 'farmer', 'buyer']);
    if (!order) {
      console.log('❌ Order not found:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    console.log('✅ Order found:', {
      id: order._id,
      status: order.status,
      totalAmount: order.totalAmount
    });

    // Verify payment signature using Razorpay's method
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    const isValidSignature = expectedSignature === razorpaySignature;
    
    console.log('🔐 Payment signature verification:', {
      razorpayOrderId,
      razorpayPaymentId,
      providedSignature: razorpaySignature,
      expectedSignature,
      isValid: isValidSignature
    });

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    console.log('💳 Checking for existing payment record...');
    
    // Check if payment already exists for this order
    let payment = await Payment.findOne({ order: order._id });
    
    if (payment) {
      console.log('🔄 Updating existing payment record:', payment._id);
      // Update existing payment record
      payment.gatewayTransactionId = razorpayPaymentId;
      payment.status = 'success';
      payment.paymentMethod = paymentMethod || 'card';
      payment.gatewayResponse = {
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature
      };
      await payment.save();
      console.log('✅ Updated existing payment record');
    } else {
      console.log('🆕 Creating new payment record...');
      
      // Calculate amounts
      const platformFee = Math.round(order.totalAmount * 0.02);
      const netAmount = order.totalAmount - platformFee;

      console.log('💰 Payment amounts:', {
        totalAmount: order.totalAmount,
        platformFee,
        netAmount
      });

      // Create new payment record
      payment = await Payment.create({
        order: order._id,
        payer: order.buyer._id,
        payee: order.farmer._id,
        amount: order.totalAmount,
        paymentMethod: paymentMethod || 'card',
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        gatewayTransactionId: razorpayPaymentId,
        status: 'success',
        gatewayResponse: {
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature
        },
        platformFee,
        netAmount
      });
      console.log('✅ Created new payment record:', payment._id);
    }

    console.log('📦 Updating waste listing quantity...');
    
    // Update waste listing quantity (only if order not already processed)
    if (order.status !== 'paid') {
      console.log('🔄 Order not yet paid, updating waste quantity...');
      try {
        const waste = await Waste.findById(order.waste._id);
        if (waste) {
          console.log('📋 Current waste quantity:', {
            title: waste.title,
            currentAmount: waste.quantity.amount,
            orderAmount: order.quantity.amount,
            unit: waste.quantity.unit
          });
          
          // Reduce available quantity
          const newQuantityAmount = waste.quantity.amount - order.quantity.amount;
          
          if (newQuantityAmount <= 0) {
            // If quantity becomes 0 or negative, mark as sold out
            waste.quantity.amount = 0;
            waste.status = 'sold_out';
          } else {
            // Update the remaining quantity but keep status as 'available'
            waste.quantity.amount = newQuantityAmount;
            waste.status = 'available'; // Keep available for partial orders
          }
          
          // Recalculate total price based on new quantity
          waste.totalPrice = waste.quantity.amount * waste.pricePerUnit;
          
          await waste.save();
          
          console.log(`✅ Updated waste quantity: ${waste.title} - Remaining: ${waste.quantity.amount} ${waste.quantity.unit}, Status: ${waste.status}`);
        } else {
          console.log('❌ Waste listing not found:', order.waste._id);
        }
      } catch (wasteError) {
        console.error('❌ Error updating waste quantity:', wasteError.message);
        // Don't throw error, continue with payment processing
      }
    } else {
      console.log('ℹ️ Waste quantity already updated for this paid order');
    }

    console.log('💰 Updating farmer earnings...');
    
    // Update farmer's earnings (only if order not already processed)
    if (order.status !== 'paid') {
      console.log('🔄 Order not yet paid, updating farmer earnings...');
      try {
        const farmer = await User.findById(order.farmer._id);
        if (farmer && farmer.userType === 'farmer') {
          console.log('👨‍🌾 Farmer found:', farmer.name);
          
          const farmerEarnings = order.totalAmount; // Amount farmer receives (before platform fee)
          const currentMonth = new Date().getMonth();
          
          // Initialize earnings object if it doesn't exist
          if (!farmer.earnings) {
            console.log('🆕 Initializing farmer earnings object...');
            farmer.earnings = {
              totalEarnings: 0,
              totalOrders: 0,
              thisMonthEarnings: 0,
              lastUpdated: new Date()
            };
          }
          
          const lastUpdatedMonth = farmer.earnings.lastUpdated ? new Date(farmer.earnings.lastUpdated).getMonth() : -1;
          
          // Reset monthly earnings if it's a new month
          if (currentMonth !== lastUpdatedMonth) {
            farmer.earnings.thisMonthEarnings = 0;
          }
          
          // Update earnings
          farmer.earnings.totalEarnings = (farmer.earnings.totalEarnings || 0) + farmerEarnings;
          farmer.earnings.totalOrders = (farmer.earnings.totalOrders || 0) + 1;
          farmer.earnings.thisMonthEarnings = (farmer.earnings.thisMonthEarnings || 0) + farmerEarnings;
          farmer.earnings.lastUpdated = new Date();
          
          await farmer.save();
          
          console.log(`💰 Updated farmer earnings: ${farmer.name} - Total: ₹${farmer.earnings.totalEarnings}, This Month: ₹${farmer.earnings.thisMonthEarnings}, Orders: ${farmer.earnings.totalOrders}`);
        } else {
          console.log('❌ Farmer not found or invalid user type:', order.farmer._id);
        }
      } catch (farmerError) {
        console.error('❌ Error updating farmer earnings:', farmerError.message);
        // Don't throw error, continue with payment processing
      }
    } else {
      console.log('ℹ️ Farmer earnings already updated for this paid order');
    }

    console.log('📋 Updating order status...');
    
    // Update order status to paid (only if not already paid)
    if (order.status !== 'paid') {
      console.log('🔄 Updating order status to paid...');
      try {
        order.status = 'paid';
        order.paymentStatus = 'paid';
        order.statusHistory.push({
          status: 'paid',
          updatedBy: req.user._id,
          notes: 'Payment completed successfully'
        });
        await order.save();
        console.log('✅ Order status updated to paid');
      } catch (orderError) {
        console.error('❌ Error updating order status:', orderError.message);
        // Don't throw error, continue with response
      }
    } else {
      console.log('ℹ️ Order already marked as paid');
    }

    // TODO: Send notification to farmer about new paid order
    // You can implement email/SMS notification here

    console.log('📊 Populating order details...');
    
    // Populate order details
    try {
      await order.populate([
        { path: 'waste', select: 'title wasteType cropSource location' },
        { path: 'farmer', select: 'name phone email' },
        { path: 'buyer', select: 'name phone email' }
      ]);
      console.log('✅ Order details populated successfully');
    } catch (populateError) {
      console.error('❌ Error populating order details:', populateError.message);
      // Continue without populated details
    }

    console.log('🎉 Payment verification completed successfully');

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      data: {
        order,
        payment
      }
    });
  } catch (error) {
    console.error('❌ Payment verification error:', {
      message: error.message,
      stack: error.stack,
      orderId: req.body.orderId,
      razorpayPaymentId: req.body.razorpayPaymentId,
      razorpayOrderId: req.body.razorpayOrderId
    });
    
    res.status(500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Verify payment with delivery charges
router.post('/verify-payment-with-delivery', protectVerified, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    console.log('🔍 Verifying payment with delivery charges:', {
      razorpay_order_id,
      razorpay_payment_id,
      orderId
    });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields'
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ 
      order: orderId
    }).populate(['order', 'payer', 'payee']);

    if (!payment) {
      console.error('❌ Payment record not found for:', { orderId, razorpay_order_id });
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    console.log('🔍 Found payment record:', {
      paymentId: payment._id,
      payer: payment.payer._id,
      currentUser: req.user._id
    });

    // Verify buyer ownership - fix the comparison to use _id property
    const payerIdString = payment.payer._id ? payment.payer._id.toString() : payment.payer.toString();
    const currentUserIdString = req.user._id.toString();
    
    if (payerIdString !== currentUserIdString) {
      console.error('❌ Unauthorized payment verification:', {
        paymentPayerId: payerIdString,
        currentUserId: currentUserIdString
      });
      return res.status(403).json({
        success: false,
        message: 'Unauthorized payment verification'
      });
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Fetch payment details from Razorpay
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

    if (razorpayPayment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment not captured'
      });
    }

    // Update payment record
    payment.gatewayTransactionId = razorpay_payment_id;
    payment.status = 'success';
    payment.paymentMethod = razorpayPayment.method;
    payment.gatewayResponse = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    };
    await payment.save();

    // Update order status
    const order = await Order.findById(orderId).populate('waste');
    order.status = 'paid';
    order.paymentStatus = 'paid';
    order.statusHistory.push({
      status: 'paid',
      updatedBy: req.user._id,
      notes: 'Payment completed successfully'
    });
    await order.save();

    // Update waste listing quantity (for delivery charges payment flow)
    if (order.waste) {
      const wasteDoc = await Waste.findById(order.waste._id);
      if (wasteDoc) {
        // Reduce available quantity
        const newQuantityAmount = wasteDoc.quantity.amount - order.quantity.amount;
        
        if (newQuantityAmount <= 0) {
          // If quantity becomes 0 or negative, mark as sold out
          wasteDoc.quantity.amount = 0;
          wasteDoc.status = 'sold_out';
        } else {
          // Update the remaining quantity but keep status as 'available'
          wasteDoc.quantity.amount = newQuantityAmount;
          wasteDoc.status = 'available'; // Keep available for partial orders
        }
        
        // Recalculate total price based on new quantity
        wasteDoc.totalPrice = wasteDoc.quantity.amount * wasteDoc.pricePerUnit;
        
        await wasteDoc.save();
        
        console.log(`✅ Updated waste quantity (delivery flow): ${wasteDoc.title} - Remaining: ${wasteDoc.quantity.amount} ${wasteDoc.quantity.unit}, Status: ${wasteDoc.status}`);
      }
    }

    console.log('✅ Payment verified successfully:', {
      paymentId: payment._id,
      orderId: orderId,
      amount: payment.amount
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        payment: {
          _id: payment._id,
          amount: payment.amount,
          status: payment.status,
          paymentMethod: payment.paymentMethod
        },
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus
        }
      }
    });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

module.exports = router;