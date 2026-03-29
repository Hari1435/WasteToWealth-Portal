import React, { useState } from 'react';
import { Truck, Calculator, MapPin, Package, DollarSign } from 'lucide-react';
import Button from '../common/Button';

const ManualDeliveryCharges = ({ 
  order, 
  onChargesSet,
  deliveryCharges = '',
  loading = false 
}) => {
  const [charges, setCharges] = useState(deliveryCharges || '');
  const [notes, setNotes] = useState('');
  
  console.log('ManualDeliveryCharges - Current charges state:', charges);

  const handleSetCharges = () => {
    const chargesNum = Number(charges);
    console.log('Setting charges:', charges, 'Parsed as:', chargesNum);
    
    if (isNaN(chargesNum) || chargesNum <= 0) {
      alert('Please enter valid delivery charges');
      return;
    }

    if (onChargesSet) {
      onChargesSet({
        deliveryCharges: chargesNum,
        deliveryNotes: notes.trim()
      });
    }
  };

  const calculateSuggestion = () => {
    // Simple calculation based on distance and quantity
    const distance = order.distanceInfo?.distanceKm || 100;
    const quantity = order.quantity?.amount || 1;
    
    // Basic formula: ₹15 per km + ₹50 per ton
    const suggested = Math.round((distance * 15) + (quantity * 50));
    setCharges(suggested.toString());
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Truck className="text-blue-600" size={20} />
          Set Delivery Charges
        </h3>
        <button
          onClick={calculateSuggestion}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Get Suggestion
        </button>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Package className="text-gray-500" size={16} />
            <span className="text-sm font-medium text-gray-700">Quantity</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {order.quantity?.amount} {order.quantity?.unit}
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="text-gray-500" size={16} />
            <span className="text-sm font-medium text-gray-700">Distance</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {order.distanceInfo?.distanceKm || 'N/A'} km
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="text-gray-500" size={16} />
            <span className="text-sm font-medium text-gray-700">Waste Value</span>
          </div>
          <div className="text-lg font-semibold text-green-600">
            ₹{order.totalAmount?.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Delivery Charges Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Charges (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={charges}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '');
                console.log('Input value:', value);
                setCharges(value);
              }}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
              placeholder="Enter delivery charges"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Consider distance, fuel costs, truck size, and time required
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Any special instructions or notes about delivery..."
          />
        </div>

        {/* Total Preview */}
        {charges && Number(charges) > 0 && (
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-gray-900 mb-3">Total Amount Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Waste Amount:</span>
                <span className="font-medium">₹{order.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Charges:</span>
                <span className="font-medium text-blue-600">₹{Number(charges).toLocaleString()}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total Amount:</span>
                  <span className="font-bold text-lg text-green-600">
                    ₹{(order.totalAmount + Number(charges)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Set Charges Button */}
        <Button
          onClick={handleSetCharges}
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={!charges || Number(charges) <= 0 || loading}
          loading={loading}
        >
          <Calculator size={20} />
          Set Delivery Charges
        </Button>
      </div>

      {/* Pricing Guidelines */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-900 mb-2">Pricing Guidelines:</h5>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Base rate: ₹10-20 per km depending on route</li>
          <li>• Quantity factor: ₹30-70 per ton</li>
          <li>• Urban areas: +20-30% for traffic</li>
          <li>• Fuel surcharge: Consider current fuel prices</li>
        </ul>
      </div>
    </div>
  );
};

export default ManualDeliveryCharges;