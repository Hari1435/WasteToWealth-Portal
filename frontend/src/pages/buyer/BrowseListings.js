import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Package, 
  DollarSign,
  User,
  Star,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { wasteAPI } from '../../utils/api';
import { useApiWithLoading } from '../../hooks/useApiWithLoading';
import { formatCurrency, getWasteTypeLabel, getWasteTypeColor, getQualityGradeColor, getWasteStatusLabel, getWasteStatusColor } from '../../utils/helpers';
// LoadingSpinner removed - all loaders disabled as requested
import Button from '../../components/common/Button';
import DistanceDisplay from '../../components/common/DistanceDisplay';

import { useAuth } from '../../context/AuthContext';

const BrowseListings = () => {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { callWithLoading } = useApiWithLoading();
  const { user } = useAuth();
  const [buyerLocation, setBuyerLocation] = useState(null);
  const [filters, setFilters] = useState({
    wasteType: '',
    city: '',
    state: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const wasteTypes = [
    { value: '', label: 'All Types' },
    { value: 'crop_residue', label: 'Crop Residue' },
    { value: 'fruit_peels', label: 'Fruit Peels' },
    { value: 'vegetable_waste', label: 'Vegetable Waste' },
    { value: 'grain_husk', label: 'Grain Husk' },
    { value: 'leaves', label: 'Leaves' },
    { value: 'stems', label: 'Stems' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'pricePerUnit-asc', label: 'Price: Low to High' },
    { value: 'pricePerUnit-desc', label: 'Price: High to Low' }
  ];

  const fetchListings = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: 12,
      ...filters
    };
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '') delete params[key];
    });

    try {
      if (isInitialLoad) {
        // Show tractor loading for initial page load only
        const response = await callWithLoading(
          () => wasteAPI.getAll(params),
          'Loading waste listings...'
        );
        setListings(response.data.data.wastes || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
        setIsInitialLoad(false);
      } else {
        // Regular load for pagination and subsequent loads
        const response = await wasteAPI.getAll(params);
        setListings(response.data.data.wastes || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      // Silent error handling - don't show toast to user
      setListings([]);
      setTotalPages(1);
      setIsInitialLoad(false);
    }
  }, [currentPage, filters, callWithLoading, isInitialLoad]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsInitialLoad(false);
      fetchListings();
      return;
    }

    try {
      const response = await callWithLoading(
        () => wasteAPI.search(searchTerm, {
          page: currentPage,
          limit: 12
        }),
        'Searching waste listings...'
      );
      setListings(response.data.data.wastes || []);
      setTotalPages(response.data.data.pagination?.totalPages || 1);
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Search failed:', error);
      // Silent error handling - don't show toast to user
      setListings([]);
      setTotalPages(1);
      setIsInitialLoad(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      wasteType: '',
      city: '',
      state: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchTerm('');
    setCurrentPage(1);
    setIsInitialLoad(true);
  };

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Get buyer's location for distance calculations
  useEffect(() => {
    if (user?.address?.lat && user?.address?.lng) {
      setBuyerLocation({
        lat: user.address.lat,
        lng: user.address.lng
      });
    }
  }, [user]);

  return (
    <div className="page-container">
      <div className="responsive-container responsive-padding">
        {/* All loading states removed as requested */}
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="responsive-title text-gray-900 mb-2">
            Browse Waste Listings
          </h1>
          <p className="responsive-text text-gray-600">
            Discover agricultural waste materials from farmers across the country
          </p>
        </div>

        {/* Search and Filters */}
        <div className="responsive-card mb-6 sm:mb-8">
          <div className="responsive-flex-between mb-4">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search by title, crop source, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="input-field pl-8 sm:pl-10"
                />
              </div>
            </div>
            <div className="responsive-button-group">
              <Button onClick={handleSearch} className="responsive-button">
                <Search size={16} className="sm:w-5 sm:h-5" />
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="responsive-button"
              >
                <Filter size={16} className="sm:w-5 sm:h-5" />
                Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="responsive-grid-4 responsive-gap mb-4">
                <select
                  value={filters.wasteType}
                  onChange={(e) => handleFilterChange('wasteType', e.target.value)}
                  className="input-field"
                >
                  {wasteTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="input-field"
                />

                <input
                  type="text"
                  placeholder="State"
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="input-field"
                />

                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="input-field"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="responsive-form-grid responsive-gap mb-4">
                <input
                  type="number"
                  placeholder="Min Price (₹)"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="input-field"
                  min="0"
                  step="0.01"
                />

                <input
                  type="number"
                  placeholder="Max Price (₹)"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="input-field"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={clearFilters} className="responsive-button">
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {listings.length > 0 ? (
          <>
            <div className="responsive-grid-3 mb-6 lg:mb-8">
              {listings.map((listing) => (
                <div key={listing._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={48} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getWasteTypeColor(listing.wasteType)}`}>
                        {getWasteTypeLabel(listing.wasteType)}
                      </span>
                    </div>
                    {listing.qualityGrade && (
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getQualityGradeColor(listing.qualityGrade)}`}>
                          Grade {listing.qualityGrade}
                        </span>
                      </div>
                    )}
                    {/* Status indicator */}
                    {listing.status !== 'available' && (
                      <div className="absolute bottom-3 left-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getWasteStatusColor(listing.status)}`}>
                          {getWasteStatusLabel(listing.status)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="responsive-padding-sm">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {listing.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center responsive-text-sm text-gray-600">
                        <Package size={14} className="mr-2 sm:w-4 sm:h-4" />
                        {listing.quantity.amount} {listing.quantity.unit} • {listing.cropSource}
                      </div>
                      <div className="flex items-center responsive-text-sm text-gray-600">
                        <DollarSign size={14} className="mr-2 sm:w-4 sm:h-4" />
                        {formatCurrency(listing.pricePerUnit)}/{listing.quantity.unit}
                      </div>
                      <div className="flex items-center responsive-text-sm text-gray-600">
                        <MapPin size={14} className="mr-2 sm:w-4 sm:h-4" />
                        {listing.location.city}, {listing.location.state}
                      </div>
                      {/* Distance Display */}
                      {buyerLocation && listing.location?.coordinates && (
                        <DistanceDisplay
                          origin={buyerLocation}
                          destination={{
                            lat: listing.location.coordinates.lat,
                            lng: listing.location.coordinates.lng
                          }}
                          compact={true}
                          showDeliveryAvailability={true}
                          maxDeliveryRadius={100}
                          className="text-xs"
                        />
                      )}
                      <div className="flex items-center responsive-text-sm text-gray-600">
                        <User size={14} className="mr-2 sm:w-4 sm:h-4" />
                        {listing.farmer?.name}
                        {listing.farmer?.rating > 0 && (
                          <div className="flex items-center ml-2">
                            <Star size={12} className="text-yellow-400 fill-current sm:w-3.5 sm:h-3.5" />
                            <span className="ml-1 text-xs">{listing.farmer.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 gap-3">
                      <div className="text-base sm:text-lg font-bold text-primary-600">
                        {formatCurrency(listing.totalPrice)}
                      </div>
                      <div className="responsive-button-group">
                        <Link to={`/waste/${listing._id}`} className="w-full sm:w-auto">
                          <Button size="sm" variant="outline" className="responsive-button">
                            <Eye size={14} className="sm:w-4 sm:h-4" />
                            View
                          </Button>
                        </Link>
                        {listing.status === 'available' && listing.quantity.amount > 0 ? (
                          <Link to={`/waste/${listing._id}?action=order`} className="w-full sm:w-auto">
                            <Button size="sm" className="responsive-button">
                              <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
                              Order
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" disabled className="responsive-button">
                            <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
                            {listing.status === 'sold_out' ? 'Sold Out' : 'Unavailable'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="responsive-button"
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1 overflow-x-auto">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="responsive-button"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No listings found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find what you're looking for
            </p>
            <Button onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseListings;