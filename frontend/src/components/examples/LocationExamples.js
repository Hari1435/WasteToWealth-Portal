import React, { useState } from 'react';
import GeoapifyLocationInput from '../common/GeoapifyLocationInput';
import AddressInput from '../common/AddressInput';
import LocationInput from '../common/LocationInput';

const LocationExamples = () => {
  const [simpleLocation, setSimpleLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [legacyLocation, setLegacyLocation] = useState({
    city: '',
    state: '',
    pincode: ''
  });

  const handleLegacyLocationChange = (field, value) => {
    setLegacyLocation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Location Input Examples
        </h1>
        <p className="text-gray-600">
          Demonstrating Geoapify integration with various location input components
        </p>
      </div>

      {/* Example 1: Simple Geoapify Location Input */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          1. Simple Location Search
        </h2>
        <p className="text-gray-600 mb-4">
          Basic location input with Geoapify autocomplete
        </p>
        
        <GeoapifyLocationInput
          value={simpleLocation}
          onChange={setSimpleLocation}
          onLocationSelect={setSelectedLocation}
          placeholder="Search for any location in India..."
          label="Location"
          required
        />

        {selectedLocation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Selected Location:</h3>
            <pre className="text-sm text-blue-700 overflow-x-auto">
              {JSON.stringify(selectedLocation, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Example 2: Complete Address Input */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          2. Complete Address Input
        </h2>
        <p className="text-gray-600 mb-4">
          Full address form with search and manual entry modes
        </p>
        
        <AddressInput
          address={address}
          onAddressChange={setAddress}
          errors={{}}
        />

        {address.formatted && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Address Data:</h3>
            <pre className="text-sm text-green-700 overflow-x-auto">
              {JSON.stringify(address, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Example 3: Enhanced Legacy Component */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          3. Enhanced Legacy Location Input
        </h2>
        <p className="text-gray-600 mb-4">
          Existing LocationInput component now with Geoapify integration
        </p>
        
        <LocationInput
          city={legacyLocation.city}
          state={legacyLocation.state}
          pincode={legacyLocation.pincode}
          onLocationChange={handleLegacyLocationChange}
          errors={{}}
        />

        {(legacyLocation.city || legacyLocation.state || legacyLocation.pincode) && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-800 mb-2">Legacy Format:</h3>
            <pre className="text-sm text-purple-700 overflow-x-auto">
              {JSON.stringify(legacyLocation, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* API Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          API Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Geoapify API</h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                process.env.REACT_APP_GEOAPIFY_API_KEY ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {process.env.REACT_APP_GEOAPIFY_API_KEY ? 'Configured' : 'Not Configured'}
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Fallback Service</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">OpenStreetMap (Always Available)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-yellow-800 mb-4">
          Setup Instructions
        </h2>
        <div className="space-y-2 text-sm text-yellow-700">
          <p>1. Get a free API key from <a href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer" className="underline">Geoapify.com</a></p>
          <p>2. Add to your <code className="bg-yellow-100 px-1 rounded">.env</code> file:</p>
          <code className="block bg-yellow-100 p-2 rounded mt-2">
            REACT_APP_GEOAPIFY_API_KEY=your_api_key_here
          </code>
          <p>3. Restart your development server</p>
          <p>4. The components will automatically use Geoapify when available</p>
        </div>
      </div>
    </div>
  );
};

export default LocationExamples;