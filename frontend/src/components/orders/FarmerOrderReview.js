import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  User, 
  Clock, 
  DollarSign, 
  Check, 
  X, 
  Truck,
  Calculator
} from 'lucide-react';
import ManualDeliveryCharges from './ManualDeliveryCharges';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/helpers';

const FarmerOrderReview = ({ 
  order, 
  onAccept, 
  onReject, 
  loading = false 
}) => {
  const [deliveryCharges, setDeliveryCharges] = useState(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [farmerNotes, setFarmerNotes] = useState('');

  const handleDeliveryChargesSet = ({ deliveryCharges: charges, deliveryNotes: notes }) => {
    setDeliveryCharges(charges);
    setDeliveryNotes(notes);
  };

  const handleAcceptOrder = () => {
    if (!deliveryCharges) {
      alert('Please set delivery charges first');
      return;
    }

    const acceptData = {
      deliveryCharges: Number(deliveryCharges),
      deliveryNotes,
      farmerNotes: farmerNotes.trim()
    };

    console.log('Sending accept data:', acceptData);

    onAccept(acceptData);
  };

  const handleRejectOrder = () => {
    if (!farmerNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    onReject({
      orderId: order._id,
      farmerNotes: farmerNotes.trim()
    });
  };

  const formatDistance = (distanceKm) => {
    if (!distanceKm) return 'N/A';
    return `${parseFloat(distanceKm).toFixed(1)} km`;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">
          Order Review - {order.orderNumber}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.status === 'pending' 
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buyer Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <User className="text-primary-500" size={18} />
            Buyer Information
          </h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div>
              <span className="text-sm text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{order.buyer?.name}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Email:</span>
              <span className="ml-2">{order.buyer?.email}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Phone:</span>
              <span className="ml-2">{order.buyer?.phone}</span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Package className="text-primary-500" size={18} />
            Order Details
          </h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div>
              <span className="text-sm text-gray-600">Waste Type:</span>
              <span className="ml-2 font-medium">{order.waste?.type}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Quantity:</span>
              <span className="ml-2 font-medium">
                {order.quantity.amount} {order.quantity.unit}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Waste Amount:</span>
              <span className="ml-2 font-medium">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Order Date:</span>
              <span className="ml-2">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Distance Information */}
      {order.distanceInfo && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <MapPin className="text-blue-600" size={18} />
            Distance & Location Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Pickup Location:</h5>
              <p className="text-sm text-blue-700">
                {order.distanceInfo.pickupLocation?.address}
              </p>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Delivery Location:</h5>
              <p className="text-sm text-blue-700">
                {order.distanceInfo.deliveryLocation?.address}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-blue-600" />
              <span className="text-blue-700">
                Distance: {formatDistance(order.distanceInfo.distanceKm)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-blue-600" />
              <span className="text-blue-700">
                Est. Time: {formatDuration(order.distanceInfo.durationMinutes)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calculator size={14} className="text-blue-600" />
              <span className="text-blue-700">
                Method: {order.distanceInfo.calculationMethod}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Notes */}
      {order.notes && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Buyer Notes:</h4>
          <p className="text-gray-700 text-sm">{order.notes}</p>
        </div>
      )}

      {/* Manual Delivery Charges */}
      <div className="border-t pt-6">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Truck className="text-primary-500" size={18} />
          Set Manual Delivery Charges
        </h4>

        {!deliveryCharges ? (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-blue-800 text-sm mb-4">
              Please set the delivery charges for this order. Consider distance, fuel costs, and vehicle requirements.
            </p>
            <ManualDeliveryCharges
              order={order}
              onChargesSet={handleDeliveryChargesSet}
            />
          </div>
        ) : (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <DollarSign className="text-green-600" size={18} />
              Delivery Charges Set
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Delivery Charges:</span>
                <span className="font-medium">{formatCurrency(deliveryCharges)}</span>
              </div>
              {deliveryNotes && (
                <div>
                  <span className="text-green-700">Notes:</span>
                  <span className="ml-2">{deliveryNotes}</span>
                </div>
              )}
              <div className="border-t border-green-300 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-green-900">Total Amount:</span>
                  <span className="font-bold text-lg text-green-900">
                    {formatCurrency(order.totalAmount + deliveryCharges)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setDeliveryCharges(null);
                setDeliveryNotes('');
              }}
              className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Change Charges
            </button>
          </div>
        )}
      </div>



      {/* Farmer Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes to Buyer {!deliveryCharges ? '(Required for rejection)' : '(Optional)'}
        </label>
        <textarea
          value={farmerNotes}
          onChange={(e) => setFarmerNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          placeholder={deliveryCharges 
            ? "Any additional information for the buyer..."
            : "Please provide a reason for rejection..."
          }
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t">
        <Button
          onClick={handleRejectOrder}
          variant="outline"
          className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
          disabled={loading}
        >
          <X size={20} />
          Reject Order
        </Button>
        
        <Button
          onClick={handleAcceptOrder}
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={loading || !deliveryCharges}
          loading={loading}
        >
          <Check size={20} />
          Accept Order - {deliveryCharges ? formatCurrency(order.totalAmount + deliveryCharges) : 'Set Delivery Charges First'}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 text-center">
        Once you accept the order, the buyer will be notified and can proceed with payment
      </div>
    </div>
  );
};

export default FarmerOrderReview;