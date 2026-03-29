import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  Calendar,
  User,
  Star,
  ShoppingCart,
  ArrowLeft,
  Phone,
  Mail
} from 'lucide-react';
import { wasteAPI, orderAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useApiWithLoading } from '../../hooks/useApiWithLoading';
import { formatCurrency, formatDate, getWasteTypeLabel, getWasteTypeColor, getWasteStatusLabel, getWasteStatusColor } from '../../utils/helpers';
import OrderRequestForm from '../../components/orders/OrderRequestForm';

import toast from 'react-hot-toast';

const WasteDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isBuyer } = useAuth();
  const { callWithLoading } = useApiWithLoading();

  const [waste, setWaste] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const actionParam = searchParams.get('action');

  useEffect(() => {
    const loadWasteDetails = async (retryCount = 0) => {
      if (!id) {
        console.log('No ID provided, skipping fetch');
        setIsLoading(false);
        return;
      }

      console.log('Fetching waste details for ID:', id, retryCount > 0 ? `(Retry ${retryCount})` : '');
      setIsLoading(true);

      try {
        // Use direct API call instead of callWithLoading to avoid infinite loop
        const response = await wasteAPI.getById(id);
        console.log('API Response:', response);

        if (response.data && response.data.data && response.data.data.waste) {
          setWaste(response.data.data.waste);
          console.log('Waste data set:', response.data.data.waste);
        } else {
          console.error('Unexpected response structure:', response);
          setWaste(null);
        }
      } catch (error) {
        console.error('Error fetching waste details:', error);
        
        // Retry logic for timeout errors
        if (error.code === 'ECONNABORTED' && retryCount < 2) {
          console.log(`Retrying request (attempt ${retryCount + 1})`);
          setTimeout(() => loadWasteDetails(retryCount + 1), 1000);
          return;
        }
        
        const errorMessage = error.response?.data?.message || 'Failed to load waste details';
        toast.error(errorMessage);
        setWaste(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadWasteDetails();
  }, [id, actionParam]); // Clean dependencies without callWithLoading

  // Cleanup effect
  useEffect(() => {
    return () => {
      setIsProcessingOrder(false);
    };
  }, []);



  const handleOrderRequest = async (orderData) => {
    setIsProcessingOrder(true);

    try {
      console.log('📦 Creating order request:', orderData);

      // Use new order request endpoint
      const response = await callWithLoading(
        () => orderAPI.createRequest(orderData),
        'Sending order request...'
      );

      console.log('✅ Order request sent:', response.data);

      toast.success('Order request sent to farmer for review!');
      
      // Navigate to buyer orders to see pending request
      navigate('/buyer/orders');

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send order request');
      console.error('Order request error:', error);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading waste details...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (!waste && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Waste listing not found</h3>
          <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/buyer/browse')}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Browse
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="responsive-container responsive-padding">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {waste.images && waste.images.length > 0 ? (
                <div className="aspect-video bg-gray-200">
                  <img
                    src={waste.images[0]}
                    alt={waste.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <Package size={64} className="text-gray-400" />
                </div>
              )}

              {waste.images && waste.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {waste.images.slice(1, 5).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${waste.title} ${index + 2}`}
                      className="aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{waste.title}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getWasteTypeColor(waste.wasteType)}`}>
                      {getWasteTypeLabel(waste.wasteType)}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getWasteStatusColor(waste.status)}`}>
                      {getWasteStatusLabel(waste.status)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary-600">
                    {formatCurrency(waste.pricePerUnit)}
                  </p>
                  <p className="text-sm text-gray-600">per {waste.quantity.unit}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center text-gray-600">
                  <Package size={20} className="mr-3" />
                  <div>
                    <p className="font-medium">Available Quantity</p>
                    <p>{waste.quantity.amount} {waste.quantity.unit}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin size={20} className="mr-3" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p>{waste.location.city}, {waste.location.state}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar size={20} className="mr-3" />
                  <div>
                    <p className="font-medium">Listed On</p>
                    <p>{formatDate(waste.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{waste.description}</p>
              </div>
            </div>
          </div>         
 {/* Sidebar */}
          <div className="space-y-6">
            {/* Farmer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Farmer Information</h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{waste.farmer?.name}</p>
                  {waste.farmer?.rating > 0 && (
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">{waste.farmer.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {waste.farmer?.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone size={16} className="mr-2" />
                    <span>{waste.farmer.phone}</span>
                  </div>
                )}
                {waste.farmer?.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail size={16} className="mr-2" />
                    <span>{waste.farmer.email}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  <span>{waste.location.city}, {waste.location.state}</span>
                </div>
              </div>
            </div>

            {/* Order Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Place Order</h3>

              {!isAuthenticated ? (
                <div className="text-center py-4">
                  <div className="text-gray-500 mb-4">
                    Please login to place an order
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <User size={20} />
                    Login to Order
                  </button>
                </div>
              ) : !isBuyer() ? (
                <div className="text-center py-4">
                  <div className="text-gray-500 mb-2">
                    Only buyers can place orders
                  </div>
                  <button
                    disabled
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                  >
                    <ShoppingCart size={20} />
                    Farmers Cannot Order
                  </button>
                </div>
              ) : (
                <>
                  {waste.status !== 'available' || waste.quantity.amount <= 0 ? (
                    <div className="text-center py-4">
                      <div className="text-gray-500 mb-2">
                        {waste.status === 'sold_out' ? 'This item is sold out' :
                          waste.quantity.amount <= 0 ? 'No quantity available' :
                            'This item is currently unavailable'}
                      </div>
                      <button
                        disabled
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                      >
                        <ShoppingCart size={20} />
                        {waste.status === 'sold_out' ? 'Sold Out' : 'Unavailable'}
                      </button>
                    </div>
                  ) : (
                    <OrderRequestForm
                      waste={waste}
                      onSubmit={handleOrderRequest}
                      loading={isProcessingOrder}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteDetails;