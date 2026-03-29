import React, { useState } from 'react';
import { Truck, Calculator, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import Button from '../common/Button';

const TruckRecommendation = () => {
  const [formData, setFormData] = useState({
    distance: '',
    quantity: ''
  });
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.distance || !formData.quantity) {
      setError('Please fill in both distance and quantity fields');
      return false;
    }
    
    const distance = parseFloat(formData.distance);
    const quantity = parseFloat(formData.quantity);
    
    if (isNaN(distance) || distance <= 0) {
      setError('Please enter a valid distance greater than 0');
      return false;
    }
    
    if (isNaN(quantity) || quantity <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return false;
    }
    
    if (distance > 1000) {
      setError('Distance should be less than 1000 km for accurate recommendations');
      return false;
    }
    
    if (quantity > 100) {
      setError('Quantity should be less than 100 tons for accurate recommendations');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setRecommendation(null);
    
    try {
      const response = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distance: parseFloat(formData.distance),
          quantity: parseFloat(formData.quantity)
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to match expected format
      const transformedData = {
        recommended_truck: data.prediction.predicted_truck_type,
        confidence: data.prediction.confidence,
        all_probabilities: {} // API doesn't return all probabilities in simple_api.py
      };
      
      setRecommendation(transformedData);
    } catch (err) {
      console.error('Error getting truck recommendation:', err);
      setError('Failed to get truck recommendation. Please make sure the ML service is running on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  const getTruckTypeColor = (truckType) => {
    const colors = {
      'mini_pickup': 'bg-purple-100 text-purple-800',
      'small_truck': 'bg-blue-100 text-blue-800',
      'medium_truck': 'bg-green-100 text-green-800',
      'large_truck': 'bg-orange-100 text-orange-800',
      'heavy_truck': 'bg-red-100 text-red-800'
    };
    return colors[truckType] || 'bg-gray-100 text-gray-800';
  };

  const getTruckTypeDescription = (truckType) => {
    const descriptions = {
      'mini_pickup': 'Perfect for very small loads and short distances (up to 1 ton)',
      'small_truck': 'Ideal for short distances and small quantities (up to 2 tons)',
      'medium_truck': 'Good for medium distances and moderate quantities (2-8 tons)',
      'large_truck': 'Best for long distances and large quantities (8-20 tons)',
      'heavy_truck': 'Perfect for very long distances and heavy loads (20+ tons)'
    };
    return descriptions[truckType] || 'Truck recommendation based on your requirements';
  };

  const formatTruckType = (truckType) => {
    if (!truckType || typeof truckType !== 'string') {
      return 'Unknown Truck Type';
    }
    return truckType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Truck className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Truck Recommendation System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get AI-powered truck recommendations based on your delivery distance and waste quantity. 
            Our machine learning model helps you choose the most efficient truck for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <Calculator className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Enter Delivery Details
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Distance (km)
                </label>
                <input
                  type="number"
                  id="distance"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  placeholder="Enter distance in kilometers"
                  min="0.1"
                  max="1000"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Distance from your farm to the buyer's location
                </p>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Waste Quantity (tons)
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Enter quantity in tons"
                  min="0.1"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Total weight of waste to be transported
                </p>
              </div>

              {error && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Getting Recommendation...
                  </>
                ) : (
                  <>
                    <Truck className="h-5 w-5 mr-2" />
                    Get Truck Recommendation
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Recommendation Results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Recommendation Results
              </h2>
            </div>

            {!recommendation && !loading && (
              <div className="text-center py-12">
                <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Enter your delivery details to get a truck recommendation
                </p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <Loader className="animate-spin h-16 w-16 text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600">
                  Analyzing your requirements...
                </p>
              </div>
            )}

            {recommendation && (
              <div className="space-y-6">
                {/* Main Recommendation */}
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recommended Truck Type
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTruckTypeColor(recommendation.recommended_truck)}`}>
                      {formatTruckType(recommendation.recommended_truck)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">
                    {getTruckTypeDescription(recommendation.recommended_truck)}
                  </p>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Confidence:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(recommendation.confidence * 100).toFixed(1)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {(recommendation.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* All Probabilities */}
                {recommendation.all_probabilities && (
                  <div>
                    <div className="space-y-2">
                      {Object.entries(recommendation.all_probabilities)
                        .sort(([,a], [,b]) => b - a)
                        .map(([truckType, probability]) => (
                        <div key={truckType} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                          <span className="text-sm font-medium text-gray-700">
                            {formatTruckType(truckType)}
                          </span>
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-primary-600 h-2 rounded-full" 
                                style={{ width: `${(probability * 100).toFixed(1)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {(probability * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckRecommendation;
