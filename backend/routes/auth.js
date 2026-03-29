const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../utils/otpService');

const router = express.Router();

// Enhanced password validation function
const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return errors;
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  // Additional security checks
  if (password.toLowerCase().includes('password')) {
    errors.push('Password cannot contain the word "password"');
  }
  
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain more than 2 consecutive identical characters');
  }
  
  return errors;
};

// Registration validation function
const validateRegistration = (req, res, next) => {
  const { name, email, password, phone } = req.body;
  
  if (!name || name.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name must be at least 2 characters long'
    });
  }
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email'
    });
  }
  
  // Validate password with comprehensive requirements
  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Password requirements not met',
      errors: passwordErrors
    });
  }
  
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email'
    });
  }
  
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }
  
  next();
};

// Register farmer
router.post('/register/farmer', validateRegistration, async (req, res) => {
  try {
    const { name, email, password, phone, address, farmDetails } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please try logging in instead.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create farmer
    const farmer = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      userType: 'farmer',
      address,
      farmDetails,
      otp: otp,
      otpExpires: otpExpires
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(farmer, otp);
    
    if (!emailResult.success) {
      // If email fails, still create account but notify user
      console.error('Failed to send OTP email:', emailResult.error);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the OTP to verify your account.',
      data: {
        user: {
          id: farmer._id,
          name: farmer.name,
          email: farmer.email,
          userType: farmer.userType,
          isVerified: farmer.isVerified
        },
        otpSent: emailResult.success
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Register buyer
router.post('/register/buyer', validateRegistration, async (req, res) => {
  try {
    const { name, email, password, phone, address, companyDetails } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please try logging in instead.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create buyer
    const buyer = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      userType: 'buyer',
      address,
      companyDetails,
      otp: otp,
      otpExpires: otpExpires
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(buyer, otp);
    
    if (!emailResult.success) {
      // If email fails, still create account but notify user
      console.error('Failed to send OTP email:', emailResult.error);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the OTP to verify your account.',
      data: {
        user: {
          id: buyer._id,
          name: buyer.name,
          email: buyer.email,
          userType: buyer.userType,
          isVerified: buyer.isVerified
        },
        otpSent: emailResult.success
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please sign up first.'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.'
      });
    }

    // Check if account is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your account with the OTP sent to your email before logging in.',
        requiresVerification: true
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          isVerified: user.isVerified,
          rating: user.rating
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
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



// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.'
      });
    }

    // Find user with matching email and OTP
    const user = await User.findOne({
      email: email,
      otp: otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new OTP.'
      });
    }

    // Update user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user);

    // Generate token for immediate login
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Account verified successfully! You are now logged in.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          isVerified: user.isVerified,
          rating: user.rating
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified. You can log in now.'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(user, otp);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully! Please check your inbox.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Password reset request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }

    // Generate reset OTP (reuse OTP system)
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with reset OTP
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send reset OTP email
    const emailResult = await sendOTPEmail(user, otp, 'Password Reset');

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset OTP. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Reset password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required.'
      });
    }

    // Validate new password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet requirements',
        errors: passwordErrors
      });
    }

    // Find user with matching email and OTP
    const user = await User.findOne({
      email: email,
      otp: otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear OTP
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;