import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Loader } from 'lucide-react';
import { distanceService } from '../../utils/distanceService';

const DistanceDisplay = ({ 
  origin, 
  destination, 
  className = '',
  showDuration = true,
  compact = false 
}) => {
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return;
    }

    const calculateDistance = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await distanceService.calculateDistance(origin, destination);
        
        if (result.success) {
          setDistance(result);
        } else {
          // Fallback to Haversine calculation
          const haversineDistance = distanceService.calculateHaversineDistance(origin, destination);
          setDistance({
            distanceKm: haversineDistance.toFixed(2),
            distance: haversineDistance * 1000,
            duration: null,
            durationMinutes: null,
            success: true
          });
        }
      } catch (err) {
        console.error('Distance calculation error:', err);
        setError('Unable to calculate distance');
      } finally {
        setLoading(false);
      }
    };

    calculateDistance();
  }, [origin, destination]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <Loader size={16} className="animate-spin" />
        <span className="text-sm">Calculating...</span>
      </div>
    );
  }

  if (error || !distance) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <MapPin size={16} />
        <span className="text-sm">Distance unavailable</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-1 text-gray-600 ${className}`}>
        <MapPin size={14} />
        <span className="text-sm font-medium">
          {distanceService.formatDistance(distance.distanceKm)}
        </span>
        {showDuration && distance.durationMinutes && (
          <>
            <span className="text-gray-400">•</span>
            <Clock size={14} />
            <span className="text-sm">
              {distanceService.formatDuration(distance.durationMinutes)}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-gray-700">
        <MapPin size={16} className="text-primary-500" />
        <span className="font-medium">
          Distance: {distanceService.formatDistance(distance.distanceKm)}
        </span>
      </div>
      
      {showDuration && distance.durationMinutes && (
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={16} className="text-primary-500" />
          <span>
            Estimated travel time: {distanceService.formatDuration(distance.durationMinutes)}
          </span>
        </div>
      )}
    </div>
  );
};

export default DistanceDisplay;