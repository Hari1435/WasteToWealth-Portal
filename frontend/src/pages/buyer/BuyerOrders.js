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
  Truck
} from 'lucide-react';
import { orderAPI } from '../../utils/api';
import { useApiWithLoading } from '../../hooks/useApiWithLoading';
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';

const BuyerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { callWithLoading } = useApiWithLoading();

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
          () => orderAPI.getBuyerOrders(params),
          'Loading your orders...'
        );
        setOrders(response.data.data.orders);
        setTotalPages(response.data.data.pagination.totalPages);
        setIsInitialLoad(false);
      } else {
        // Show small loading indicator for pagination
        const response = await orderAPI.getBuyerOrders(params);
        setOrders(response.data.data.orders);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Silent error handling - don't show toast to user
    }
  }, [currentPage, statusFilter, callWithLoading, isInitialLoad]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order =>
    order.waste?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.farmer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'accepted':
        return <CheckCircle size={16} className="text-blue-600" />;
      case 'in_progress':
        return <Truck size={16} className="text-purple-600" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Package size={16} className="text-gray-600" />;
    }
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter(order => order.status === 'pending').length,
    completed: orders.filter(order => order.status === 'completed').length,
    inProgress: orders.filter(order => order.status === 'in_progress').length,
  };

  // Tractor loading screen is handled by callWithLoading hook

  return (
    <div className="page-container">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">
            Track and manage your waste material orders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-purple-600">{orderStats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">{orderStats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by waste title, farmer name, or order number..."
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
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <>
            <div className="space-y-6 mb-8">
              {filteredOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {order.waste?.images && order.waste.images.length > 0 ? (
                            <img
                              src={order.waste.images[0]}
                              alt={order.waste.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package size={24} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {order.waste?.title || 'Waste Material'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Order #{order.orderNumber || order._id?.slice(-8)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(order.finalAmount || order.pricing?.totalAmount || order.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <User size={16} className="mr-2" />
                        <span>Farmer: {order.farmer?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package size={16} className="mr-2" />
                        <span>Quantity: {order.quantity?.amount} {order.quantity?.unit}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        <span>Ordered: {formatDate(order.createdAt)}</span>
                      </div>
                      {/* Distance Information */}
                      {order.distanceInfo?.distanceKm && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin size={16} className="mr-2" />
                          <span>Distance: {order.distanceInfo.distanceKm.toFixed(1)} km</span>
                        </div>
                      )}
                    </div>

                    {order.deliveryAddress && (
                      <div className="flex items-start text-sm text-gray-600 mb-4">
                        <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          Delivery: {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        {order.expectedDelivery && (
                          <span>Expected delivery: {formatDate(order.expectedDelivery)}</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/order/${order._id}`}>
                          <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition-colors">
                            <Eye size={16} />
                            View Details
                          </button>
                        </Link>
                        {order.status === 'pending' && (
                          <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                            Cancel Order
                          </button>
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
              {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start browsing waste listings to place your first order'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link to="/buyer/browse">
                <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                  <Search size={20} />
                  Browse Listings
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerOrders;