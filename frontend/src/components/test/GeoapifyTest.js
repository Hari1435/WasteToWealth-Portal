import React, { useState } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';
import AddressInput from '../common/AddressInput';
import { geoapifyService } from '../../utils/geoapifyService';
import { distanceService } from '../../utils/distanceService';

const GeoapifyTest = () => {
  const [address1, setAddress1] = useState({});
  const [address2, setAddress2] = useState({});
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateDistance = async () => {
    if (!address1.lat || !address1.lng || !address2.lat || !address2.lng) {
      alert('Please select both addresses with coordinates');
      return;
    }

    setLoading(true);
    try {
      const result = await distanceService.calculateDistance(
        { lat: address1.lat, lng: address1.lng },
        { lat: address2.lat, lng: address2.lng }
      );
      setDistance(result);
    } catch (error) {
      console.error('Distance calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Geoapify Integration Test
        </h1>
        <p className="text-gray-600">
          Test the Geoapify API integration for address autocomplete and distance calculation
        </p>
      </div>

      {/* API Status */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-2">API Status</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${geoapifyService.isAvailable() ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={geoapifyService.isAvailable() ? 'text-green-700' : 'text-red-700'}>
            Geoapify API: {geoapifyService.isAvailable() ? 'Available' : 'Not Available'}
          </span>
        </div>
      </div>

      {/* Address Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="text-primary-500" size={20} />
            Origin Address
          </h2>
          <AddressInput
            address={address1}
            onAddressChange={setAddress1}
            className="space-y-4"
          />
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="text-primary-500" size={20} />
            Destination Address
          </h2>
          <AddressInput
            address={address2}
            onAddressChange={setAddress2}
            className="space-y-4"
          />
        </div>
      </div>

      {/* Distance Calculation */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Navigation className="text-primary-500" size={20} />
          Distance Calculation
        </h2>
        
        <button
          onClick={calculateDistance}
          disabled={loading || !address1.lat || !address2.lat}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search size={16} />
          {loading ? 'Calculating...' : 'Calculate Distance'}
        </button>

        {distance && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Distance Results:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Distance:</strong> {distanceService.formatDistance(distance.distanceKm)}</p>
              {distance.durationMinutes && (
                <p><strong>Travel Time:</strong> {distanceService.formatDuration(distance.durationMinutes)}</p>
              )}
              <p><strong>Method:</strong> {distance.success ? 'Geoapify API' : 'Haversine Formula'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Address Details */}
      {(address1.formatted || address2.formatted) && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Selected Addresses</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {address1.formatted && (
              <div className="p-3 bg-gray-50 rounded">
                <h3 className="font-medium text-gray-900 mb-1">Origin:</h3>
                <p className="text-sm text-gray-600">{address1.formatted}</p>
                {address1.lat && address1.lng && (
                  <p className="text-xs text-gray-500 mt-1">
                    {address1.lat.toFixed(6)}, {address1.lng.toFixed(6)}
                  </p>
                )}
              </div>
            )}
            
            {address2.formatted && (
              <div className="p-3 bg-gray-50 rounded">
                <h3 className="font-medium text-gray-900 mb-1">Destination:</h3>
                <p className="text-sm text-gray-600">{address2.formatted}</p>
                {address2.lat && address2.lng && (
                  <p className="text-xs text-gray-500 mt-1">
                    {address2.lat.toFixed(6)}, {address2.lng.toFixed(6)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeoapifyTest;