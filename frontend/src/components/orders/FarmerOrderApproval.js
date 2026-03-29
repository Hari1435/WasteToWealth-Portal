import React, { useState } from 'react';
import { CheckCircle, XCircle, Calculator, MapPin, Package } from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/helpers';

const FarmerOrderApproval = ({ order, onApprove, onReject, loading = false }) => {
  const [action, setAction] = useState(null); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [deliveryCharges] = useState({
    totalDeliveryCharges: 10000 // Fixed delivery charge
  });
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('2-3 days');
  const [farmerNotes, setFarmerNotes] = useState('');

  const wasteAmount = order.totalAmount;

  const handleApprove = () => {
    onApprove({
      action: 'approve',
      deliveryCharges,
      estimatedDeliveryTime,
      farmerNotes
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    onReject({
      action: 'reject',
      rejectionReason: rejectionReason.trim()
    });
  };

  const calculateFinalTotal = () => {
    const platformFee = Math.round((wasteAmount + deliveryCharges.totalDeliveryCharges) * 0.02);
    return wasteAmount + deliveryCharges.totalDeliveryCharges + platformFee;
  };


  if (action === 'reject') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <XCircle className="text-red-600" size={20} />
          Reject Order Request
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rejection *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              placeholder="Please explain why you're rejecting this order..."
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleReject}
              disabled={loading}
              loading={loading}
              variant="danger"
              className="flex-1"
            >
              <XCircle size={20} />
              {loading ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
            <Button
              onClick={() => setAction(null)}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <CheckCircle className="text-green-600" size={20} />
        Review Order Request
      </h3>

      {/* Order Details */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Order Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Buyer:</span>
            <span className="ml-2 font-medium">{order.buyer.name}</span>
          </div>
          <div>
            <span className="text-gray-600">Quantity:</span>
            <span className="ml-2 font-medium">{order.quantity.amount} {order.quantity.unit}</span>
          </div>
          <div>
            <span className="text-gray-600">Waste Cost:</span>
            <span className="ml-2 font-medium">{formatCurrency(wasteAmount)}</span>
          </div>
          <div>
            <span className="text-gray-600">Distance:</span>
            <span className="ml-2 font-medium">
              {distance > 0 ? `${distance} km` : 'Not calculated'}
            </span>
          </div>
        </div>
        
        {order.deliveryDetails?.address && (
          <div className="mt-3">
            <span className="text-gray-600">Delivery Address:</span>
            <p className="text-gray-900 mt-1">{order.deliveryDetails.address}</p>
          </div>
        )}
      </div>

      {/* Delivery Charges */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
          <Calculator size={16} />
          Delivery Charges
        </h4>
        <div className="flex justify-between">
          <span className="font-medium text-green-900">Fixed Delivery Charges:</span>
          <span className="font-bold text-green-900">₹{deliveryCharges.totalDeliveryCharges}</span>
        </div>
      </div>

      {/* Final Pricing */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Final Pricing Breakdown</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Waste Cost:</span>
            <span className="font-medium">₹{wasteAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Charges:</span>
            <span className="font-medium">₹{deliveryCharges.totalDeliveryCharges}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Platform Fee (2%):</span>
            <span className="font-medium">₹{Math.round((wasteAmount + deliveryCharges.totalDeliveryCharges) * 0.02)}</span>
          </div>
          <div className="border-t border-gray-300 pt-2">
            <div className="flex justify-between">
              <span className="font-bold text-gray-900">Total Amount:</span>
              <span className="font-bold text-primary-600 text-lg">₹{calculateFinalTotal()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Delivery Time
          </label>
          <select
            value={estimatedDeliveryTime}
            onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="1-2 days">1-2 days</option>
            <option value="2-3 days">2-3 days</option>
            <option value="3-5 days">3-5 days</option>
            <option value="1 week">1 week</option>
            <option value="Custom">Custom timeline</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes for Buyer (Optional)
          </label>
          <textarea
            value={farmerNotes}
            onChange={(e) => setFarmerNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Any special instructions or information for the buyer..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleApprove}
          disabled={loading}
          loading={loading}
          className="flex-1"
        >
          <CheckCircle size={20} />
          {loading ? 'Approving...' : 'Approve Order'}
        </Button>
        <Button
          onClick={() => setAction('reject')}
          variant="outline"
          disabled={loading}
        >
          <XCircle size={20} />
          Reject
        </Button>
      </div>
    </div>
  );
};

export default FarmerOrderApproval;