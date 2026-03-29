const express = require('express');
const User = require('../models/User');
const { protect, protectVerified } = require('../middleware/auth');
const { handleProfileImageUpload, handleUploadError } = require('../middleware/upload');
const { deleteImage, extractPublicId } = require('../config/cloudinary');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working!' });
});

// Get current user's own profile
router.get('/profile', protectVerified, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user profile by ID
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user profile (own profile only) with profile image upload
router.put('/profile', protectVerified, handleProfileImageUpload, handleUploadError, async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      farmDetails,
      companyDetails
    } = req.body;

    // Get current user to check for existing profile image
    const currentUser = await User.findById(req.user._id);

    const updateData = {
      name,
      phone,
      address
    };

    // Handle profile image update
    if (req.body.profileImage) {
      // Delete old profile image if exists
      if (currentUser.profileImage) {
        try {
          const publicId = extractPublicId(currentUser.profileImage);
          if (publicId) {
            await deleteImage(publicId);
          }
        } catch (cleanupError) {
          console.error('Error deleting old profile image:', cleanupError);
        }
      }
      updateData.profileImage = req.body.profileImage;
    }

    // Parse JSON fields if they come as strings (from FormData)
    try {
      if (address && typeof address === 'string') {
        updateData.address = JSON.parse(address);
      }
      if (farmDetails && typeof farmDetails === 'string') {
        updateData.farmDetails = JSON.parse(farmDetails);
      }
      if (companyDetails && typeof companyDetails === 'string') {
        updateData.companyDetails = JSON.parse(companyDetails);
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format in request data'
      });
    }

    // Add role-specific data
    if (req.user.userType === 'farmer' && (farmDetails || updateData.farmDetails)) {
      updateData.farmDetails = updateData.farmDetails || farmDetails;
    } else if (req.user.userType === 'buyer' && (companyDetails || updateData.companyDetails)) {
      updateData.companyDetails = updateData.companyDetails || companyDetails;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload profile image only
router.post('/upload-profile-image', protectVerified, handleProfileImageUpload, handleUploadError, async (req, res) => {
  try {
    if (!req.body.profileImage) {
      return res.status(400).json({
        success: false,
        message: 'No profile image uploaded'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profileImage: req.body.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Change password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Get user with password
    const bcrypt = require('bcryptjs');
    const user = await User.findById(req.user._id);

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(req.user._id, {
      password: hashedNewPassword
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get farmer dashboard data
router.get('/farmer/dashboard', protectVerified, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can access this endpoint'
      });
    }

    const farmerId = req.user._id;
    const Waste = require('../models/Waste');
    const Order = require('../models/Order');

    // Get farmer's earnings data from user profile
    const farmer = await User.findById(farmerId);
    const earnings = farmer.earnings || {
      totalEarnings: 0,
      totalOrders: 0,
      thisMonthEarnings: 0,
      lastUpdated: new Date()
    };

    // Get dashboard statistics
    const [
      totalListings,
      activeListings,
      soldListings,
      soldOutListings,
      totalOrders,
      confirmedOrders,
      completedOrders
    ] = await Promise.all([
      Waste.countDocuments({ farmer: farmerId }),
      Waste.countDocuments({ farmer: farmerId, status: 'available' }),
      Waste.countDocuments({ farmer: farmerId, status: 'sold' }),
      Waste.countDocuments({ farmer: farmerId, status: 'sold_out' }),
      Order.countDocuments({ farmer: farmerId }),
      Order.countDocuments({ farmer: farmerId, status: 'confirmed' }),
      Order.countDocuments({ farmer: farmerId, status: 'completed' })
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ farmer: farmerId })
      .populate('waste', 'title wasteType')
      .populate('buyer', 'name companyDetails')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent listings
    const recentListings = await Waste.find({ farmer: farmerId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalListings,
          activeListings,
          soldListings,
          soldOutListings,
          totalOrders,
          confirmedOrders,
          completedOrders
        },
        earnings: {
          totalEarnings: earnings.totalEarnings,
          totalOrders: earnings.totalOrders,
          thisMonthEarnings: earnings.thisMonthEarnings,
          averageOrderValue: earnings.totalOrders > 0 ? (earnings.totalEarnings / earnings.totalOrders) : 0,
          lastUpdated: earnings.lastUpdated
        },
        recentOrders,
        recentListings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get buyer dashboard data
router.get('/buyer/dashboard', protectVerified, async (req, res) => {
  try {
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can access this endpoint'
      });
    }

    const buyerId = req.user._id;
    const Order = require('../models/Order');

    // Get dashboard statistics
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalSpent
    ] = await Promise.all([
      Order.countDocuments({ buyer: buyerId }),
      Order.countDocuments({ buyer: buyerId, status: 'pending' }),
      Order.countDocuments({ buyer: buyerId, status: 'completed' }),
      Order.countDocuments({ buyer: buyerId, status: { $in: ['cancelled', 'rejected'] } }),
      Order.aggregate([
        { $match: { buyer: buyerId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ buyer: buyerId })
      .populate('waste', 'title wasteType cropSource location')
      .populate('farmer', 'name farmDetails')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get favorite waste types (most ordered)
    const favoriteWasteTypes = await Order.aggregate([
      { $match: { buyer: buyerId } },
      { $lookup: { from: 'wastes', localField: 'waste', foreignField: '_id', as: 'wasteInfo' } },
      { $unwind: '$wasteInfo' },
      { $group: { _id: '$wasteInfo.wasteType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          totalSpent: totalSpent[0]?.total || 0
        },
        recentOrders,
        favoriteWasteTypes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's ratings and reviews
router.get('/ratings', protect, async (req, res) => {
  try {
    const Review = require('../models/Review');
    
    const reviews = await Review.find({ reviewee: req.user._id })
      .populate('reviewer', 'name userType')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verify user account (admin functionality - placeholder)
router.post('/verify/:id', protect, async (req, res) => {
  try {
    // This would typically be an admin-only function
    // For now, allowing users to verify themselves for demo purposes
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all users (for admin or search functionality)
router.get('/search', async (req, res) => {
  try {
    const { query, userType, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (userType) filter.userType = userType;
    if (query) {
      filter.$or = [
        { name: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') },
        { 'address.city': new RegExp(query, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
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

module.exports = router;