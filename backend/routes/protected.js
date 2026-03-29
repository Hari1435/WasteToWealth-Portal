const express = require('express');
const { requireAuth, requireRole } = require('../middleware/routeProtection');

const router = express.Router();

// Dashboard routes - require authentication and specific roles
router.get('/farmer/dashboard', requireAuth, requireRole('farmer'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to farmer dashboard',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

router.get('/buyer/dashboard', requireAuth, requireRole('buyer'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to buyer dashboard',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

// Profile pages - require authentication
router.get('/profile', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to profile page',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

// Waste management pages - farmers only
router.get('/waste/create', requireAuth, requireRole('farmer'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to create waste listing page'
  });
});

router.get('/waste/my-listings', requireAuth, requireRole('farmer'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to my waste listings page'
  });
});

// Order management pages - require authentication
router.get('/orders', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to orders page',
    userType: req.user.userType
  });
});

// Settings and account pages - require authentication
router.get('/settings', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to settings page'
  });
});

router.get('/account', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to account page'
  });
});

// Admin routes (if needed in future)
router.get('/admin/*', requireAuth, requireRole('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to admin area'
  });
});

module.exports = router;