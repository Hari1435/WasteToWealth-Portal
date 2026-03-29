import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  DollarSign,
  Plus,
  Eye,
  Activity
} from 'lucide-react';
import { userAPI } from '../../utils/api';

import { formatCurrency, getWasteTypeLabel, getOrderStatusColor } from '../../utils/helpers';
import Button from '../../components/common/Button';
import { DashboardLoader } from '../../components/common/PageLoader';

const FarmerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Don't use callWithLoading to avoid double loading screens
      const response = await userAPI.getFarmerDashboard();
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
      title: 'Total Listings',
      value: dashboardData?.statistics?.totalListings || 0,
      icon: Package,
      color: 'bg-blue-500',
      subtitle: `${dashboardData?.statistics?.activeListings || 0} active`
    },
    {
      title: 'Sold Out Items',
      value: dashboardData?.statistics?.soldOutListings || 0,
      icon: Activity,
      color: 'bg-green-500',
      subtitle: 'Items sold completely'
    },
    {
      title: 'Total Orders',
      value: dashboardData?.earnings?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      subtitle: `${dashboardData?.statistics?.confirmedOrders || 0} confirmed`
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(dashboardData?.earnings?.totalEarnings || 0),
      icon: DollarSign,
      color: 'bg-yellow-500',
      subtitle: 'All time earnings'
    }
  ];

  return (
    <div className="page-container">
      <div className="responsive-container responsive-padding">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 lg:mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="responsive-title text-gray-900 mb-2">
              Farmer Dashboard
            </h1>
            <p className="responsive-text text-gray-600">
              Welcome back! Here's what's happening with your waste listings.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Link to="/farmer/create-listing" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto justify-center">
                <Plus size={20} />
                <span className="ml-2">Create Listing</span>
              </Button>
            </Link>
            <Link to="/farmer/my-listings" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto justify-center">
                <Eye size={20} />
                <span className="ml-2">View All</span>
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
                    {stat.subtitle && (
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-500">
                          {stat.subtitle}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Earnings Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Earnings Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign size={32} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(dashboardData?.earnings?.totalEarnings || 0)}
              </p>
              <p className="text-sm text-gray-600">Total Earnings</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity size={32} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(dashboardData?.earnings?.thisMonthEarnings || 0)}
              </p>
              <p className="text-sm text-gray-600">This Month</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingCart size={32} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(dashboardData?.earnings?.averageOrderValue || 0)}
              </p>
              <p className="text-sm text-gray-600">Avg. Order Value</p>
            </div>
          </div>
          
          {dashboardData?.earnings?.lastUpdated && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Last updated: {new Date(dashboardData.earnings.lastUpdated).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
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
                          <ShoppingCart size={20} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.waste?.title}</p>
                          <p className="text-sm text-gray-600">{order.buyer?.name}</p>
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
                  <p className="text-gray-500">No recent orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Listings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Listings</h2>
                <Link to="/farmer/my-listings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {dashboardData?.recentListings?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentListings.map((listing) => (
                    <div key={listing._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Package size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{listing.title}</p>
                          <p className="text-sm text-gray-600">{getWasteTypeLabel(listing.wasteType)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(listing.pricePerUnit)}/kg</p>

                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No listings yet</p>
                  <Link to="/farmer/create-listing">
                    <Button size="sm">Create Your First Listing</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default FarmerDashboard;