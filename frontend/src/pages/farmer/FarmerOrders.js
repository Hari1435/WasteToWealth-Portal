import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search,
  Calendar,
  MapPin,
  User,
  Truck,
  AlertCircle,
  Bell
} from 'lucide-react';
import { orderAPI } from '../../utils/api';
import { useApiWithLoading } from '../../hooks/useApiWithLoading';
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';
import FarmerOrderReview from '../../components/orders/FarmerOrderReview';
import toast from 'react-hot-toast';

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pendingReviewOrders, setPendingReviewOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { callWithLoading } = useApiWithLoading();

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  const fetchPendingReviewOrders = useCallback(async () => {
    try {
      const response = await orderAPI.getPendingReview();
      setPendingReviewOrders(response.data.data.orders);
    } catch (error) {
      console.error('Error fetching pending review orders:', error);
      if (error.code === 'ECONNABORTED') {
        toast.error('Connection timeout. Please ensure the backend server is running.');
      }
      // Don't show other errors for pending orders as it's not critical
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: 10,
      ...(statusFilter !== 'all' && { status: statusFilter })
    };
    
    try {
      if (isInitialLoad) {
        // Show tractor loading for initial load
        const response = await callWithLoading(
          () => orderAPI.getFarmerOrders(params),
          'Loading your orders...'
        );
        setOrders(response.data.data.orders);
        setTotalPages(response.data.data.pagination.totalPages);
        setIsInitialLoad(false);
      } else {
        // Show small loading indicator for pagination
        const response = await orderAPI.getFarmerOrders(params);
        setOrders(response.data.data.orders);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.code === 'ECONNABORTED') {
        toast.error('Connection timeout. Please check if the backend server is running.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to load orders. Please refresh the page.');
      }
    }
  }, [currentPage, statusFilter, callWithLoading, isInitialLoad]);

  // Handle order acceptance
  const handleAcceptOrder = async (acceptData) => {
    setProcessingOrder(true);
    try {
      console.log('Accepting order:', selectedOrderForReview._id, 'with data:', acceptData);
      await orderAPI.acceptOrder(selectedOrderForReview._id, acceptData);
      toast.success('Order accepted successfully! Buyer will be notified.');
      
      // Refresh both lists
      fetchPendingReviewOrders();
      fetchOrders();
      setSelectedOrderForReview(null);
    } catch (error) {
      console.error('Accept order error:', error);
      toast.error(error.response?.data?.message || 'Failed to accept order');
    } finally {
      setProcessingOrder(false);
    }
  };

  // Handle order rejection
  const handleRejectOrder = async (rejectData) => {
    setProcessingOrder(true);
    try {
      await orderAPI.rejectOrder(rejectData.orderId, rejectData);
      toast.success('Order rejected. Buyer will be notified.');
      
      // Refresh both lists
      fetchPendingReviewOrders();
      fetchOrders();
      setSelectedOrderForReview(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject order');
    } finally {
      setProcessingOrder(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPendingReviewOrders();
  }, [fetchOrders, fetchPendingReviewOrders]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.waste?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const orderStats = {
    total: orders.length,
    confirmed: orders.filter(order => order.status === 'confirmed').length,
    inProgress: orders.filter(order => order.status === 'in_progress').length,
    completed: orders.filter(order => order.status === 'completed').length,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <Clock className="text-blue-500" size={16} />;
      case 'in_progress': return <Truck className="text-purple-500" size={16} />;
      case 'completed': return <CheckCircle className="text-green-500" size={16} />;
      case 'cancelled': return <XCircle className="text-red-500" size={16} />;
      default: return <Clock className="text-gray-500" size={16} />;
    }
  };

  // Show order review modal
  if (selectedOrderForReview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => setSelectedOrderForReview(null)}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
            >
              ← Back to Orders
            </button>
          </div>
          <FarmerOrderReview
            order={selectedOrderForReview}
            onAccept={handleAcceptOrder}
            onReject={handleRejectOrder}
            loading={processingOrder}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                My Orders
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage and track orders for your waste materials
              </p>
            </div>
            {pendingReviewOrders.length > 0 && (
              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-2 sm:px-4 rounded-lg text-sm sm:text-base">
                <Bell size={16} className="flex-shrink-0" />
                <span className="font-medium">
                  {pendingReviewOrders.length} order{pendingReviewOrders.length > 1 ? 's' : ''} pending review
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'pending'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Review ({pendingReviewOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Orders
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'pending' ? (
          /* Pending Review Orders */
          <div className="space-y-4 sm:space-y-6">
            {pendingReviewOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Pending Orders
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  You don't have any orders waiting for review.
                </p>
              </div>
            ) : (
              pendingReviewOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        From: {order.buyer?.name} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <span className="px-2 py-1 sm:px-3 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-medium">
                        Needs Review
                      </span>
                      <button
                        onClick={() => setSelectedOrderForReview(order)}
                        className="w-full sm:w-auto bg-primary-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
                      >
                        Review Order
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-gray-600 font-medium sm:font-normal">Waste Type:</span>
                      <span className="sm:ml-2 font-medium">{order.waste?.type}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-gray-600 font-medium sm:font-normal">Quantity:</span>
                      <span className="sm:ml-2 font-medium">
                        {order.quantity.amount} {order.quantity.unit}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-gray-600 font-medium sm:font-normal">Amount:</span>
                      <span className="sm:ml-2 font-medium text-primary-600">
                        {formatCurrency(order.finalAmount || order.pricing?.totalAmount || order.totalAmount)}
                      </span>
                    </div>
                  </div>
                  
                  {order.distanceInfo?.distanceKm && (
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-blue-600">
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-2 flex-shrink-0" />
                        <span>Distance: {order.distanceInfo.distanceKm.toFixed(1)} km</span>
                      </div>
                      {order.distanceInfo.durationMinutes && (
                        <span className="mt-1 sm:mt-0 sm:ml-4">
                          • Travel Time: {Math.floor(order.distanceInfo.durationMinutes / 60)}h {order.distanceInfo.durationMinutes % 60}m
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* All Orders */
          <div>
            {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{orderStats.total}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Confirmed</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{orderStats.confirmed}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">In Progress</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{orderStats.inProgress}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Completed</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{orderStats.completed}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by waste title, buyer name, or order number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <>
            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              {filteredOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          {order.waste?.images && order.waste.images.length > 0 ? (
                            <img
                              src={order.waste.images[0]}
                              alt={order.waste.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package size={20} className="sm:w-6 sm:h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                            {order.waste?.title || 'Waste Material'}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Order #{order.orderNumber || order._id?.slice(-8)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className={`inline-flex px-2 py-1 sm:px-3 text-xs sm:text-sm font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-base sm:text-lg font-bold text-green-600">
                            {formatCurrency(order.finalAmount || order.pricing?.totalAmount || order.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 text-xs sm:text-sm">
                      <div className="flex items-center text-gray-600">
                        <User size={14} className="mr-2 flex-shrink-0" />
                        <span className="truncate">Buyer: {order.buyer?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Package size={14} className="mr-2 flex-shrink-0" />
                        <span>Quantity: {order.quantity?.amount} {order.quantity?.unit}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar size={14} className="mr-2 flex-shrink-0" />
                        <span>Ordered: {formatDate(order.createdAt)}</span>
                      </div>
                      {/* Distance Information */}
                      {order.distanceInfo?.distanceKm && (
                        <div className="flex items-center text-gray-600">
                          <MapPin size={14} className="mr-2 flex-shrink-0" />
                          <span>Distance: {order.distanceInfo.distanceKm.toFixed(1)} km</span>
                        </div>
                      )}
                    </div>

                    {order.deliveryDetails?.address && (
                      <div className="flex items-start text-sm text-gray-600 mb-4">
                        <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          Delivery: {order.deliveryDetails.address}
                        </span>
                      </div>
                    )}

                    {order.shippingDetails?.trackingNumber && (
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Truck size={16} className="mr-2" />
                        <span>
                          Vehicle: {order.shippingDetails.trackingNumber}
                          {order.shippingDetails.courierService && ` - Type: ${order.shippingDetails.courierService}`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        {order.shippingDetails?.estimatedDeliveryDate && (
                          <span>Expected delivery: {formatDate(order.shippingDetails.estimatedDeliveryDate)}</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/order/${order._id}`}>
                          <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition-colors">
                            <Eye size={16} />
                            View Details
                          </button>
                        </Link>
                        {order.status === 'confirmed' && (
                          <Link to={`/order/${order._id}`}>
                            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                              <Truck size={16} />
                              Update Shipping
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search terms or filters'
                : 'You haven\'t received any orders yet'
              }
            </p>
          </div>
        )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerOrders;