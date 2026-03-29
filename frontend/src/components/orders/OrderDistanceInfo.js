import React from 'react';
import { MapPin, Clock, Truck, Route } from 'lucide-react';

const OrderDistanceInfo = ({ order }) => {
  if (!order?.distanceInfo) {
    return null;
  }

  const { distanceInfo } = order;

  const formatDistance = (distance) => {
    if (distance >= 1) {
      return `${distance.toFixed(1)} km`;
    } else {
      return `${(distance * 1000).toFixed(0)} m`;
    }
  };

  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Route className="text-blue-600" size={20} />
        <h3 className="font-semibold text-blue-900">Distance & Delivery Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Distance */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="text-blue-600" size={16} />
          </div>
          <div>
            <div className="text-sm text-gray-600">Distance</div>
            <div className="font-medium text-gray-900">
              {formatDistance(distanceInfo.distanceKm)}
            </div>
          </div>
        </div>

        {/* Travel Time */}
        {distanceInfo.durationMinutes && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="text-blue-600" size={16} />
            </div>
            <div>
              <div className="text-sm text-gray-600">Estimated Travel Time</div>
              <div className="font-medium text-gray-900">
                {formatDuration(distanceInfo.durationMinutes)}
              </div>
            </div>
          </div>
        )}

        {/* Delivery Method */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Truck className="text-blue-600" size={16} />
          </div>
          <div>
            <div className="text-sm text-gray-600">Delivery Method</div>
            <div className="font-medium text-gray-900">
              Manual Delivery Charges
            </div>
          </div>
        </div>

        {/* Route Type */}
        {distanceInfo.routeType && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Route className="text-blue-600" size={16} />
            </div>
            <div>
              <div className="text-sm text-gray-600">Route Type</div>
              <div className="font-medium text-gray-900 capitalize">
                {distanceInfo.routeType}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      {(distanceInfo.fromAddress || distanceInfo.toAddress) && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="text-sm text-gray-600 space-y-1">
            {distanceInfo.fromAddress && (
              <div>
                <span className="font-medium">From:</span> {distanceInfo.fromAddress}
              </div>
            )}
            {distanceInfo.toAddress && (
              <div>
                <span className="font-medium">To:</span> {distanceInfo.toAddress}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delivery Notes */}
      <div className="mt-3 text-xs text-blue-700 bg-blue-100 rounded p-2">
        <strong>Note:</strong> Delivery charges are set manually by the farmer based on distance, 
        route conditions, and delivery requirements. Travel time is estimated and may vary based on traffic and road conditions.
      </div>
    </div>
  );
};

export default OrderDistanceInfo;