import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  X, 
  MapPin,
  Calendar,
  Package,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { wasteAPI, userAPI } from '../../utils/api';
import { useApiWithLoading } from '../../hooks/useApiWithLoading';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { calculatePrice, convertToTons, formatUnit, getUnitConversionInfo } from '../../utils/unitConversions';
import toast from 'react-hot-toast';

const CreateWasteListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { callWithLoading } = useApiWithLoading();
  const [uploadingImages, setUploadingImages] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    wasteType: '',
    cropSource: '',
    quantity: {
      amount: '',
      unit: 'tons'
    },
    pricePerUnit: '',
    availability: {
      from: '',
      to: ''
    },
    images: []
  });

  const wasteTypes = [
    { value: 'crop_residue', label: 'Crop Residue' },
    { value: 'vegetable_waste', label: 'Vegetable Waste' },
    { value: 'grain_husk', label: 'Grain Husk' },
    { value: 'leaves', label: 'Leaves' },
    { value: 'stems', label: 'Stems' },
    { value: 'other', label: 'Other' }
  ];

  const units = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'quintals', label: 'Quintals' },
    { value: 'tons', label: 'Tons' }
  ];

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await userAPI.getMyProfile();
        setUserProfile(response.data.data.user);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        toast.error('Failed to load profile information');
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Handle numeric fields with decimal support
    if (name === 'quantity.amount') {
      // Allow numbers with decimal points for quantity
      processedValue = value.replace(/[^0-9.]/g, '');
      // Ensure only one decimal point
      const parts = processedValue.split('.');
      if (parts.length > 2) {
        processedValue = parts[0] + '.' + parts.slice(1).join('');
      }
    } else if (name === 'pricePerUnit') {
      // Only allow whole numbers for price per unit
      processedValue = value.replace(/[^0-9]/g, '');
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: processedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setUploadingImages(true);
    const uploadFormData = new FormData();
    files.forEach(file => {
      uploadFormData.append('images', file);
    });

    try {
      const response = await wasteAPI.uploadImages(uploadFormData);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...response.data.data.images]
      }));
      toast.success('Images uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.wasteType || 
          !formData.cropSource || !formData.quantity.amount || !formData.pricePerUnit) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Check if user has address in profile
      if (!userProfile?.address?.city || !userProfile?.address?.state || !userProfile?.address?.pincode) {
        toast.error('Please complete your profile address before creating a listing');
        navigate('/farmer/profile');
        return;
      }

      const submitData = new FormData();
      
      // Add basic fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('wasteType', formData.wasteType);
      submitData.append('cropSource', formData.cropSource);
      submitData.append('pricePerUnit', formData.pricePerUnit);

      // Add JSON fields
      submitData.append('quantity', JSON.stringify(formData.quantity));
      
      if (formData.availability.from && formData.availability.to) {
        submitData.append('availability', JSON.stringify(formData.availability));
      }

      // Add images (already uploaded URLs)
      if (formData.images.length > 0) {
        submitData.append('images', JSON.stringify(formData.images));
      }

      await callWithLoading(
        () => wasteAPI.create(submitData),
        'Creating your listing...'
      );
      toast.success('Waste listing created successfully!');
      navigate('/farmer/my-listings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create listing');
    }
  };

  return (
    <div className="page-container">
      <div className="responsive-container responsive-padding">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="responsive-title text-gray-900 mb-2">
              Create Waste Listing
            </h1>
            <p className="responsive-text text-gray-600">
              List your agricultural waste and connect with potential buyers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="responsive-card">
              <div className="flex items-center mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  <FileText size={16} className="text-primary-600 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Basic Information</h2>
              </div>

              <div className="responsive-form-grid">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., Fresh Rice Straw Available"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Describe your waste material, its condition, and any special features..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waste Type *
                  </label>
                  <select
                    name="wasteType"
                    value={formData.wasteType}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select waste type</option>
                    {wasteTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Source *
                  </label>
                  <input
                    type="text"
                    name="cropSource"
                    value={formData.cropSource}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., Rice, Wheat, Corn"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Quantity and Pricing */}
            <div className="responsive-card">
              <div className="flex items-center mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Package size={16} className="text-green-600 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Quantity & Pricing</h2>
              </div>

              <div className="responsive-form-grid-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    name="quantity.amount"
                    value={formData.quantity.amount}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    name="quantity.unit"
                    value={formData.quantity.unit}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Ton (₹) *
                  </label>
                  <input
                    type="text"
                    name="pricePerUnit"
                    value={formData.pricePerUnit}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter price per ton (numbers only)"
                    pattern="[0-9]+"
                    title="Please enter a valid number"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Pricing is always per ton, regardless of the quantity unit you choose
                  </p>
                </div>
              </div>

              {/* Unit Conversion Info */}
              {formData.quantity.unit && formData.quantity.unit !== 'tons' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Unit Conversion:</strong> {getUnitConversionInfo(formData.quantity.unit).conversionToTons}
                  </p>
                </div>
              )}

              {formData.quantity.amount && formData.pricePerUnit && (
                <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                  <div className="space-y-2">
                    <p className="text-sm text-primary-800">
                      <strong>Quantity:</strong> {formData.quantity.amount} {formatUnit(formData.quantity.unit)}
                      {formData.quantity.unit !== 'tons' && (
                        <span className="text-primary-600 ml-2">
                          (≈ {convertToTons(formData.quantity.amount, formData.quantity.unit).toFixed(3)} tons)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-primary-800">
                      <strong>Price per Ton:</strong> ₹{parseFloat(formData.pricePerUnit).toFixed(2)}
                    </p>
                    <p className="text-sm text-primary-800">
                      <strong>Total Value:</strong> ₹{calculatePrice(formData.quantity.amount, formData.quantity.unit, formData.pricePerUnit).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Location Display */}
            {userProfile && (
              <div className="responsive-card">
                <div className="flex items-center mb-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <MapPin size={16} className="text-blue-600 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Listing Location</h2>
                </div>

                {userProfile.address?.city && userProfile.address?.state && userProfile.address?.pincode ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <MapPin size={20} className="text-green-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800 mb-1">
                          Your waste will be listed from your profile location:
                        </p>
                        <div className="text-sm text-green-700">
                          {userProfile.address.street && (
                            <p>{userProfile.address.street}</p>
                          )}
                          <p>
                            {userProfile.address.city}, {userProfile.address.state} - {userProfile.address.pincode}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate('/farmer/profile')}
                          className="text-xs text-green-600 hover:text-green-800 underline mt-2"
                        >
                          Update location in profile
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <MapPin size={20} className="text-yellow-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 mb-1">
                          Complete your profile address to create listings
                        </p>
                        <p className="text-sm text-yellow-700 mb-3">
                          Your waste listings will use the location from your profile.
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate('/farmer/profile')}
                          className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                        >
                          Complete Profile
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}



            {/* Availability */}
            <div className="responsive-card">
              <div className="flex items-center mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Calendar size={16} className="text-purple-600 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Availability</h2>
              </div>

              <div className="responsive-form-grid">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available From
                  </label>
                  <input
                    type="date"
                    name="availability.from"
                    value={formData.availability.from}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Until
                  </label>
                  <input
                    type="date"
                    name="availability.to"
                    value={formData.availability.to}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="responsive-card">
              <div className="flex items-center mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <ImageIcon size={16} className="text-indigo-600 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Images</h2>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg responsive-padding-sm text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImages || formData.images.length >= 5}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer ${uploadingImages || formData.images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload size={32} className="text-gray-400 mx-auto mb-4 sm:w-12 sm:h-12" />
                    <p className="responsive-text-sm text-gray-600 mb-2">
                      {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Maximum 5 images, up to 5MB each (JPG, PNG, WebP)
                    </p>
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="responsive-grid-auto responsive-gap">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 sm:h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="responsive-button-group justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/farmer/my-listings')}
                className="responsive-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploadingImages}
                className="responsive-button"
              >
                Create Listing
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWasteListing;