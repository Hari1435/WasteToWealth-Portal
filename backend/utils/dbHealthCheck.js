const mongoose = require('mongoose');

class DatabaseHealthCheck {
  constructor() {
    this.isHealthy = false;
    this.lastHealthCheck = null;
    this.healthCheckInterval = null;
  }

  // Start periodic health checks
  startHealthCheck(intervalMs = 30000) { // Check every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.checkHealth();
    }, intervalMs);
    
    console.log(`🏥 Database health check started (interval: ${intervalMs}ms)`);
  }

  // Stop health checks
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('🏥 Database health check stopped');
    }
  }

  // Check database health
  async checkHealth() {
    try {
      const state = mongoose.connection.readyState;
      
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      if (state === 1) {
        // Perform a simple ping to ensure connection is working
        await mongoose.connection.db.admin().ping();
        
        if (!this.isHealthy) {
          console.log('✅ Database health check: Connection restored');
        }
        
        this.isHealthy = true;
        this.lastHealthCheck = new Date();
      } else {
        if (this.isHealthy) {
          console.log(`⚠️ Database health check: Connection unhealthy (state: ${this.getStateString(state)})`);
        }
        this.isHealthy = false;
      }
    } catch (error) {
      if (this.isHealthy) {
        console.error('❌ Database health check failed:', error.message);
      }
      this.isHealthy = false;
    }
  }

  // Get connection state as string
  getStateString(state) {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[state] || 'unknown';
  }

  // Get current health status
  getHealthStatus() {
    return {
      isHealthy: this.isHealthy,
      connectionState: this.getStateString(mongoose.connection.readyState),
      lastHealthCheck: this.lastHealthCheck,
      uptime: process.uptime()
    };
  }

  // Force reconnection if unhealthy
  async forceReconnect() {
    try {
      console.log('🔄 Forcing database reconnection...');
      
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
      
      await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        heartbeatFrequencyMS: 10000,
        maxIdleTimeMS: 30000,
      });
      
      console.log('✅ Database reconnection successful');
      this.isHealthy = true;
    } catch (error) {
      console.error('❌ Database reconnection failed:', error.message);
      this.isHealthy = false;
      throw error;
    }
  }
}

// Export singleton instance
const dbHealthCheck = new DatabaseHealthCheck();
module.exports = dbHealthCheck;