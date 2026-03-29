// Distance API Test Utility
import { rapidApiDistance } from './rapidApiDistance';

export const testDistanceAPIs = async () => {
  console.log('🧪 Testing Distance APIs...');
  
  // Test coordinates (Delhi to Mumbai)
  const testOrigin = { lat: 28.6139, lng: 77.2090 };
  const testDestination = { lat: 19.0760, lng: 72.8777 };
  
  try {
    const result = await rapidApiDistance.calculateDistance(testOrigin, testDestination);
    
    console.log('✅ Distance API Test Results:');
    console.log('Distance:', result.distanceKm, 'km');
    console.log('Duration:', result.durationMinutes, 'minutes');
    console.log('Source:', result.source);
    console.log('Road Distance:', result.roadDistance ? 'Yes' : 'No');
    
    return {
      success: true,
      result: result,
      message: `Distance calculation working via ${result.source}`
    };
  } catch (error) {
    console.error('❌ Distance API Test Failed:', error.message);
    
    return {
      success: false,
      error: error.message,
      message: 'Distance calculation is currently unavailable'
    };
  }
};

export const getAPIStatus = () => {
  const status = rapidApiDistance.getAPIStatus();
  
  console.log('📊 Distance API Status:');
  console.log('OpenRouteService:', status.openRouteService ? '✅ Available' : '❌ Not configured');
  console.log('RapidAPI:', status.rapidAPI ? '✅ Available' : '❌ Not configured');
  console.log('Haversine Fallback:', status.haversine ? '✅ Always available' : '❌ Error');
  
  return status;
};

// Auto-run test in development
if (process.env.NODE_ENV === 'development') {
  // Run test after a short delay to ensure environment is loaded
  setTimeout(() => {
    getAPIStatus();
    // Uncomment to run automatic test
    // testDistanceAPIs();
  }, 2000);
}

export default { testDistanceAPIs, getAPIStatus };