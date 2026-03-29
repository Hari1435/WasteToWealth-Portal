import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import OrderCardWithDelivery from '../../components/orders/OrderCardWithDelivery';
import RazorpayPayment from '../../components/payments/RazorpayPayment';
import { Package, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';

const OrderManagement = () => {
  const { user, token } = useAuth();
  const { setLoading } = useLoading();
  const [orders, setOrders] = useState([]);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const endpoint = user.userType === 'farmer' 
        ? '/api/orders/farmer-orders' 
        : '/api/orders/buyer-orders';
        
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderWithDelivery) => {
    try {
      const response = await fetch(`/api/orders/${orderWithDelivery._id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deliveryCharges: orderWithDelivery.deliveryCharges,
          totalAmount: orderWithDelivery.totalAmount,
          farmerNotes: 'Order accepted with manual delivery charges'
        })
      });

      if (response.ok) {
        await fetchOrders(); // Refresh orders
        alert('Order accepted successfully! Buyer will be notified.');
      } else {
        const error = await response.json();
        alert('Failed to accept order: ' + error.message);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order. Please try again.');
    }
  };

  const handleRejectOrder = async (order) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/orders/${order._id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          farmerNotes: reason
        })
      });

      if (response.ok) {
        await fetchOrders(); // Refresh orders
        alert('Order rejected successfully.');
      } else {
        const error = await response.json();
        alert('Failed to reject order: ' + error.message);
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order. Please try again.');
    }
  };

  const handlePayment = (paymentDetails) => {
    setSelectedOrderForPayment(paymentDetails);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (verificationResult) => {
    setShowPaymentModal(false);
    setSelectedOrderForPayment(null);
    await fetchOrders(); // Refresh orders
    
    alert('Payment successful! Your order is now confirmed.');
  };

  const handlePaymentFailure = (error) => {
    setShowPaymentModal(false);
    alert('Payment failed: ' + error);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      accepted: orders.filter(o => o.status === 'accepted').length,
      paid: orders.filter(o => o.status === 'paid').length,
      completed: orders.filter(o => o.status === 'completed').length
    };
    return stats;
  };

  const stats = getOrderStats();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {user.userType === 'farmer' ? 'Manage Orders' : 'My Orders'}
        </h1>
        <p className="text-gray-600">
          {user.userType === 'farmer' 
            ? 'Review and accept orders with manual delivery charges'
            : 'Track your orders and complete payments'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Orders</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-yellow-700">Pending</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          <div className="text-sm text-green-700">Accepted</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.paid}</div>
          <div className="text-sm text-blue-700">Paid</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
          <div className="text-sm text-purple-700">Completed</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'accepted', 'paid', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                {stats[status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No orders available at the moment.'
                : `No ${filter} orders found.`
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCardWithDelivery
              key={order._id}
              order={order}
              userRole={user.userType}
              onAcceptOrder={handleAcceptOrder}
              onRejectOrder={() => handleRejectOrder(order)}
              onPayment={handlePayment}
            />
          ))
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedOrderForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Complete Payment</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <RazorpayPayment
                orderDetails={selectedOrderForPayment}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
              />
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
          {user.userType === 'farmer' ? (
            <>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <div className="font-medium">Review Orders</div>
                  <div>Check order details and calculate delivery charges using AI</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <div className="font-medium">Accept/Reject</div>
                  <div>Accept orders with manual delivery charges or reject with reason</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <div className="font-medium">Get Paid</div>
                  <div>Buyer pays and you receive payment for waste + delivery</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <div className="font-medium">Wait for Acceptance</div>
                  <div>Farmer reviews your order and calculates delivery charges</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <div className="font-medium">Make Payment</div>
                  <div>Pay for waste + delivery charges via Razorpay</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <div className="font-medium">Receive Delivery</div>
                  <div>Your waste will be delivered as per the agreed terms</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;