import axios from 'axios';

// RapidAPI Distance Calculator Configuration
const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.REACT_APP_RAPIDAPI_HOST;

// Alternative RapidAPI services for distance calculation
const ALTERNATIVE_APIS = [
  {
    name: 'Distance Calculator',
    host: 'distance-calculator.p.rapidapi.com',
    endpoint: '/distance',
    params: (origin, destination) => ({
      lat1: origin.lat,
      lon1: origin.lng,
      lat2: destination.lat,
      lon2: destination.lng,
      unit: 'km'
    })
  },
  {
    name: 'Distance Matrix',
    host: 'distancematrix.p.rapidapi.com',
    endpoint: '/distancematrix',
    params: (origin, destination) => ({
      origins: `${origin.lat},${origin.lng}`,
      destinations: `${destination.lat},${destination.lng}`,
      unit: 'metric'
    })
  }
];

// Create axios instance for RapidAPI
const createRapidAPIInstance = (host) => axios.create({
  baseURL: `https://${host}`,
  timeout: 15000,
  headers: {
    'X-RapidAPI-Key': RAPIDAPI_KEY,
    'X-RapidAPI-Host': host
  }
});

// OpenRouteService as free alternative (no RapidAPI needed)
const OPENROUTE_API_KEY = process.env.REACT_APP_OPENROUTE_API_KEY;

// Debug environment variables
console.log('🔧 Distance API Configuration:');
console.log('OpenRouteService API key:', OPENROUTE_API_KEY ? '✅ Configured' : '❌ Missing');
console.log('RapidAPI key:', RAPIDAPI_KEY ? '✅ Configured' : '❌ Missing');
console.log('RapidAPI host:', RAPIDAPI_HOST || 'Not configured');

const tryOpenRouteService = async (origin, destination) => {
  if (!OPENROUTE_API_KEY) {
    throw new Error('OpenRouteService API key not configured');
  }
  
  try {
    console.log('🚗 Trying OpenRouteService for road distance...');
    
    const response = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        coordinates: [[origin.lng, origin.lat], [destination.lng, destination.lat]],
        format: 'json'
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    if (response.data && response.data.routes && response.data.routes[0]) {
      const route = response.data.routes[0];
      const distanceKm = (route.summary.distance / 1000);
      const durationMinutes = Math.round(route.summary.duration / 60);

      console.log('✅ OpenRouteService Success:', `${distanceKm.toFixed(2)} km`);

      return {
        distance: route.summary.distance,
        distanceKm: distanceKm.toFixed(2),
        duration: route.summary.duration,
        durationMinutes: durationMinutes,
        success: true,
        source: 'OpenRouteService (Road Distance)',
        roadDistance: true
      };
    }
  } catch (error) {
    console.error('OpenRouteService failed:', error.response?.status || error.message);
    return null;
  }
};

const tryRapidAPI = async (origin, destination) => {
  if (!RAPIDAPI_KEY) {
    throw new Error('RapidAPI key not configured');
  }

  // Try Distance Calculator API first
  const distanceCalcAPI = ALTERNATIVE_APIS.find(api => api.name === 'Distance Calculator');
  if (distanceCalcAPI) {
    try {
      console.log('🔄 Trying RapidAPI Distance Calculator...');
      const rapidAPI = createRapidAPIInstance(distanceCalcAPI.host);
      const params = distanceCalcAPI.params(origin, destination);
      const response = await rapidAPI.get(distanceCalcAPI.endpoint, { params });
      
      if (response.data && response.data.distance) {
        const distanceKm = parseFloat(response.data.distance);
        const durationMinutes = Math.round((distanceKm / 50) * 60); // Estimate: 50 km/h average
        
        console.log('✅ RapidAPI Distance Calculator Success:', `${distanceKm} km`);
        
        return {
          distance: distanceKm * 1000, // Convert to meters
          distanceKm: distanceKm.toFixed(2),
          duration: durationMinutes * 60, // Convert to seconds
          durationMinutes: durationMinutes,
          success: true,
          source: 'RapidAPI Distance Calculator',
          roadDistance: false // This is straight-line distance
        };
      }
    } catch (error) {
      console.warn('RapidAPI Distance Calculator failed:', error.response?.status || error.message);
    }
  }

  return null;
};

export const rapidApiDistance = {
  // Calculate distance with multiple fallback options
  calculateDistance: async (origin, destination) => {
    // Validate coordinates first
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      throw new Error('Invalid coordinates provided');
    }

    console.log('🔍 Starting distance calculation...');
    
    // Try OpenRouteService first (best for road distance)
    try {
      const openRouteResult = await tryOpenRouteService(origin, destination);
      if (openRouteResult) {
        return openRouteResult;
      }
    } catch (error) {
      console.warn('OpenRouteService unavailable:', error.message);
    }

    // Try RapidAPI as backup
    try {
      const rapidResult = await tryRapidAPI(origin, destination);
      if (rapidResult) {
        return rapidResult;
      }
    } catch (error) {
      console.warn('RapidAPI unavailable:', error.message);
    }

    // Fallback to Haversine formula (always works)
    console.log('🔄 Using Haversine formula as fallback...');
    const haversineDistance = calculateHaversineDistance(origin, destination);
    const estimatedDuration = Math.round((haversineDistance / 50) * 60); // Estimate: 50 km/h

    return {
      distance: haversineDistance * 1000, // Convert to meters
      distanceKm: haversineDistance.toFixed(2),
      duration: estimatedDuration * 60, // Convert to seconds
      durationMinutes: estimatedDuration,
      success: true,
      source: 'Haversine Formula (Straight-line distance)',
      roadDistance: false,
      note: 'Using estimated distance. Actual road distance may vary.'
    };
  },

  // Haversine formula for fallback calculation
  calculateHaversineDistance: (origin, destination) => {
    return calculateHaversineDistance(origin, destination);
  },

  // Check if any distance API is available
  isAvailable: () => {
    return !!(OPENROUTE_API_KEY || RAPIDAPI_KEY);
  },

  // Get API status for debugging
  getAPIStatus: () => {
    return {
      openRouteService: !!OPENROUTE_API_KEY,
      rapidAPI: !!RAPIDAPI_KEY,
      haversine: true // Always available
    };
  }
};

// Haversine formula implementation
function calculateHaversineDistance(origin, destination) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(origin.lat)) * Math.cos(toRadians(destination.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

export default rapidApiDistance;