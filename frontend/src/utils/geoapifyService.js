// Geoapify Location Service for enhanced autocomplete and geocoding
import axios from 'axios';

// Geoapify API configuration
const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY;
const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1';

// Create axios instance for Geoapify
const geoapifyAPI = axios.create({
  baseURL: GEOAPIFY_BASE_URL,
  timeout: 10000,
});

export const geoapifyService = {
  // Autocomplete places with Geoapify
  autocomplete: async (text, options = {}) => {
    try {
      if (!text || text.length < 2) {
        return [];
      }

      if (!GEOAPIFY_API_KEY) {
        console.warn('Geoapify API key not found, falling back to basic service');
        return [];
      }

      const params = {
        text: text.trim(),
        apiKey: GEOAPIFY_API_KEY,
        limit: options.limit || 10,
        lang: 'en',
        format: 'json',
        ...options.filters
      };

      // Add country filter for India if not specified
      if (!params.filter && !params.bias) {
        params.filter = 'countrycode:in';
      }

      const response = await geoapifyAPI.get('/geocode/autocomplete', { params });

      if (!response.data || !response.data.results) {
        return [];
      }

      const results = response.data.results.map(item => {
        console.log('🌍 Geoapify raw item:', item);
        console.log('📮 Postcode in raw item:', item.postcode);
        
        // Try to extract postcode from different fields or formatted address
        let postcode = item.postcode || item.postal_code || item.zip || item.zipcode || '';
        
        // If no postcode found, try to extract from formatted address (Indian pincode pattern)
        if (!postcode && item.formatted) {
          const pincodeMatch = item.formatted.match(/\b\d{6}\b/);
          if (pincodeMatch) {
            postcode = pincodeMatch[0];
            console.log('📮 Extracted postcode from formatted address:', postcode);
          }
        }
        
        return {
          id: item.place_id || `${item.lat}-${item.lon}`,
          name: item.formatted,
          city: item.city || item.town || item.village || '',
          state: item.state || item.region || '',
          country: item.country || '',
          postcode: postcode,
          lat: item.lat,
          lon: item.lon,
          confidence: item.confidence || 0,
          type: item.result_type,
          address: {
            street: item.street || '',
            housenumber: item.housenumber || '',
            district: item.district || '',
            suburb: item.suburb || '',
            county: item.county || ''
          },
          bbox: item.bbox,
          raw: item
        };
      });
      
      console.log('🏠 Processed Geoapify results:', results);
      return results;
    } catch (error) {
      console.error('Geoapify autocomplete error:', error);
      return [];
    }
  },

  // Reverse geocoding with Geoapify
  reverseGeocode: async (lat, lon) => {
    try {
      if (!GEOAPIFY_API_KEY) {
        throw new Error('Geoapify API key not configured');
      }

      const params = {
        lat,
        lon,
        apiKey: GEOAPIFY_API_KEY,
        lang: 'en',
        format: 'json'
      };

      const response = await geoapifyAPI.get('/geocode/reverse', { params });

      if (!response.data || !response.data.results || response.data.results.length === 0) {
        throw new Error('No address found for this location');
      }

      const result = response.data.results[0];
      return {
        formatted: result.formatted,
        city: result.city || result.town || result.village || '',
        state: result.state || result.region || '',
        country: result.country || '',
        postcode: result.postcode || '',
        street: result.street || '',
        housenumber: result.housenumber || '',
        district: result.district || '',
        suburb: result.suburb || '',
        county: result.county || '',
        lat: result.lat,
        lon: result.lon,
        confidence: result.confidence || 0,
        raw: result
      };
    } catch (error) {
      console.error('Geoapify reverse geocoding error:', error);
      throw new Error('Failed to get address from coordinates');
    }
  },

  // Forward geocoding with Geoapify
  geocode: async (address) => {
    try {
      if (!GEOAPIFY_API_KEY) {
        throw new Error('Geoapify API key not configured');
      }

      const params = {
        text: address,
        apiKey: GEOAPIFY_API_KEY,
        lang: 'en',
        format: 'json',
        limit: 1
      };

      const response = await geoapifyAPI.get('/geocode/search', { params });

      if (!response.data || !response.data.results || response.data.results.length === 0) {
        throw new Error('Address not found');
      }

      const result = response.data.results[0];
      return {
        lat: result.lat,
        lon: result.lon,
        formatted: result.formatted,
        confidence: result.confidence || 0,
        raw: result
      };
    } catch (error) {
      console.error('Geoapify geocoding error:', error);
      throw new Error('Failed to find coordinates for this address');
    }
  },

  // Get place details by place ID
  getPlaceDetails: async (placeId) => {
    try {
      if (!GEOAPIFY_API_KEY) {
        throw new Error('Geoapify API key not configured');
      }

      const params = {
        id: placeId,
        apiKey: GEOAPIFY_API_KEY,
        lang: 'en',
        format: 'json'
      };

      const response = await geoapifyAPI.get('/geocode/details', { params });

      if (!response.data || !response.data.results || response.data.results.length === 0) {
        throw new Error('Place details not found');
      }

      return response.data.results[0];
    } catch (error) {
      console.error('Geoapify place details error:', error);
      throw new Error('Failed to get place details');
    }
  },

  // Search places by category (e.g., restaurants, hospitals, etc.)
  searchByCategory: async (lat, lon, category, radius = 5000) => {
    try {
      if (!GEOAPIFY_API_KEY) {
        throw new Error('Geoapify API key not configured');
      }

      const params = {
        categories: category,
        filter: `circle:${lon},${lat},${radius}`,
        apiKey: GEOAPIFY_API_KEY,
        lang: 'en',
        format: 'json',
        limit: 20
      };

      const response = await geoapifyAPI.get('/places', { params });

      if (!response.data || !response.data.results) {
        return [];
      }

      return response.data.results.map(item => ({
        id: item.place_id,
        name: item.name,
        formatted: item.formatted,
        categories: item.categories,
        lat: item.lat,
        lon: item.lon,
        distance: item.distance,
        raw: item
      }));
    } catch (error) {
      console.error('Geoapify category search error:', error);
      return [];
    }
  },

  // Calculate route between two points
  calculateRoute: async (origin, destination, options = {}) => {
    try {
      if (!GEOAPIFY_API_KEY) {
        throw new Error('Geoapify API key not configured');
      }

      const params = {
        waypoints: `${origin.lat},${origin.lng}|${destination.lat},${destination.lng}`,
        mode: options.mode || 'drive',
        apiKey: GEOAPIFY_API_KEY,
        format: 'json'
      };

      const response = await geoapifyAPI.get('/routing', { params });

      if (!response.data || !response.data.features || response.data.features.length === 0) {
        throw new Error('No route found');
      }

      const route = response.data.features[0];
      const properties = route.properties;

      return {
        distance: properties.distance, // in meters
        duration: properties.time, // in seconds
        geometry: route.geometry,
        raw: response.data
      };
    } catch (error) {
      console.error('Geoapify routing error:', error);
      throw new Error('Failed to calculate route');
    }
  },

  // Check if Geoapify is available
  isAvailable: () => {
    return !!GEOAPIFY_API_KEY;
  }
};

export default geoapifyService;