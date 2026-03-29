import { geoapifyService } from './geoapifyService';

/**
 * Distance calculation service using Geoapify API
 */
class DistanceService {
  /**
   * Calculate distance between two coordinates
   * @param {Object} origin - Origin coordinates {lat, lng}
   * @param {Object} destination - Destination coordinates {lat, lng}
   * @returns {Promise<Object>} Distance and duration information
   */
  async calculateDistance(origin, destination) {
    try {
      if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
        throw new Error('Invalid coordinates provided');
      }

      const result = await geoapifyService.calculateRoute(origin, destination);
      
      return {
        distance: result.distance, // in meters
        distanceKm: (result.distance / 1000).toFixed(2), // in kilometers
        duration: result.duration, // in seconds
        durationMinutes: Math.round(result.duration / 60), // in minutes
        success: true
      };
    } catch (error) {
      console.error('Distance calculation failed:', error);
      return {
        distance: null,
        distanceKm: null,
        duration: null,
        durationMinutes: null,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate distance using Haversine formula (fallback)
   * @param {Object} origin - Origin coordinates {lat, lng}
   * @param {Object} destination - Destination coordinates {lat, lng}
   * @returns {number} Distance in kilometers
   */
  calculateHaversineDistance(origin, destination) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(destination.lat - origin.lat);
    const dLng = this.toRadians(destination.lng - origin.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(origin.lat)) * Math.cos(this.toRadians(destination.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees 
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format distance for display
   * @param {number} distanceKm - Distance in kilometers
   * @returns {string} Formatted distance string
   */
  formatDistance(distanceKm) {
    if (!distanceKm) return 'N/A';
    
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    
    return `${parseFloat(distanceKm).toFixed(1)}km`;
  }

  /**
   * Format duration for display
   * @param {number} durationMinutes - Duration in minutes
   * @returns {string} Formatted duration string
   */
  formatDuration(durationMinutes) {
    if (!durationMinutes) return 'N/A';
    
    if (durationMinutes < 60) {
      return `${durationMinutes}min`;
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (minutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${minutes}min`;
  }
}

// Export singleton instance
export const distanceService = new DistanceService();
export default distanceService;