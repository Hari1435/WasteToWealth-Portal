const express = require('express');
const { pageAccessMiddleware } = require('../middleware/pageAccess');

const router = express.Router();

// Public pages - accessible without authentication
router.get('/home', pageAccessMiddleware.public, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Agricultural Waste Marketplace',
    page: 'home',
    user: req.user || null
  });
});

router.get('/about', pageAccessMiddleware.public, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'About page accessible',
    page: 'about'
  });
});

router.get('/contact', pageAccessMiddleware.public, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Contact page accessible',
    page: 'contact'
  });
});

// Guest only pages - redirect if already logged in
router.get('/login', pageAccessMiddleware.guestOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Login page accessible',
    page: 'login'
  });
});

router.get('/register', pageAccessMiddleware.guestOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Registration page accessible',
    page: 'register'
  });
});

router.get('/forgot-password', pageAccessMiddleware.guestOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Forgot password page accessible',
    page: 'forgot-password'
  });
});

// Authenticated pages - any logged in user
router.get('/dashboard', pageAccessMiddleware.authenticated, (req, res) => {
  const redirectPath = req.user.userType === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard';
  res.status(200).json({
    success: true,
    message: 'Redirecting to appropriate dashboard',
    redirectTo: redirectPath,
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

router.get('/profile', pageAccessMiddleware.authenticated, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile page accessible',
    page: 'profile',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

router.get('/settings', pageAccessMiddleware.authenticated, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Settings page accessible',
    page: 'settings',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

// Farmer only pages
router.get('/farmer/dashboard', pageAccessMiddleware.farmerOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Farmer dashboard accessible',
    page: 'farmer-dashboard',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

router.get('/farmer/create-listing', pageAccessMiddleware.farmerOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Create waste listing page accessible',
    page: 'create-listing',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

router.get('/farmer/my-listings', pageAccessMiddleware.farmerOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'My listings page accessible',
    page: 'my-listings',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

router.get('/farmer/orders', pageAccessMiddleware.farmerOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Farmer orders page accessible',
    page: 'farmer-orders',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

// Buyer only pages
router.get('/buyer/dashboard', pageAccessMiddleware.buyerOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Buyer dashboard accessible',
    page: 'buyer-dashboard',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

router.get('/buyer/browse', pageAccessMiddleware.buyerOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Browse waste listings page accessible',
    page: 'browse-listings',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

router.get('/buyer/orders', pageAccessMiddleware.buyerOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Buyer orders page accessible',
    page: 'buyer-orders',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

router.get('/buyer/favorites', pageAccessMiddleware.buyerOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Favorites page accessible',
    page: 'favorites',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

// Mixed access pages (both farmers and buyers)
router.get('/marketplace', pageAccessMiddleware.authenticated, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Marketplace page accessible',
    page: 'marketplace',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

router.get('/orders', pageAccessMiddleware.authenticated, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Orders page accessible',
    page: 'orders',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

router.get('/notifications', pageAccessMiddleware.authenticated, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notifications page accessible',
    page: 'notifications',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

// Admin pages (for future use)
router.get('/admin/*', pageAccessMiddleware.adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin area accessible',
    page: 'admin',
    user: {
      id: req.user._id,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

module.exports = router;