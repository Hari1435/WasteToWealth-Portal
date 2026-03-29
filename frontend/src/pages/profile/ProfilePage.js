import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit,
  Save,
  X,
  Building,
  Tractor,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApiWithLoading } from '../../hooks/useApiWithLoading';
import { userAPI } from '../../utils/api';
import Button from '../../components/common/Button';
// LoadingSpinner removed - all loaders disabled
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { callWithLoading } = useApiWithLoading();
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    farmDetails: {
      farmSize: '',
      cropTypes: [],
      farmingExperience: ''
    },
    companyDetails: {
      companyName: '',
      companyType: '',
      gstNumber: '',
      licenseNumber: ''
    },
    profileImage: ''
  });

  useEffect(() => {
    if (user) {
      // Auto-populate profile with user data from registration
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          pincode: user.address?.pincode || ''
        },
        farmDetails: {
          farmSize: user.farmDetails?.farmSize || '',
          cropTypes: user.farmDetails?.cropTypes || [],
          farmingExperience: user.farmDetails?.farmingExperience || ''
        },
        companyDetails: {
          companyName: user.companyDetails?.companyName || '',
          companyType: user.companyDetails?.companyType || '',
          gstNumber: user.companyDetails?.gstNumber || '',
          licenseNumber: user.companyDetails?.licenseNumber || ''
        },
        profileImage: user.profileImage || ''
      });
      
      // Debug log to verify data population (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('Profile auto-populated with user data:', user);
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCropTypesChange = (e) => {
    const value = e.target.value;
    const cropTypes = value.split(',').map(crop => crop.trim()).filter(crop => crop);
    setFormData(prev => ({
      ...prev,
      farmDetails: {
        ...prev.farmDetails,
        cropTypes
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadFormData = new FormData();
    uploadFormData.append('profileImage', file);

    try {
      const response = await userAPI.uploadProfileImage(uploadFormData);
      setFormData(prev => ({
        ...prev,
        profileImage: response.data.data.profileImage
      }));
      toast.success('Profile image uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = new FormData();
      updateData.append('name', formData.name);
      updateData.append('phone', formData.phone);
      updateData.append('address', JSON.stringify(formData.address));

      if (formData.profileImage) {
        updateData.append('profileImage', formData.profileImage);
      }

      if (user.userType === 'farmer') {
        updateData.append('farmDetails', JSON.stringify(formData.farmDetails));
      } else if (user.userType === 'buyer') {
        updateData.append('companyDetails', JSON.stringify(formData.companyDetails));
      }

      await callWithLoading(
        () => userAPI.updateProfile(updateData),
        'Updating your profile...'
      );
      
      // Refresh user data to get updated profile information
      const refreshResult = await refreshUser();
      
      if (refreshResult.success) {
        toast.success('Profile updated successfully');
        setEditing(false);
        
        // Debug log to verify data refresh (remove in production)
        if (process.env.NODE_ENV === 'development') {
          console.log('Profile refreshed with updated data:', refreshResult.user);
        }
      } else {
        toast.success('Profile updated successfully');
        setEditing(false);
        // Even if refresh fails, the update was successful
        console.warn('Profile updated but failed to refresh user data:', refreshResult.error);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const companyTypes = [
    { value: 'fertilizer', label: 'Fertilizer Company' },
    { value: 'biogas', label: 'Biogas Company' },
    { value: 'compost', label: 'Compost Company' },
    { value: 'paper', label: 'Paper Company' },
    { value: 'construction', label: 'Construction Company' },
    { value: 'animal', label: 'Animal Company' },
    { value: 'textile', label: 'Textile Company' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="page-container">
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Profile
              </h1>
              <p className="text-gray-600">
                Manage your account information and preferences
              </p>
            </div>
            {!editing ? (
              <Button onClick={() => setEditing(true)}>
                <Edit size={20} />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    // Reset form data
                    if (user) {
                      setFormData({
                        name: user.name || '',
                        phone: user.phone || '',
                        address: user.address || { street: '', city: '', state: '', pincode: '' },
                        farmDetails: user.farmDetails || { farmSize: '', cropTypes: [], farmingExperience: '' },
                        companyDetails: user.companyDetails || { companyName: '', companyType: '', gstNumber: '', licenseNumber: '' },
                        profileImage: user.profileImage || ''
                      });
                    }
                  }}
                >
                  <X size={20} />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                >
                  <Save size={20} />
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Image and Basic Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {formData.profileImage ? (
                        <img
                          src={formData.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={48} className="text-gray-400" />
                      )}
                    </div>
                    {editing && (
                      <div className="absolute bottom-0 right-0">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="profile-image-upload"
                          disabled={uploadingImage}
                        />
                        <label
                          htmlFor="profile-image-upload"
                          className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors"
                        >
                          <Camera size={20} />
                        </label>
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mt-4">
                    {user?.name}
                  </h2>
                  <div className="flex items-center justify-center mt-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center mr-2 ${user?.userType === 'farmer' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                      {user?.userType === 'farmer' ? (
                        <Tractor size={16} className="text-green-600" />
                      ) : (
                        <Building size={16} className="text-blue-600" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {user?.userType}
                    </span>
                  </div>
                  {user?.isVerified && (
                    <div className="flex items-center justify-center mt-2">
                      <Shield size={16} className="text-green-600 mr-1" />
                      <span className="text-sm text-green-600 font-medium">Verified</span>
                    </div>
                  )}
                  

                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="input-field"
                          required
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <User size={20} className="text-gray-400 mr-3" />
                          <span>{user?.name || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Mail size={20} className="text-gray-400 mr-3" />
                        <span>{user?.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {editing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="input-field"
                          required
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Phone size={20} className="text-gray-400 mr-3" />
                          <span>{user?.phone || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Address Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          className="input-field"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <MapPin size={20} className="text-gray-400 mr-3" />
                          <span>{user?.address?.street || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          className="input-field"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          {user?.address?.city || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          className="input-field"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          {user?.address?.state || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          name="address.pincode"
                          value={formData.address.pincode}
                          onChange={handleInputChange}
                          className="input-field"
                          pattern="[0-9]{6}"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          {user?.address?.pincode || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role-specific Information */}
                {user?.userType === 'farmer' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Farm Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Farm Size (acres)
                        </label>
                        {editing ? (
                          <input
                            type="number"
                            name="farmDetails.farmSize"
                            value={formData.farmDetails.farmSize}
                            onChange={handleInputChange}
                            className="input-field"
                            min="0"
                            step="0.1"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            {user?.farmDetails?.farmSize ? `${user.farmDetails.farmSize} acres` : 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Farming Experience (years)
                        </label>
                        {editing ? (
                          <input
                            type="number"
                            name="farmDetails.farmingExperience"
                            value={formData.farmDetails.farmingExperience}
                            onChange={handleInputChange}
                            className="input-field"
                            min="0"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            {user?.farmDetails?.farmingExperience ? `${user.farmDetails.farmingExperience} years` : 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Crop Types
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            onChange={handleCropTypesChange}
                            className="input-field"
                            placeholder="Enter crop types separated by commas (e.g., rice, wheat, corn)"
                            defaultValue={user?.farmDetails?.cropTypes?.join(', ') || ''}
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            {user?.farmDetails?.cropTypes?.length > 0
                              ? user.farmDetails.cropTypes.join(', ')
                              : 'Not provided'
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {user?.userType === 'buyer' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Company Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            name="companyDetails.companyName"
                            value={formData.companyDetails.companyName}
                            onChange={handleInputChange}
                            className="input-field"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            {user?.companyDetails?.companyName || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Type
                        </label>
                        {editing ? (
                          <select
                            name="companyDetails.companyType"
                            value={formData.companyDetails.companyType}
                            onChange={handleInputChange}
                            className="input-field"
                          >
                            <option value="">Select type</option>
                            {companyTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            {user?.companyDetails?.companyType
                              ? companyTypes.find(t => t.value === user.companyDetails.companyType)?.label
                              : 'Not provided'
                            }
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GST Number
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            name="companyDetails.gstNumber"
                            value={formData.companyDetails.gstNumber}
                            onChange={handleInputChange}
                            className="input-field"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            {user?.companyDetails?.gstNumber || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          License Number
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            name="companyDetails.licenseNumber"
                            value={formData.companyDetails.licenseNumber}
                            onChange={handleInputChange}
                            className="input-field"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            {user?.companyDetails?.licenseNumber || 'Not provided'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;