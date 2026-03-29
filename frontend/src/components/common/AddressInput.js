import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { geoapifyService } from '../../utils/geoapifyService';

const AddressInput = ({ 
  address = {},
  onAddressChange,
  errors = {},
  disabled = false,
  className = ''
}) => {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Initialize search query from address
  useEffect(() => {
    if (address.formatted && !searchQuery) {
      setSearchQuery(address.formatted);
    }
  }, [address.formatted, searchQuery]);

  // Handle search input changes with debouncing
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setSelectedSuggestion(null);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search for very short queries
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce the search
    searchTimeoutRef.current = setTimeout(async () => {
      await searchAddresses(value);
    }, 300);
  };

  // Search addresses using Geoapify
  const searchAddresses = async (query) => {
    if (!query || query.length < 2) return;

    setLoadingSuggestions(true);
    try {
      const results = await geoapifyService.autocomplete(query, {
        limit: 8,
        filters: {
          filter: 'countrycode:in', // Focus on India
          bias: 'countrycode:in'
        }
      });

      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Address search failed:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    console.log('🏠 Selected suggestion:', suggestion);
    console.log('📮 Postcode from suggestion:', suggestion.postcode);
    
    setSelectedSuggestion(suggestion);
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);

    // Update address with selected suggestion
    const newAddress = {
      street: address.street || '', // Keep existing street if any
      city: suggestion.city || '',
      state: suggestion.state || '',
      pincode: suggestion.postcode || '',
      country: suggestion.country || 'India',
      formatted: suggestion.name,
      lat: suggestion.lat,
      lng: suggestion.lon
    };

    console.log('📍 New address object:', newAddress);
    onAddressChange(newAddress);
  };

  // Handle manual field changes
  const handleFieldChange = (field, value) => {
    const newAddress = {
      ...address,
      [field]: value
    };

    // Update formatted address
    if (newAddress.street || newAddress.city || newAddress.state || newAddress.pincode) {
      const parts = [
        newAddress.street,
        newAddress.city,
        newAddress.state,
        newAddress.pincode
      ].filter(part => part && part.trim());
      newAddress.formatted = parts.join(', ');
      setSearchQuery(newAddress.formatted);
    }

    onAddressChange(newAddress);
  };

  // Get current location using Geoapify reverse geocoding
  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    
    try {
      // Get coordinates using browser geolocation
      const coords = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }),
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      });

      // Use Geoapify to get address from coordinates
      const addressData = await geoapifyService.reverseGeocode(coords.lat, coords.lng);
      
      const newAddress = {
        street: address.street || addressData.street || '',
        city: addressData.city || '',
        state: addressData.state || '',
        pincode: addressData.postcode || '',
        country: addressData.country || 'India',
        formatted: addressData.formatted,
        lat: coords.lat,
        lng: coords.lng
      };

      setSearchQuery(addressData.formatted);
      onAddressChange(newAddress);
      toast.success('Location detected successfully!');
    } catch (error) {
      console.error('Location detection failed:', error);
      toast.error(error.message || 'Failed to get current location');
    } finally {
      setLoadingLocation(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestion(null);
    onAddressChange({
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      formatted: '',
      lat: null,
      lng: null
    });
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format current address for display
  const getFormattedAddress = () => {
    if (address.formatted) {
      return address.formatted;
    }
    
    const parts = [
      address.street,
      address.city,
      address.state,
      address.pincode
    ].filter(part => part && part.trim());
    
    return parts.join(', ') || '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-medium text-gray-900">
          Address Information
        </h3>
        {/* Current Location Button */}
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loadingLocation || disabled}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadingLocation ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <Navigation size={16} />
          )}
          {loadingLocation ? 'Detecting...' : 'Current Location'}
        </button>
      </div>

      {/* Geoapify Autocomplete Search */}
      <div className="space-y-4">
        <div className="relative" ref={suggestionsRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Start typing your address..."
              disabled={disabled}
              className={`w-full px-3 py-2 pr-20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.formatted || errors.city || errors.state ? 'border-red-300' : 'border-gray-300'
              }`}
              autoComplete="off"
            />
            
            {/* Loading indicator */}
            {loadingSuggestions && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <Loader size={16} className="animate-spin text-gray-400" />
              </div>
            )}
            
            {/* Clear button */}
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                disabled={disabled}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id || index}
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                  disabled={disabled}
                >
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {suggestion.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {[suggestion.city, suggestion.state, suggestion.postcode].filter(Boolean).join(', ')}
                        {!suggestion.postcode && (
                          <span className="text-orange-500 ml-1">(Pincode not available)</span>
                        )}
                      </div>
                    </div>
                    {selectedSuggestion?.id === suggestion.id && (
                      <Check size={16} className="text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showSuggestions && suggestions.length === 0 && searchQuery.length >= 2 && !loadingSuggestions && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
              <div className="text-sm text-gray-500 text-center">
                No addresses found. Try a different search term.
              </div>
            </div>
          )}

          {errors.formatted && <p className="mt-1 text-sm text-red-600">{errors.formatted}</p>}
        </div>

        {/* Street Address (Manual) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address / Building Details
          </label>
          <input
            type="text"
            value={address.street || ''}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.street ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="House/Flat number, Building name, Street"
            disabled={disabled}
            autoComplete="street-address"
          />
          {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
        </div>

        {/* Manual Address Fields (Optional) */}
        {address.city || address.state || address.pincode ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={address.city || ''}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.city ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="City"
                disabled={disabled}
              />
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={address.state || ''}
                onChange={(e) => handleFieldChange('state', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.state ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="State"
                disabled={disabled}
              />
              {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode
              </label>
              <input
                type="text"
                value={address.pincode || ''}
                onChange={(e) => handleFieldChange('pincode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.pincode ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Pincode"
                disabled={disabled}
                maxLength={6}
              />
              {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
            </div>
          </div>
        ) : null}
      </div>

      {/* Address Preview */}
      {getFormattedAddress() && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <strong>Complete Address:</strong><br />
              {getFormattedAddress()}
              {address.lat && address.lng && (
                <div className="text-xs text-gray-500 mt-1">
                  Coordinates: {address.lat.toFixed(6)}, {address.lng.toFixed(6)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Geoapify Attribution */}
      {geoapifyService.isAvailable() && (
        <div className="text-xs text-gray-400 text-center">
          Powered by <a href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer" className="underline">Geoapify</a>
        </div>
      )}
    </div>
  );
};

export default AddressInput;