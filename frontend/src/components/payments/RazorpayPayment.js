import React, { useState } from 'react';
import { CreditCard, Shield } from 'lucide-react';
import Button from '../common/Button';
import { paymentAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const RazorpayPayment = ({ 
  orderDetails, 
  onPaymentSuccess, 
  onPaymentFailure,
  loading = false 
}) => {
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Create order on backend
      console.log('🔄 Creating payment order with data:', {
        orderId: orderDetails.orderId
      });

      const response = await paymentAPI.createOrder({
        orderId: orderDetails.orderId
      });

      console.log('✅ Payment order created:', response.data);
      const { razorpayOrder, order } = response.data.data;

      // Validate Razorpay key
      if (!process.env.REACT_APP_RAZORPAY_KEY_ID) {
        throw new Error('Razorpay key not configured');
      }

      // Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Waste2Wealth',
        description: `Payment for Order #${order.orderNumber}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyResponse = await paymentAPI.verifyPayment({
              orderId: orderDetails.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              paymentMethod: 'razorpay'
            });

            onPaymentSuccess(verifyResponse.data);
          } catch (error) {
            console.error('Payment verification error:', error);
            onPaymentFailure(error.response?.data?.message || error.message);
          }
        },
        prefill: {
          name: user?.name || 'Buyer',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: {
          order_id: orderDetails.orderId,
          waste_amount: orderDetails.wasteAmount,
          delivery_charges: orderDetails.deliveryCharges
        },
        theme: {
          color: '#059669' // Green theme matching your app
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        },
        config: {
          display: {
            language: 'en'
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initiation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Payment initiation failed';
      onPaymentFailure(errorMessage);
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <CreditCard className="text-blue-600" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Secure Payment</h3>
          <p className="text-sm text-gray-600">Complete your order payment</p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Payment Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Waste Amount:</span>
            <span className="font-medium">₹{orderDetails.wasteAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Charges:</span>
            <span className="font-medium">₹{orderDetails.deliveryCharges?.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total Amount:</span>
              <span className="font-bold text-lg text-blue-600">
                ₹{orderDetails.totalAmount?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="text-green-600" size={16} />
          <span className="font-medium text-green-900">Secure Payment</span>
        </div>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• 256-bit SSL encryption</li>
          <li>• PCI DSS compliant</li>
          <li>• Multiple payment options</li>
          <li>• Instant payment confirmation</li>
        </ul>
      </div>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        loading={processing || loading}
        disabled={processing || loading}
      >
        <CreditCard size={20} />
        {processing ? 'Processing Payment...' : `Pay ₹${orderDetails.totalAmount?.toLocaleString()}`}
      </Button>

      {/* Payment Methods */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 mb-2">Powered by Razorpay</p>
        <div className="flex justify-center items-center gap-2 text-xs text-gray-400">
          <span>💳 Cards</span>
          <span>•</span>
          <span>🏦 Net Banking</span>
          <span>•</span>
          <span>📱 UPI</span>
          <span>•</span>
          <span>💰 Wallets</span>
        </div>
      </div>
    </div>
  );
};

export default RazorpayPayment;