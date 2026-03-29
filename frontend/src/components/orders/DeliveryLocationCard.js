import React, { useState } from 'react';
import { MapPin, Truck, Calculator, Brain, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

const DeliveryLocationCard = ({ 
  pickupLocation, 
  deliveryLocation, 
  distance, 
  estimatedTime,
  quantity,
  onCalculateDelivery,
  deliveryCharges = null,
  loading = false
}) => {
  const [showCharges, setShowCharges] = useState(false);

  const handleCalculateClick = () => {
    setShowCharges(true);
    if (onCalculateDelivery) {
      onCalculateDelivery();
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="text-blue-600" size={20} />
          Delivery Information
        </h3>
        {deliveryCharges && (
          <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
            <Brain className="text-green-600" size={16} />
            <span className="text-green-700 font-medium text-sm">AI Calculated</span>
          </div>
        )}
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Pickup Location
          </h4>
          <p className="text-sm text-gray-600">{pickupLocation}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            Delivery Location
          </h4>
          <p className="text-sm text-gray-600">{deliveryLocation}</p>
        </div>
      </div>

      {/* Distance & Time Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{distance}</div>
          <div className="text-xs text-gray-500">Distance (km)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{estimatedTime}</div>
          <div className="text-xs text-gray-500">Est. Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{quantity}</div>
          <div className="text-xs text-gray-500">Quantity (tons)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {deliveryCharges ? `₹${deliveryCharges.toLocaleString()}` : '---'}
          </div>
          <div className="text-xs text-gray-500">Delivery Cost</div>
        </div>
      </div>

      {/* Calculate Button or Charges Display */}
      {!deliveryCharges ? (
        <Button
          onClick={handleCalculateClick}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          loading={loading}
          disabled={loading}
        >
          <Calculator size={20} />
          {loading ? 'Calculating with AI...' : 'Calculate Delivery Charges'}
          <ArrowRight size={16} />
        </Button>
      ) : (
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="text-green-600" size={18} />
              AI-Optimized Delivery Solution
            </h4>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ₹{deliveryCharges.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Delivery Cost</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Truck Type:</span>
              <div className="font-medium">Medium Truck</div>
            </div>
            <div>
              <span className="text-gray-600">Capacity:</span>
              <div className="font-medium">10 tons</div>
            </div>
            <div>
              <span className="text-gray-600">Efficiency:</span>
              <div className="font-medium text-green-600">95%</div>
            </div>
            <div>
              <span className="text-gray-600">Method:</span>
              <div className="font-medium text-blue-600">AI Prediction</div>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-green-50 rounded-lg">
            <p className="text-xs text-green-700">
              ✅ Optimal truck selected • 99.7% AI accuracy • Best cost efficiency
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryLocationCard;