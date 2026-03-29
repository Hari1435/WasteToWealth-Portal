const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const wasteRoutes = require('./routes/waste');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const protectedRoutes = require('./routes/protected');
const pageRoutes = require('./routes/pageRoutes');




// Import database connection and health check
const connectDB = require('./config/database');
const dbHealthCheck = require('./utils/dbHealthCheck');

const app = express();

// Connect to database
connectDB().then(() => {
  // Start database health monitoring after successful connection
  dbHealthCheck.startHealthCheck();
}).catch((error) => {
  console.error('❌ Failed to start database health check:', error);
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/pages', pageRoutes);



// Health check route
app.get('/api/health', (req, res) => {
  const dbHealth = dbHealthCheck.getHealthStatus();

  res.status(dbHealth.isHealthy ? 200 : 503).json({
    status: dbHealth.isHealthy ? 'OK' : 'UNHEALTHY',
    message: 'Agricultural Waste Marketplace API is running',
    timestamp: new Date().toISOString(),
    database: {
      status: dbHealth.isHealthy ? 'connected' : 'disconnected',
      connectionState: dbHealth.connectionState,
      lastHealthCheck: dbHealth.lastHealthCheck,
      uptime: `${Math.floor(dbHealth.uptime)}s`
    }
  });
});

// Database health check route
app.get('/api/health/database', async (req, res) => {
  try {
    await dbHealthCheck.checkHealth();
    const dbHealth = dbHealthCheck.getHealthStatus();

    res.status(dbHealth.isHealthy ? 200 : 503).json({
      success: true,
      data: dbHealth,
      message: dbHealth.isHealthy ? 'Database is healthy' : 'Database is unhealthy'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database health check failed',
      error: error.message
    });
  }
});

// Force database reconnection route (for debugging)
app.post('/api/health/database/reconnect', async (req, res) => {
  try {
    await dbHealthCheck.forceReconnect();
    res.status(200).json({
      success: true,
      message: 'Database reconnection successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database reconnection failed',
      error: error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    console.log('🔒 HTTP server closed');

    // Stop database health check
    dbHealthCheck.stopHealthCheck();

    // Close database connection (without callback in newer Mongoose versions)
    mongoose.connection.close().then(() => {
      console.log('🔒 MongoDB connection closed');
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    }).catch((error) => {
      console.error('❌ Error closing MongoDB connection:', error);
      process.exit(1);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;