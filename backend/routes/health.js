const express = require('express');
const router = express.Router();
const { isConnected: isMQTTConnected } = require('../config/mqtt');
const { logger } = require('../utils/logger');

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', (req, res) => {
  try {
    const intersectionsCount = global.intersections.size;
    const emergencyVehiclesCount = Array.from(global.emergencyVehicles.values())
      .filter(v => v.status === 'prioritized').length;
    const analyticsRecords = global.analyticsData.length;

    const status = {
      status: 'operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      system: {
        intersectionsOnline: intersectionsCount,
        emergencyVehiclesActive: emergencyVehiclesCount,
        analyticsRecords,
        mqttConnected: isMQTTConnected()
      },
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error in health check:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

/**
 * GET /api/health/intersections
 * Intersections health status
 */
router.get('/intersections', (req, res) => {
  try {
    const intersectionsStatus = Array.from(global.intersections.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      status: data.status,
      vehicleCount: data.vehicleCount,
      efficiency: data.efficiency,
      lastUpdated: data.lastUpdated
    }));

    res.json({
      success: true,
      data: intersectionsStatus,
      count: intersectionsStatus.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching intersections health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch intersections health'
    });
  }
});

/**
 * GET /api/health/status
 * System operational status
 */
router.get('/status', (req, res) => {
  try {
    const activeIntersections = Array.from(global.intersections.values())
      .filter(int => int.status === 'active').length;

    const avgEfficiency = Array.from(global.intersections.values()).length > 0
      ? Array.from(global.intersections.values()).reduce((sum, int) => sum + int.efficiency, 0) / global.intersections.size
      : 0;

    res.json({
      success: true,
      data: {
        systemStatus: 'operational',
        activeIntersections,
        totalIntersections: global.intersections.size,
        averageEfficiency: Math.round(avgEfficiency * 10) / 10,
        mqttConnected: isMQTTConnected(),
        emergencyVehiclesActive: Array.from(global.emergencyVehicles.values())
          .filter(v => v.status === 'prioritized').length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching system status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system status'
    });
  }
});

module.exports = router;
