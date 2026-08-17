const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// Import configurations and utilities
const { initMQTT, publishMessage } = require('./config/mqtt');
const { logger } = require('./utils/logger');
const { optimizeSignal } = require('./utils/signal-optimizer');
const { coordinateEmergencyVehicle, clearEmergencyCorridor } = require('./utils/emergency-corridor');

// Import routes
const intersectionsRouter = require('./routes/intersections');
const emergencyRouter = require('./routes/emergency');
const analyticsRouter = require('./routes/analytics');
const healthRouter = require('./routes/health');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');

// In-memory data stores
global.intersections = new Map();
global.emergencyVehicles = new Map();
global.analyticsData = [];

// Initialize mock intersection data
function initializeIntersections() {
  const intersectionData = [
    { id: 'CHN-001', name: 'Mount Road - Cathedral Intersection', lat: 13.0475, lng: 80.2720 },
    { id: 'CHN-002', name: 'Anna Salai - Pantheon Intersection', lat: 13.0493, lng: 80.2690 },
    { id: 'CHN-003', name: 'Nungambakkam Intersection', lat: 13.0597, lng: 80.2633 },
    { id: 'CHN-004', name: 'Chennai Central Railway Intersection', lat: 13.0823, lng: 80.2794 },
    { id: 'CHN-005', name: 'High Court Intersection', lat: 13.0630, lng: 80.2815 },
    { id: 'CHN-006', name: 'Teynampet Intersection', lat: 13.0465, lng: 80.2540 }
  ];

  intersectionData.forEach(data => {
    global.intersections.set(data.id, {
      ...data,
      vehicleCount: Math.floor(Math.random() * 100),
      greenTime: 25,
      redTime: 35,
      yellowTime: 5,
      signalDuration: 60,
      status: 'active',
      efficiency: Math.random() * 100,
      lastUpdated: new Date().toISOString(),
      history: []
    });
  });
  logger.info(`Initialized ${intersectionData.length} intersections`);
}

// Initialize MQTT connection
async function initializeSystem() {
  try {
    await initMQTT();
    initializeIntersections();
    logger.info('NeuroTransit AI system initialized');
  } catch (error) {
    logger.error('Initialization error:', error);
  }
}

// Real-time simulation - update vehicle counts and optimize signals
setInterval(() => {
  global.intersections.forEach((intersection, id) => {
    // Update vehicle count with random variation
    const variation = Math.floor((Math.random() - 0.5) * 30);
    intersection.vehicleCount = Math.max(0, Math.min(100, intersection.vehicleCount + variation));
    intersection.lastUpdated = new Date().toISOString();

    // Optimize signal timing
    const optimized = optimizeSignal(intersection.vehicleCount);
    intersection.greenTime = optimized.greenTime;
    intersection.redTime = optimized.redTime;
    intersection.efficiency = Math.random() * 100;

    // Add to history
    if (!intersection.history) intersection.history = [];
    intersection.history.push({
      timestamp: new Date().toISOString(),
      vehicleCount: intersection.vehicleCount,
      greenTime: intersection.greenTime,
      efficiency: intersection.efficiency
    });

    // Keep only last 100 records
    if (intersection.history.length > 100) {
      intersection.history.shift();
    }

    // Publish to MQTT
    publishMessage(`signals/control/${id}`, {
      intersectionId: id,
      greenTime: intersection.greenTime,
      redTime: intersection.redTime,
      status: 'active',
      timestamp: new Date().toISOString()
    });
  });

  // Record analytics
  recordAnalytics();
}, process.env.SIMULATION_INTERVAL || 5000);

// Record analytics data
function recordAnalytics() {
  const totalVehicles = Array.from(global.intersections.values()).reduce((sum, int) => sum + int.vehicleCount, 0);
  const avgWaitTime = Array.from(global.intersections.values()).reduce((sum, int) => sum + (int.redTime * 0.9), 0) / global.intersections.size;
  const avgTravelTime = avgWaitTime * 5;
  const vehicleThroughput = totalVehicles * 3.6;
  const fuelConsumption = totalVehicles * 0.048;
  const emissionsSaved = Math.round(totalVehicles * 6.78);
  const emergencyResponseTime = 4.2;
  const optimizationScore = Array.from(global.intersections.values()).reduce((sum, int) => sum + int.efficiency, 0) / global.intersections.size;

  const analyticsRecord = {
    timestamp: new Date().toISOString(),
    totalVehicles,
    avgWaitTime: Math.round(avgWaitTime * 10) / 10,
    avgTravelTime: Math.round(avgTravelTime * 10) / 10,
    vehicleThroughput: Math.round(vehicleThroughput),
    fuelConsumption: Math.round(fuelConsumption * 10) / 10,
    emissionsSaved,
    emergencyResponseTime,
    optimizationScore: Math.round(optimizationScore * 10) / 10
  };

  global.analyticsData.push(analyticsRecord);

  // Keep only last 1000 records
  if (global.analyticsData.length > 1000) {
    global.analyticsData.shift();
  }
}

// Routes
app.use('/api/intersections', intersectionsRouter);
app.use('/api/emergency', emergencyRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/health', healthRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'NeuroTransit AI',
    version: '1.0.0',
    status: 'operational',
    message: 'Decentralized AI-Powered Traffic Management System',
    endpoints: {
      intersections: '/api/intersections',
      emergency: '/api/emergency',
      analytics: '/api/analytics',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.path} does not exist`
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`NeuroTransit AI Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  initializeSystem();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
