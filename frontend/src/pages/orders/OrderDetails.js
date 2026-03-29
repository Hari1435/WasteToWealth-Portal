import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Phone,
  Mail,
  Truck,
  CheckCircle,
  Clock,
  Edit,
  Save,
  X,
  CreditCard
} from 'lucide-react';
import { orderAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useApiWithLoading } from '../../hooks/useApiWithLoading';
import OrderDistanceInfo from '../../components/orders/OrderDistanceInfo';
import {
  formatCurrency,
  formatDate,
  getOrderStatusLabel,
  getOrderStatusColor,
  getWasteTypeLabel,
  getWasteTypeColor,
} from '../../utils/helpers';
// LoadingSpinner removed - using tractor loading via useApiWithLoading
import Button from '../../components/common/Button';

import ChatButton from '../../components/chat/ChatButton';
import RazorpayPayment from '../../components/payments/RazorpayPayment';
import toast from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFarmer, isBuyer } = useAuth();

  const [order, setOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { callWithLoading } = useApiWithLoading();

  const [shippingData, setShippingData] = useState({
    trackingNumber: '',
    courierService: '',
    estimatedDeliveryDate: '',
    deliveryStatus: 'pending',
    deliveryNotes: ''
  });

  const [notesData, setNotesData] = useState('');

  // Function to refresh order data without loading screen
  const refreshOrderData = async () => {
    try {
      const response = await orderAPI.getById(id);
      setOrder(response.data.data.order);
    } catch (error) {
      console.error('Error refreshing order data:', error);
    }
  };

  // Initial load effect - runs only when id changes
  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        const response = await callWithLoading(
          () => orderAPI.getById(id),
          'Loading order details...'
        );
        setOrder(response.data.data.order);

        // Initialize shipping form with existing data
        if (response.data.data.order.shippingDetails) {
          const shipping = response.data.data.order.shippingDetails;
          setShippingData({
            trackingNumber: shipping.trackingNumber || '',
            courierService: shipping.courierService || '',
            estimatedDeliveryDate: shipping.estimatedDeliveryDate ?
              new Date(shipping.estimatedDeliveryDate).toISOString().split('T')[0] : '',
            deliveryStatus: shipping.deliveryStatus || 'pending',
            deliveryNotes: shipping.deliveryNotes || ''
          });
        }

        // Initialize notes with existing data
        if (isFarmer() && response.data.data.order.farmerNotes) {
          setNotesData(response.data.data.order.farmerNotes);
        } else if (isBuyer() && response.data.data.order.buyerNotes) {
          setNotesData(response.data.data.order.buyerNotes);
        }

      } catch (error) {
        // Silent error handling - don't show toast to user
        console.error('Error fetching order details:', error);
      }
    };

    if (id) {
      loadOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only depend on id - other dependencies are stable

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await orderAPI.updateStatus(id, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`
      });
      toast.success('Order status updated successfully');
      // Refresh order data without showing loading screen
      await refreshOrderData();
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleShippingUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);

      await orderAPI.updateShipping(id, shippingData);

      toast.success('Shipping details updated successfully');
      setShowShippingForm(false);
      // Refresh order data without showing loading screen
      await refreshOrderData();
    } catch (error) {
      console.error('Shipping update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update shipping details');
    } finally {
      setUpdating(false);
    }
  };

  const handleNotesUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await orderAPI.addNotes(id, {
        notes: notesData,
        noteType: isFarmer() ? 'farmer' : 'buyer'
      });
      toast.success('Notes updated successfully');
      setShowNotesForm(false);
      // Refresh order data without showing loading screen
      await refreshOrderData();
    } catch (error) {
      toast.error('Failed to update notes');
    } finally {
      setUpdating(false);
    }
  };

  // Payment handlers
  const handlePaymentSuccess = async (verificationResult) => {
    setShowPaymentModal(false);
    toast.success('Payment successful! Your order is now confirmed.');
    // Refresh order data to show updated status
    await refreshOrderData();
  };

  const handlePaymentFailure = (error) => {
    setShowPaymentModal(false);
    toast.error(`Payment failed: ${error}`);
  };

  const getDeliveryStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={20} />;
      case 'assigned': return <User className="text-blue-500" size={20} />;
      case 'picked_up': return <Package className="text-indigo-500" size={20} />;
      case 'in_transit': return <Truck className="text-purple-500" size={20} />;
      case 'delivered': return <CheckCircle className="text-green-500" size={20} />;
      default: return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-indigo-100 text-indigo-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Tractor loading screen is handled by callWithLoading hook

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base self-start"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span>Back</span>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                Order #{order.orderNumber}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <span className={`inline-flex px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
              {getOrderStatusLabel(order.status)}
            </span>
            {order.shippingDetails?.deliveryStatus && (
              <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${getDeliveryStatusColor(order.shippingDetails.deliveryStatus)}`}>
                {getDeliveryStatusIcon(order.shippingDetails.deliveryStatus)}
                <span className="hidden sm:inline">{order.shippingDetails.deliveryStatus.replace('_', ' ').toUpperCase()}</span>
                <span className="sm:hidden">{order.shippingDetails.deliveryStatus.split('_')[0].toUpperCase()}</span>
              </span>
            )}
          </div>
        </div>

        {/* Order Summary - Full Width */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>

          <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
            {order.waste.images && order.waste.images.length > 0 ? (
              <img
                src={order.waste.images[0]}
                alt={order.waste.title}
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package size={24} className="sm:w-8 sm:h-8 text-gray-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 truncate">
                {order.waste.title}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getWasteTypeColor(order.waste.wasteType)} self-start`}>
                  {getWasteTypeLabel(order.waste.wasteType)}
                </span>
                <span className="text-xs sm:text-sm text-gray-600 truncate">
                  {order.waste.cropSource}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="sm:ml-2 font-medium">
                    {order.quantity.amount} {order.quantity.unit}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="sm:ml-2 font-medium text-primary-600">
                    {formatCurrency(order.finalAmount || order.pricing?.totalAmount || order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Amount Breakdown */}
              {(order.deliveryCharges > 0 || order.pricing?.deliveryCharges > 0) && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Amount Breakdown</h4>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Waste Amount:</span>
                      <span className="font-medium">
                        {formatCurrency(order.pricing?.wasteAmount || order.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Charges:</span>
                      <span className="font-medium">
                        {formatCurrency(order.deliveryCharges || order.pricing?.deliveryCharges || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200">
                      <span className="font-medium text-gray-900">Total:</span>
                      <span className="font-bold text-primary-600">
                        {formatCurrency(order.finalAmount || order.pricing?.totalAmount || order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact and Delivery Info Row - Full Width */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <User size={18} className="text-primary-600" />
              {isFarmer() ? 'Buyer Information' : 'Farmer Information'}
            </h3>

            {isFarmer() ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <User size={16} className="text-gray-400" />
                  <span className="text-gray-900 font-medium">{order.buyer?.name}</span>
                </div>
                {order.buyer?.phone && (
                  <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-900">{order.buyer.phone}</span>
                  </div>
                )}
                {order.buyer?.email && (
                  <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-gray-900 text-sm">{order.buyer.email}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <User size={16} className="text-gray-400" />
                  <span className="text-gray-900 font-medium">{order.farmer?.name}</span>
                </div>
                {order.farmer?.phone && (
                  <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-900">{order.farmer.phone}</span>
                  </div>
                )}
                {order.farmer?.email && (
                  <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-gray-900 text-sm">{order.farmer.email}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary-600" />
              Delivery Address
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 mb-1">Delivery Location</p>
                  <p className="text-gray-900 text-sm leading-relaxed">
                    {order.deliveryDetails?.address || 'No address provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Distance & Delivery Information */}
          <div className="md:col-span-2 lg:col-span-1">
            <OrderDistanceInfo order={order} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6 lg:space-y-8">

            {/* Shipping & Delivery */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-lg font-semibold text-gray-900">Shipping & Delivery</h2>
                {isFarmer() && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowShippingForm(!showShippingForm)}
                  >
                    <Edit size={16} />
                    Update Order Status
                  </Button>
                )}
              </div>

              {showShippingForm && isFarmer() ? (
                <form onSubmit={handleShippingUpdate} className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Number
                      </label>
                      <input
                        type="text"
                        value={shippingData.trackingNumber || ''}
                        onChange={(e) => setShippingData(prev => ({
                          ...prev,
                          trackingNumber: e.target.value
                        }))}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter vehicle number (e.g., MH12AB1234)"
                        autoComplete="off"
                        style={{ 
                          backgroundColor: 'white', 
                          color: 'black', 
                          fontSize: '16px', // Prevents zoom on iOS
                          minHeight: '44px' // Touch-friendly height
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Delivery Date
                      </label>
                      <input
                        type="date"
                        value={shippingData.estimatedDeliveryDate}
                        onChange={(e) => setShippingData(prev => ({
                          ...prev,
                          estimatedDeliveryDate: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        style={{ backgroundColor: 'white', color: 'black', fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Status
                      </label>
                      <select
                        value={shippingData.deliveryStatus}
                        onChange={(e) => setShippingData(prev => ({
                          ...prev,
                          deliveryStatus: e.target.value
                        }))}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        style={{ 
                          backgroundColor: 'white', 
                          color: 'black', 
                          fontSize: '16px',
                          minHeight: '44px'
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="picked_up">Picked Up</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Notes
                    </label>
                    <textarea
                      value={shippingData.deliveryNotes}
                      onChange={(e) => setShippingData(prev => ({
                        ...prev,
                        deliveryNotes: e.target.value
                      }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="Any delivery instructions or notes..."
                      style={{ backgroundColor: 'white', color: 'black', fontSize: '14px' }}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      disabled={updating}
                      loading={updating}
                    >
                      <Save size={16} />
                      {updating ? 'Updating...' : 'Update Shipping'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowShippingForm(false)}
                      disabled={updating}
                    >
                      <X size={16} />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {order.shippingDetails?.trackingNumber && (
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Truck className="text-blue-600" size={20} />
                        <div>
                          <p className="font-medium text-blue-900">
                            Vehicle Number: {order.shippingDetails.trackingNumber}
                          </p>
                          {order.shippingDetails.courierService && (
                            <p className="text-sm text-blue-700">
                              Vehicle: {order.shippingDetails.courierService}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.shippingDetails?.shippedDate && (
                      <div>
                        <p className="text-sm text-gray-600">Shipped Date</p>
                        <p className="font-medium">{formatDate(order.shippingDetails.shippedDate)}</p>
                      </div>
                    )}

                    {order.shippingDetails?.estimatedDeliveryDate && (
                      <div>
                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                        <p className="font-medium">{formatDate(order.shippingDetails.estimatedDeliveryDate)}</p>
                      </div>
                    )}

                    {order.shippingDetails?.actualDeliveryDate && (
                      <div>
                        <p className="text-sm text-gray-600">Delivered On</p>
                        <p className="font-medium text-green-600">{formatDate(order.shippingDetails.actualDeliveryDate)}</p>
                      </div>
                    )}
                  </div>

                  {order.shippingDetails?.deliveryNotes && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Delivery Notes</p>
                      <p className="text-gray-900">{order.shippingDetails.deliveryNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Edit size={20} className="text-primary-600" />
                  Notes & Comments
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNotesForm(!showNotesForm)}
                >
                  <Edit size={16} />
                  {isFarmer() ? 'Add Farmer Notes' : 'Add Buyer Notes'}
                </Button>
              </div>

              {showNotesForm ? (
                <form onSubmit={handleNotesUpdate} className="space-y-4">
                  <textarea
                    value={notesData}
                    onChange={(e) => setNotesData(e.target.value)}
                    rows={4}
                    className="input-field resize-none"
                    placeholder={`Add ${isFarmer() ? 'farmer' : 'buyer'} notes...`}
                  />
                  <div className="flex space-x-3">
                    <Button type="submit" size="sm">
                      <Save size={16} />
                      Save Notes
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowNotesForm(false)}
                    >
                      <X size={16} />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.farmerNotes && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-blue-600" />
                        <p className="text-sm font-medium text-blue-900">Farmer Notes:</p>
                      </div>
                      <p className="text-blue-800 text-sm">{order.farmerNotes}</p>
                    </div>
                  )}

                  {order.buyerNotes && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-green-600" />
                        <p className="text-sm font-medium text-green-900">Buyer Notes:</p>
                      </div>
                      <p className="text-green-800 text-sm">{order.buyerNotes}</p>
                    </div>
                  )}

                  {order.notes && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Edit size={16} className="text-gray-600" />
                        <p className="text-sm font-medium text-gray-700">Order Notes:</p>
                      </div>
                      <p className="text-gray-900 text-sm">{order.notes}</p>
                    </div>
                  )}

                  {!order.farmerNotes && !order.buyerNotes && !order.notes && (
                    <div className="bg-gray-50 rounded-lg p-6 text-center md:col-span-2">
                      <Edit size={24} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No notes added yet.</p>
                      <p className="text-gray-400 text-xs mt-1">Click "Add Notes" to leave comments about this order.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Clock size={20} className="text-primary-600" />
                Order Timeline
              </h2>

              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  {order.statusHistory?.map((history, index) => (
                    <div key={index} className="relative flex items-start space-x-4">
                      <div className="relative z-10 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
                        <CheckCircle size={16} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">
                            {getOrderStatusLabel(history.status)}
                          </p>
                          <p className="text-sm text-gray-500 flex-shrink-0">
                            {formatDate(history.timestamp)}
                          </p>
                        </div>
                        {history.notes && (
                          <p className="text-sm text-gray-600 bg-white rounded p-2 border border-gray-200">
                            {history.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Real-Time Chat - For Both Farmers and Buyers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Order Communication
              </h3>
              <div className="space-y-3">
                <ChatButton
                  orderId={order.orderNumber}
                  orderData={order}
                  className="w-full"
                />
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-blue-700">
                    {isFarmer()
                      ? "Communicate directly with the buyer about order details, delivery, and any questions."
                      : "Chat with the farmer about your order, ask questions, and get updates on delivery status."
                    }
                  </p>
                </div>

                {/* Online Status Indicator */}
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Real-time messaging enabled</span>
                </div>
              </div>
            </div>

            {/* Payment Section - For Buyers when order is accepted or payment pending */}
            {isBuyer() && (order.status === 'accepted' || order.status === 'payment_pending') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-primary-600" />
                  Complete Payment
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="text-green-600" size={16} />
                      <span className="font-medium text-green-900">Order Accepted</span>
                    </div>
                    <p className="text-sm text-green-700">
                      The farmer has accepted your order with delivery charges. Complete the payment to confirm your order.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Payment Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Waste Amount:</span>
                        <span className="font-medium">
                          {formatCurrency(order.pricing?.wasteAmount || order.totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Charges:</span>
                        <span className="font-medium">
                          {formatCurrency(order.deliveryCharges || order.pricing?.deliveryCharges || 0)}
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900">Total Amount:</span>
                          <span className="font-bold text-lg text-primary-600">
                            {formatCurrency(order.finalAmount || order.pricing?.totalAmount || order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <CreditCard size={16} />
                    Pay Now - {formatCurrency(order.finalAmount || order.pricing?.totalAmount || order.totalAmount)}
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {isFarmer() && order.status === 'confirmed' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck size={18} className="text-primary-600" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => handleStatusUpdate('in_progress')}
                    disabled={updating}
                  >
                    <Truck size={16} />
                    Mark as In Progress
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={updating}
                  >
                    <CheckCircle size={16} />
                    Mark as Completed
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && order && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Complete Payment</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <RazorpayPayment
                orderDetails={{
                  orderId: order._id,
                  wasteAmount: order.pricing?.wasteAmount || order.totalAmount,
                  deliveryCharges: order.deliveryCharges || order.pricing?.deliveryCharges || 0,
                  totalAmount: order.finalAmount || order.pricing?.totalAmount || order.totalAmount
                }}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;