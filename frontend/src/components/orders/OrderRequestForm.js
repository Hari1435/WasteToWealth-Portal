import React, { useState, useEffect } from 'react';
import { Package, Send, MapPin, Truck } from 'lucide-react';
import AddressInput from '../common/AddressInput';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/helpers';
import { rapidApiDistance } from '../../utils/rapidApiDistance';
import { calculatePrice, convertToTons, formatUnit, getAvailableUnits } from '../../utils/unitConversions';
import toast from 'react-hot-toast';

const OrderRequestForm = ({ waste, onSubmit, loading = false }) => {
  const [orderData, setOrderData] = useState({
    quantity: {
      amount: '',
      unit: 'tons'
    },
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      formatted: '',
      lat: null,
      lng: null
    },
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [calculatingDistance, setCalculatingDistance] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for quantity.amount to preserve exact values
    let processedValue = value;
    if (name === 'quantity.amount') {
      // Allow digits and one decimal point for quantity
      processedValue = value.replace(/[^0-9.]/g, '');
      // Ensure only one decimal point
      const parts = processedValue.split('.');
      if (parts.length > 2) {
        processedValue = parts[0] + '.' + parts.slice(1).join('');
      }
      // Prevent leading zeros except for decimal values like 0.5
      if (processedValue.length > 1 && processedValue[0] === '0' && processedValue[1] !== '.') {
        processedValue = processedValue.substring(1);
      }
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setOrderData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: processedValue
        }
      }));
    } else {
      setOrderData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddressChange = (newAddress) => {
    setOrderData(prev => ({
      ...prev,
      deliveryAddress: newAddress
    }));

    if (errors.deliveryAddress) {
      setErrors(prev => ({ ...prev, deliveryAddress: null }));
    }

    // Reset distance info when address changes
    setDistanceInfo(null);
  };

  // Calculate distance when both addresses are available
  useEffect(() => {
    const calculateDistance = async () => {
      // Check if we have farmer coordinates (either from lat/lng fields or coordinates array)
      const farmerLat = waste?.location?.lat || (waste?.location?.coordinates && waste.location.coordinates[1]);
      const farmerLng = waste?.location?.lng || (waste?.location?.coordinates && waste.location.coordinates[0]);
      
      // Validate all required coordinates
      if (!farmerLat || !farmerLng || 
          !orderData.deliveryAddress.lat || 
          !orderData.deliveryAddress.lng ||
          isNaN(farmerLat) || isNaN(farmerLng) ||
          isNaN(orderData.deliveryAddress.lat) ||
          isNaN(orderData.deliveryAddress.lng)) {
        setDistanceInfo(null);
        return;
      }

      setCalculatingDistance(true);
      try {
        const origin = {
          lat: parseFloat(farmerLat),
          lng: parseFloat(farmerLng)
        };
        
        const destination = {
          lat: parseFloat(orderData.deliveryAddress.lat),
          lng: parseFloat(orderData.deliveryAddress.lng)
        };

        const result = await rapidApiDistance.calculateDistance(origin, destination);
        
        // Set the distance info from any available method
        setDistanceInfo(result);
        
        // Show appropriate success message
        if (result.roadDistance) {
          console.log('✅ Road distance calculated successfully');
        } else {
          console.log('✅ Estimated distance calculated using fallback method');
        }
      } catch (error) {
        console.error('Distance calculation failed:', error);
        
        // Don't show error toast, just log it
        console.warn('Distance calculation unavailable, order can still be placed');
        setDistanceInfo(null);
      } finally {
        setCalculatingDistance(false);
      }
    };

    calculateDistance();
  }, [waste?.location?.lat, waste?.location?.lng, waste?.location?.coordinates, orderData.deliveryAddress.lat, orderData.deliveryAddress.lng]);

  const validateForm = () => {
    const newErrors = {};

    // Validate quantity
    const quantity = parseFloat(orderData.quantity.amount);
    if (!quantity || quantity <= 0) {
      newErrors['quantity.amount'] = 'Please enter a valid quantity';
    } else if (quantity > waste.quantity.amount) {
      newErrors['quantity.amount'] = `Cannot exceed available quantity (${waste.quantity.amount} ${waste.quantity.unit})`;
    }

    // Validate delivery address
    if (!orderData.deliveryAddress.city?.trim()) {
      newErrors.deliveryAddress = 'City is required';
    }
    if (!orderData.deliveryAddress.state?.trim()) {
      newErrors.deliveryAddress = 'State is required';
    }
    if (!orderData.deliveryAddress.pincode?.trim()) {
      newErrors.deliveryAddress = 'Pincode is required';
    } else if (!/^\d{6}$/.test(orderData.deliveryAddress.pincode.trim())) {
      newErrors.deliveryAddress = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('🔍 Form submission attempt');
    
    if (validateForm()) {
      console.log('✅ Form validation passed, creating order payload');
      
      const orderPayload = {
        wasteId: waste._id,
        quantity: {
          amount: parseFloat(orderData.quantity.amount),
          unit: orderData.quantity.unit
        },
        deliveryDetails: {
          method: 'delivery',
          address: `${orderData.deliveryAddress.street || ''} ${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.state} ${orderData.deliveryAddress.pincode}`.trim(),
          coordinates: {
            lat: orderData.deliveryAddress.lat,
            lng: orderData.deliveryAddress.lng
          }
        },
        notes: orderData.notes.trim(),
        // Include distance information
        distanceInfo: distanceInfo ? {
          distanceKm: parseFloat(distanceInfo.distanceKm),
          durationMinutes: distanceInfo.durationMinutes,
          calculationMethod: distanceInfo.source.includes('OpenRouteService') ? 'openroute' : 
                           distanceInfo.source.includes('RapidAPI') ? 'rapidapi' : 'haversine',
          pickupLocation: {
            address: waste.location?.address || `${waste.location?.city}, ${waste.location?.state}`,
            coordinates: {
              lat: waste.location?.lat || (waste.location?.coordinates && waste.location.coordinates[1]),
              lng: waste.location?.lng || (waste.location?.coordinates && waste.location.coordinates[0])
            }
          },
          deliveryLocation: {
            address: orderData.deliveryAddress.formatted,
            coordinates: {
              lat: orderData.deliveryAddress.lat,
              lng: orderData.deliveryAddress.lng
            }
          }
        } : null
      };

      console.log('🚀 Calling onSubmit function with payload');
      onSubmit(orderPayload);
    } else {
      console.log('❌ Form validation failed');
      toast.error('Please fill in all required fields correctly');
    }
  };

  const calculateEstimatedCost = () => {
    if (!orderData.quantity.amount) return 0;
    // Use the new calculatePrice function that converts to tons for pricing
    return calculatePrice(orderData.quantity.amount, orderData.quantity.unit, waste.pricePerUnit);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Send className="text-primary-600" size={20} />
        Place Order
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quantity Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quantity Required *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                inputMode="decimal"
                name="quantity.amount"
                value={orderData.quantity.amount}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors['quantity.amount'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Amount (e.g., 10 or 10.5)"
                autoComplete="off"
                spellCheck="false"
              />
              {errors['quantity.amount'] && (
                <p className="text-red-600 text-sm mt-1">{errors['quantity.amount']}</p>
              )}
            </div>
            <div>
              <select
                name="quantity.unit"
                value={orderData.quantity.unit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {getAvailableUnits().map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              Available: {waste.quantity.amount} {formatUnit(waste.quantity.unit)}
            </p>
            {orderData.quantity.amount && orderData.quantity.unit !== 'tons' && (
              <p className="text-xs text-blue-600">
                💡 {orderData.quantity.amount} {formatUnit(orderData.quantity.unit)} = {convertToTons(orderData.quantity.amount, orderData.quantity.unit).toFixed(3)} tons (for pricing)
              </p>
            )}
          </div>

        </div>

        {/* Delivery Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Delivery Address *
          </label>
          <AddressInput
            address={orderData.deliveryAddress}
            onAddressChange={handleAddressChange}
            errors={errors}
            disabled={loading}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={orderData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Any special requirements or instructions..."
          />
        </div>

        {/* Distance Information */}
        {(distanceInfo || calculatingDistance) && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              Distance Information
            </h4>
            {calculatingDistance ? (
              <div className="flex items-center gap-2 text-blue-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Calculating distance...</span>
              </div>
            ) : distanceInfo ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Distance:</span>
                  <span className="font-medium text-blue-900">
                    {distanceInfo.distanceKm} km
                    {distanceInfo.roadDistance && (
                      <span className="ml-1 text-xs text-green-600 font-normal">(Road)</span>
                    )}
                  </span>
                </div>
                {distanceInfo.durationMinutes && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Est. Travel Time:</span>
                    <span className="font-medium text-blue-900">
                      {Math.floor(distanceInfo.durationMinutes / 60)}h {distanceInfo.durationMinutes % 60}m
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-blue-700">Calculation Method:</span>
                  <span className="font-medium text-blue-900">{distanceInfo.source}</span>
                </div>
                {distanceInfo.roadDistance && (
                  <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                    ✅ Using actual road distance for accurate delivery cost calculation
                  </div>
                )}
                {distanceInfo.note && (
                  <div className="mt-2 text-xs text-blue-600 bg-blue-100 p-2 rounded">
                    {distanceInfo.note}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Cost Estimate */}
        {orderData.quantity.amount && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Package size={16} className="text-gray-600" />
              Estimated Cost Breakdown
            </h4>
            <div className="space-y-2 text-sm">
              {/* Quantity and Conversion Info */}
              <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-blue-700">Quantity:</span>
                  <span className="font-medium text-blue-900">
                    {orderData.quantity.amount} {formatUnit(orderData.quantity.unit)}
                  </span>
                </div>
                {orderData.quantity.unit !== 'tons' && (
                  <div className="flex justify-between mb-1">
                    <span className="text-blue-700">Converted to tons:</span>
                    <span className="font-medium text-blue-900">
                      {convertToTons(orderData.quantity.amount, orderData.quantity.unit).toFixed(3)} tons
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-blue-700">Price per ton:</span>
                  <span className="font-medium text-blue-900">
                    {formatCurrency(waste.pricePerUnit)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Waste Cost:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(calculateEstimatedCost())}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Subtotal:</span>
                  <span className="font-bold text-primary-600">
                    {formatCurrency(calculateEstimatedCost())}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-center gap-2 text-yellow-800">
                <Truck size={14} />
                <span className="text-xs font-medium">Delivery charges will be added by the farmer based on distance and truck selection</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading || !orderData.quantity.amount}
            loading={loading}
            className="flex-1"
          >
            <Send size={20} />
            {loading ? 'Creating Order...' : 'Place Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderRequestForm;