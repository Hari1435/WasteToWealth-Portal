import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  DollarSign,
  Search,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import { userAPI } from '../../utils/api';

import { formatCurrency, getWasteTypeLabel, getOrderStatusColor } from '../../utils/helpers';
import Button from '../../components/common/Button';
import { DashboardLoader } from '../../components/common/PageLoader';

const BuyerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Don't use callWithLoading to avoid double loading screens
      const response = await userAPI.getBuyerDashboard();
      setDashboardData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Show skeleton loader while data is loading
  if (!dashboardData) {
    return (
      <div className="page-container">
        <div className="responsive-container responsive-padding">
          <DashboardLoader />
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Orders',
      value: dashboardData?.statistics?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      changeType: 'positive'
    },
    {
      title: 'Pending Orders',
      value: dashboardData?.statistics?.pendingOrders || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      changeType: 'positive'
    },
    {
      title: 'Completed Orders',
      value: dashboardData?.statistics?.completedOrders || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      changeType: 'positive'
    },
    {
      title: 'Total Spent',
      value: formatCurrency(dashboardData?.statistics?.totalSpent || 0),
      icon: DollarSign,
      color: 'bg-purple-500',
      changeType: 'positive'
    }
  ];

  return (
    <div className="page-container">
      <div className="responsive-container responsive-padding">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 lg:mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="responsive-title text-gray-900 mb-2">
              Buyer Dashboard
            </h1>
            <p className="responsive-text text-gray-600">
              Welcome back! Manage your orders and discover new waste materials.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Link to="/buyer/browse" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto justify-center">
                <Search size={20} />
                <span className="ml-2">Browse Listings</span>
              </Button>
            </Link>
            <Link to="/orders" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto justify-center">
                <ShoppingCart size={20} />
                <span className="ml-2">My Orders</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="responsive-grid mb-6 lg:mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <Link to="/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Manage Orders
                </Link>
              </div>
            </div>
            <div className="p-6">
              {dashboardData?.recentOrders?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Package size={20} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.waste?.title}</p>
                          <p className="text-sm text-gray-600">{order.farmer?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(order.finalAmount || order.pricing?.totalAmount || order.totalAmount)}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <Link to="/buyer/browse">
                    <Button size="sm">Browse Listings</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Favorite Waste Types */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Favorite Waste Types</h2>
            </div>
            <div className="p-6">
              {dashboardData?.favoriteWasteTypes?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.favoriteWasteTypes.map((wasteType, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Package size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{getWasteTypeLabel(wasteType._id)}</p>
                          <p className="text-sm text-gray-600">{wasteType.count} orders</p>
                        </div>
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((wasteType.count / Math.max(...dashboardData.favoriteWasteTypes.map(w => w.count))) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Order Status Overview */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.statistics?.pendingOrders || 0}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package size={24} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {(dashboardData?.statistics?.totalOrders || 0) - (dashboardData?.statistics?.pendingOrders || 0) - (dashboardData?.statistics?.completedOrders || 0) - (dashboardData?.statistics?.cancelledOrders || 0)}
              </p>
              <p className="text-sm text-gray-600">Processing</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.statistics?.completedOrders || 0}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle size={24} className="text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.statistics?.cancelledOrders || 0}</p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;