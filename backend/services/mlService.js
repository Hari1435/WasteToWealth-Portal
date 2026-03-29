/**
 * ML Service for delivery charge prediction
 * Provides fallback calculations when ML API is unavailable
 */

class MLService {
  constructor() {
    this.isHealthy = false;
    this.lastHealthCheck = null;
  }

  /**
   * Check ML API health status
   */
  async checkHealth() {
    try {
      // For now, return a mock health status
      // In production, this would ping the actual ML API
      this.lastHealthCheck = new Date();
      this.isHealthy = false; // Set to false since we don't have ML API yet
      
      return {
        status: 'unavailable',
        message: 'ML API not configured - using fallback calculations',
        timestamp: this.lastHealthCheck,
        fallback_available: true
      };
    } catch (error) {
      this.isHealthy = false;
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date(),
        fallback_available: true
      };
    }
  }

  /**
   * Predict delivery charge with automatic fallback
   */
  async calculateDeliveryChargeWithFallback(orderData) {
    try {
      // Try ML prediction first (currently not available)
      const mlResult = await this.predictDeliveryCharge(orderData);
      
      if (mlResult.success) {
        return {
          delivery_charge: mlResult.prediction,
          method: 'ml_prediction',
          confidence_range: mlResult.confidence_range,
          details: mlResult.details
        };
      }
      
      throw new Error('ML prediction failed');
    } catch (error) {
      console.log('🔄 ML prediction failed, using fallback calculation');
      
      // Use fallback calculation
      const fallbackCharge = this.calculateFallbackDeliveryCharge(orderData);
      
      return {
        delivery_charge: fallbackCharge,
        method: 'fallback_calculation',
        confidence_range: {
          min: Math.round(fallbackCharge * 0.85),
          max: Math.round(fallbackCharge * 1.15)
        },
        details: {
          message: 'Calculated using fallback algorithm',
          factors: {
            truck_type: orderData.truck_type,
            distance: orderData.distance,
            quantity: orderData.quantity,
            region: orderData.region
          }
        }
      };
    }
  }

  /**
   * Predict delivery charge using ML API
   */
  async predictDeliveryCharge(orderData) {
    try {
      // For now, return failure to trigger fallback
      // In production, this would call the actual ML API
      return {
        success: false,
        error: 'ML API not available',
        prediction: null,
        confidence_range: null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        prediction: null,
        confidence_range: null
      };
    }
  }

  /**
   * Batch predict delivery charges
   */
  async predictBatchDeliveryCharges(orders) {
    try {
      const predictions = [];
      
      for (const order of orders) {
        const result = await this.calculateDeliveryChargeWithFallback(order);
        predictions.push({
          ...order,
          predicted_charge: result.delivery_charge,
          method: result.method,
          confidence_range: result.confidence_range
        });
      }
      
      return {
        data: {
          predictions,
          total_orders: orders.length,
          successful_predictions: predictions.length
        },
        method: 'fallback_batch'
      };
    } catch (error) {
      throw new Error(`Batch prediction failed: ${error.message}`);
    }
  }

  /**
   * Fallback delivery charge calculation
   */
  calculateFallbackDeliveryCharge(orderData) {
    const {
      truck_type = 'medium',
      quantity = 1,
      distance = 10,
      region = 'suburban',
      time_factor = 1.0
    } = orderData;

    // Base rates per km for different truck types (in INR)
    const truckRates = {
      mini: 12,
      small: 20,
      medium: 35,
      large: 55,
      extra_large: 75
    };

    // Region multipliers
    const regionMultipliers = {
      urban: 1.3,
      suburban: 1.1,
      rural: 1.0
    };

    // Get base rate
    const baseRate = truckRates[truck_type.toLowerCase()] || truckRates.medium;
    
    // Get region multiplier
    const regionMultiplier = regionMultipliers[region.toLowerCase()] || regionMultipliers.suburban;
    
    // Calculate quantity factor (more quantity = slightly higher cost per km)
    const quantityFactor = 1 + (quantity / 10) * 0.1;
    
    // Calculate time factor
    const timeFactor = Math.max(0.8, Math.min(1.5, time_factor));
    
    // Calculate final charge
    const baseCharge = baseRate * distance * quantityFactor * regionMultiplier * timeFactor;
    
    // Add minimum charge and round to 2 decimal places
    const minCharge = 100; // Minimum ₹100
    const finalCharge = Math.max(minCharge, Math.round(baseCharge * 100) / 100);
    
    return finalCharge;
  }
}

// Export singleton instance
module.exports = new MLService();