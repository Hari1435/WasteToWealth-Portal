const { uploadWasteImages, uploadProfileImage } = require('../config/cloudinary');

// Middleware for handling waste image uploads
const handleWasteImageUpload = (req, res, next) => {
  const upload = uploadWasteImages.array('images', 5); // Allow up to 5 images
  
  upload(req, res, (error) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 5MB per image.',
        });
      }
      
      if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({
          success: false,
          message: 'Only image files (JPG, JPEG, PNG, WEBP) are allowed.',
        });
      }
      
      return res.status(400).json({
        success: false,
        message: error.message || 'Error uploading images.',
      });
    }
    
    // Add uploaded image URLs to request body
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => file.path);
    }
    
    next();
  });
};

// Middleware for handling profile image upload
const handleProfileImageUpload = (req, res, next) => {
  const upload = uploadProfileImage.single('profileImage');
  
  upload(req, res, (error) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 2MB.',
        });
      }
      
      if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({
          success: false,
          message: 'Only image files (JPG, JPEG, PNG, WEBP) are allowed.',
        });
      }
      
      return res.status(400).json({
        success: false,
        message: error.message || 'Error uploading profile image.',
      });
    }
    
    // Add uploaded image URL to request body
    if (req.file) {
      req.body.profileImage = req.file.path;
    }
    
    next();
  });
};

// Middleware for handling multiple file upload types
const handleMultipleUploads = (uploadType) => {
  return (req, res, next) => {
    switch (uploadType) {
      case 'waste':
        return handleWasteImageUpload(req, res, next);
      case 'profile':
        return handleProfileImageUpload(req, res, next);
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid upload type specified.',
        });
    }
  };
};

// Error handling middleware for multer errors
const handleUploadError = (error, req, res, next) => {
  if (error) {
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 images allowed.',
      });
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large.',
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
      });
    }
    
    return res.status(400).json({
      success: false,
      message: error.message || 'File upload error.',
    });
  }
  
  next();
};

module.exports = {
  handleWasteImageUpload,
  handleProfileImageUpload,
  handleMultipleUploads,
  handleUploadError,
};