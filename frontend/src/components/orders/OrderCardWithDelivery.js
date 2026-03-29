import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  DollarSign, 
  Truck,
  Brain,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Button from '../common/Button';
import DeliveryLocationCard from './DeliveryLocationCard';

const OrderCardWithDelivery = ({ 
  order, 
  onAcceptOrder, 
  onRejectOrder, 
  onPayment,
  userRole = 'buyer' // 'buyer' or 'farmer'
}) => {
  const [deliveryCharges, setDeliveryCharges] = useState(null);
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);
  const [showDeliveryCard, setShowDeliveryCard] = useState(false);

  const calculateDeliveryCharges = async () => {
    setCalculatingDelivery(true);
    
    try {
      // Simulate ML API call
      const response = await fetch('/api/orders/optimize-delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          quantity: order.quantity.amount,
          distance: order.distanceInfo?.distanceKm || 150,
          region: 'suburban'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveryCharges(data.delivery_charge);
      } else {
        // Fallback calculation
        const fallbackCost = Math.round(order.quantity.amount * 50 + (order.distanceInfo?.distanceKm || 150) * 15);
        setDeliveryCharges(fallbackCost);
      }
    } catch (error) {
      console.error('Delivery calculation failed:', error);
      // Fallback calculation
      const fallbackCost = Math.round(order.quantity.amount * 50 + (order.distanceInfo?.distanceKm || 150) * 15);
      setDeliveryCharges(fallbackCost);
    } finally {
      setCalculatingDelivery(false);
    }
  };

  const handleAcceptOrder = () => {
    if (onAcceptOrder) {
      onAcceptOrder({
        ...order,
        deliveryCharges,
        totalAmount: order.totalAmount + (deliveryCharges || 0)
      });
    }
  };

  const handlePayment = () => {
    if (onPayment) {
      onPayment({
        orderId: order._id,
        wasteAmount: order.totalAmount,
        deliveryCharges: deliveryCharges || 0,
        totalAmount: order.totalAmount + (deliveryCharges || 0)
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Order #{order.orderNumber || order._id?.slice(-6)}
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
          </span>
        </div>

        {/* Order Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Package className="text-blue-600" size={20} />
            <div>
              <div className="font-medium">{order.waste?.type}</div>
              <div className="text-sm text-gray-500">{order.quantity.amount} {order.quantity.unit}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DollarSign className="text-green-600" size={20} />
            <div>
              <div className="font-medium">₹{order.totalAmount?.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Waste Value</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="text-orange-600" size={20} />
            <div>
              <div className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
              <div className="text-sm text-gray-500">Order Date</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      {order.distanceInfo && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Delivery Information</h4>
            <button
              onClick={() => setShowDeliveryCard(!showDeliveryCard)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showDeliveryCard ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {showDeliveryCard && (
            <DeliveryLocationCard
              pickupLocation={order.distanceInfo.pickupLocation?.address || 'Pickup Location'}
              deliveryLocation={order.distanceInfo.deliveryLocation?.address || 'Delivery Location'}
              distance={`${order.distanceInfo.distanceKm} km`}
              estimatedTime={`${Math.round(order.distanceInfo.durationMinutes / 60)}h ${order.distanceInfo.durationMinutes % 60}m`}
              quantity={order.quantity.amount}
              onCalculateDelivery={calculateDeliveryCharges}
              deliveryCharges={deliveryCharges}
              loading={calculatingDelivery}
            />
          )}
        </div>
      )}

      {/* Delivery Charges Summary */}
      {deliveryCharges && (
        <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="text-green-600" size={18} />
              AI-Calculated Delivery Charges
            </h4>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ₹{deliveryCharges.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Delivery Cost</div>
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Waste Amount:</span>
                <span className="font-medium">₹{order.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Charges:</span>
                <span className="font-medium text-green-600">₹{deliveryCharges.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total Amount:</span>
                  <span className="font-bold text-lg text-blue-600">
                    ₹{(order.totalAmount + deliveryCharges).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-6">
        {userRole === 'farmer' && order.status === 'pending' && (
          <div className="flex gap-4">
            <Button
              onClick={onRejectOrder}
              variant="outline"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
            >
              Reject Order
            </Button>
            
            <Button
              onClick={handleAcceptOrder}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!deliveryCharges}
            >
              <CheckCircle size={20} />
              {deliveryCharges 
                ? `Accept Order (₹${(order.totalAmount + deliveryCharges).toLocaleString()})`
                : 'Calculate Delivery First'
              }
            </Button>
          </div>
        )}

        {userRole === 'buyer' && order.status === 'accepted' && (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={20} />
                <span className="font-medium text-green-900">Order Accepted by Farmer!</span>
              </div>
              <p className="text-sm text-green-700">
                Your order has been accepted. Proceed with payment to confirm delivery.
              </p>
            </div>

            <Button
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={!deliveryCharges}
            >
              <CreditCard size={20} />
              Pay Now - ₹{deliveryCharges ? (order.totalAmount + deliveryCharges).toLocaleString() : '---'}
            </Button>
          </div>
        )}

        {userRole === 'buyer' && order.status === 'pending' && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={20} />
              <span className="font-medium text-yellow-900">Waiting for Farmer Response</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              The farmer is reviewing your order. You'll be notified once they respond.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCardWithDelivery;