const express = require('express');
const Waste = require('../models/Waste');
const User = require('../models/User');
const { protect, protectVerified, authorize } = require('../middleware/auth');
const { handleWasteImageUpload, handleUploadError } = require('../middleware/upload');
const { deleteImage, extractPublicId } = require('../config/cloudinary');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Waste routes working!' });
});

// Create waste listing (farmers only) with image upload
router.post('/create', protectVerified, handleWasteImageUpload, handleUploadError, async (req, res) => {
  let parsedImages = []; // Declare outside try block for cleanup access
  
  try {
    // Check if user is farmer
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can create waste listings'
      });
    }

    // Validate required fields (location is no longer required in request)
    const { title, description, wasteType, cropSource, quantity, pricePerUnit } = req.body;
    
    if (!title || !description || !wasteType || !cropSource || !quantity || !pricePerUnit) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if farmer has complete address in profile
    if (!req.user.address || !req.user.address.city || !req.user.address.state || !req.user.address.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile address before creating a listing'
      });
    }

    // Parse JSON fields if they come as strings (from FormData)
    let parsedQuantity, parsedAvailability;
    
    try {
      parsedQuantity = typeof quantity === 'string' ? JSON.parse(quantity) : quantity;
      parsedAvailability = req.body.availability ? 
        (typeof req.body.availability === 'string' ? JSON.parse(req.body.availability) : req.body.availability) 
        : undefined;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format in request data'
      });
    }

    // Parse images if they come as JSON string
    if (req.body.images) {
      try {
        parsedImages = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
      } catch (parseError) {
        parsedImages = Array.isArray(req.body.images) ? req.body.images : [];
      }
    }

    // Use farmer's profile location for the listing
    const farmerLocation = {
      address: req.user.address.street || '',
      city: req.user.address.city,
      state: req.user.address.state,
      pincode: req.user.address.pincode,
      country: req.user.address.country || 'India',
      coordinates: req.user.address.coordinates || null,
      lat: req.user.address.lat || null,
      lng: req.user.address.lng || null
    };

    // Debug logging
    console.log('Debug - Received pricePerUnit:', pricePerUnit, 'Type:', typeof pricePerUnit);
    console.log('Debug - Parsed pricePerUnit:', parseFloat(pricePerUnit));
    
    const wasteData = {
      title,
      description,
      wasteType,
      cropSource,
      quantity: parsedQuantity,
      pricePerUnit: parseFloat(pricePerUnit),
      totalPrice: parsedQuantity.amount * parseFloat(pricePerUnit),
      location: farmerLocation,
      farmer: req.user._id,
      images: parsedImages, // Images uploaded to Cloudinary
      availability: parsedAvailability,
    };

    const waste = await Waste.create(wasteData);
    await waste.populate('farmer', 'name phone rating');

    res.status(201).json({
      success: true,
      message: 'Waste listing created successfully',
      data: { waste }
    });
  } catch (error) {
    // If there was an error after images were uploaded, clean them up
    if (parsedImages && parsedImages.length > 0) {
      try {
        await Promise.all(
          parsedImages.map(imageUrl => {
            const publicId = extractPublicId(imageUrl);
            return publicId ? deleteImage(publicId) : Promise.resolve();
          })
        );
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded images:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all waste listings with filters and pagination
router.get('/listings', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      wasteType,
      city,
      state,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'available' };
    
    if (wasteType) filter.wasteType = wasteType;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (state) filter['location.state'] = new RegExp(state, 'i');
    if (minPrice || maxPrice) {
      filter.pricePerUnit = {};
      if (minPrice) filter.pricePerUnit.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerUnit.$lte = parseFloat(maxPrice);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [wastes, total] = await Promise.all([
      Waste.find(filter)
        .populate('farmer', 'name phone rating location')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Waste.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        wastes,
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

// Get waste listing by ID
router.get('/:id', async (req, res) => {
  try {
    const waste = await Waste.findById(req.params.id)
      .populate('farmer', 'name phone rating address isVerified');

    if (!waste) {
      return res.status(404).json({
        success: false,
        message: 'Waste listing not found'
      });
    }

    // Increment views
    waste.views += 1;
    await waste.save();

    res.status(200).json({
      success: true,
      data: { waste }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update waste listing (farmer only, own listings) with image upload
router.put('/:id', protectVerified, handleWasteImageUpload, handleUploadError, async (req, res) => {
  try {
    const waste = await Waste.findById(req.params.id);

    if (!waste) {
      return res.status(404).json({
        success: false,
        message: 'Waste listing not found'
      });
    }

    // Check ownership
    if (waste.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own listings.'
      });
    }

    // Parse JSON fields if they come as strings (from FormData)
    const updateData = { ...req.body };
    
    try {
      if (req.body.quantity && typeof req.body.quantity === 'string') {
        updateData.quantity = JSON.parse(req.body.quantity);
      }
      if (req.body.location && typeof req.body.location === 'string') {
        updateData.location = JSON.parse(req.body.location);
      }
      if (req.body.availability && typeof req.body.availability === 'string') {
        updateData.availability = JSON.parse(req.body.availability);
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format in request data'
      });
    }

    // Handle image updates
    if (req.body.images && req.body.images.length > 0) {
      // Delete old images from Cloudinary
      if (waste.images && waste.images.length > 0) {
        try {
          await Promise.all(
            waste.images.map(imageUrl => {
              const publicId = extractPublicId(imageUrl);
              return publicId ? deleteImage(publicId) : Promise.resolve();
            })
          );
        } catch (cleanupError) {
          console.error('Error deleting old images:', cleanupError);
        }
      }
      
      updateData.images = req.body.images;
    }

    // Recalculate total price if quantity or price changed
    if (updateData.quantity || updateData.pricePerUnit) {
      const quantity = updateData.quantity?.amount || waste.quantity.amount;
      const pricePerUnit = parseFloat(updateData.pricePerUnit) || waste.pricePerUnit;
      updateData.totalPrice = quantity * pricePerUnit;
    }

    const updatedWaste = await Waste.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('farmer', 'name phone rating');

    res.status(200).json({
      success: true,
      message: 'Waste listing updated successfully',
      data: { waste: updatedWaste }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete waste listing (farmer only, own listings)
router.delete('/:id', protectVerified, async (req, res) => {
  try {
    const waste = await Waste.findById(req.params.id);

    if (!waste) {
      return res.status(404).json({
        success: false,
        message: 'Waste listing not found'
      });
    }

    // Check ownership
    if (waste.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own listings.'
      });
    }

    // Delete images from Cloudinary
    if (waste.images && waste.images.length > 0) {
      try {
        await Promise.all(
          waste.images.map(imageUrl => {
            const publicId = extractPublicId(imageUrl);
            return publicId ? deleteImage(publicId) : Promise.resolve();
          })
        );
      } catch (cleanupError) {
        console.error('Error deleting images from Cloudinary:', cleanupError);
      }
    }

    await Waste.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Waste listing deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Search waste listings
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const searchFilter = {
      status: 'available',
      $or: [
        { title: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { wasteType: new RegExp(query, 'i') },
        { cropSource: new RegExp(query, 'i') },
        { 'location.city': new RegExp(query, 'i') },
        { 'location.state': new RegExp(query, 'i') }
      ]
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [wastes, total] = await Promise.all([
      Waste.find(searchFilter)
        .populate('farmer', 'name phone rating')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Waste.countDocuments(searchFilter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        wastes,
        searchQuery: query,
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

// Get farmer's own waste listings
router.get('/farmer/my-listings', protectVerified, async (req, res) => {
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

    const [wastes, total] = await Promise.all([
      Waste.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Waste.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        wastes,
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

// Upload images only (for preview before creating listing)
router.post('/upload-images', protectVerified, handleWasteImageUpload, handleUploadError, async (req, res) => {
  try {
    // Check if files were uploaded (req.files is populated by multer)
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // req.body.images is populated by the middleware after successful upload
    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images: req.body.images
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