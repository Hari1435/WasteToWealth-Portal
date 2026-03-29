const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),

  body('userType')
    .isIn(['farmer', 'buyer'])
    .withMessage('User type must be either farmer or buyer'),

  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Waste listing validation
const validateWasteListing = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),

  body('wasteType')
    .isIn(['crop_residue', 'fruit_peels', 'vegetable_waste', 'grain_husk', 'leaves', 'stems', 'other'])
    .withMessage('Invalid waste type'),

  body('cropSource')
    .trim()
    .notEmpty()
    .withMessage('Crop source is required'),

  body('quantity.amount')
    .isFloat({ min: 0.1 })
    .withMessage('Quantity amount must be greater than 0'),

  body('quantity.unit')
    .isIn(['tons'])
    .withMessage('Invalid quantity unit'),

  body('pricePerUnit')
    .isFloat({ min: 0.01 })
    .withMessage('Price per unit must be greater than 0'),

  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),

  body('location.pincode')
    .isPostalCode('IN')
    .withMessage('Please provide a valid Indian pincode'),

  handleValidationErrors
];

// Order creation validation
const validateOrderCreation = [
  body('waste')
    .isMongoId()
    .withMessage('Invalid waste ID'),

  body('quantity.amount')
    .isFloat({ min: 0.1 })
    .withMessage('Quantity amount must be greater than 0'),

  body('deliveryDetails.method')
    .isIn(['pickup', 'delivery'])
    .withMessage('Delivery method must be pickup or delivery'),

  body('deliveryDetails.scheduledDate')
    .isISO8601()
    .withMessage('Please provide a valid scheduled date'),

  handleValidationErrors
];

// Payment validation
const validatePayment = [
  body('order')
    .isMongoId()
    .withMessage('Invalid order ID'),

  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),

  body('paymentMethod')
    .isIn(['upi', 'card', 'netbanking', 'wallet', 'bank_transfer'])
    .withMessage('Invalid payment method'),

  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateLogin,
  validateWasteListing,
  validateOrderCreation,
  validatePayment,
  handleValidationErrors
};