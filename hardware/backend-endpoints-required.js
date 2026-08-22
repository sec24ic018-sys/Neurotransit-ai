/**
 * NeuroTransit AI - Backend Endpoints for Hardware Simulator Integration
 * 
 * Copy this file into your backend/routes/ directory
 * These endpoints are required for the hardware simulator to work
 */

const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');

// In-memory storage (replace with database for production)
let trafficData = {};

/**
 * Initialize intersections
 * This should be called once when the backend starts
 */
function initializeIntersections() {
  const intersections = [
    {
      id: 'CHN-001',
      name: 'Velachery Junction',
      location: { lat: 12.9656, lng: 80.2094 },
      vehicleCount: 0,
      density: 0,
      congestionLevel: 'low',
      averageSpeed: 40,
      timestamp: new Date()
    },
    {
      id: 'CHN-002',
      name: 'Adyar Signal',
      location: { lat: 13.0051, lng: 80.2110 },
      vehicleCount: 0,
      density: 0,
      congestionLevel: 'low',
      averageSpeed: 40,
      timestamp: new Date()
    },
    {
      id: 'CHN-003',
      name: 'Thiruvanmiyur Signal',
      location: { lat: 12.9944, lng: 80.2473 },
      vehicleCount: 0,
      density: 0,
      congestionLevel: 'low',
      averageSpeed: 40,
      timestamp: new Date()
    },
    {
      id: 'CHN-004',
      name: 'Besant Nagar Signal',
      location: { lat: 13.0099, lng: 80.2604 },
      vehicleCount: 0,
      density: 0,
      congestionLevel: 'low',
      averageSpeed: 40,
      timestamp: new Date()
    },
    {
      id: 'CHN-005',
      name: 'Mylapore Signal',
      location: { lat: 13.0382, lng: 80.2708 },
      vehicleCount: 0,
      density: 0,
      congestionLevel: 'low',
      averageSpeed: 40,
      timestamp: new Date()
    },
    {
      id: 'CHN-006',
      name: 'Triplicane Signal',
      location: { lat: 13.0559, lng: 80.2807 },
      vehicleCount: 0,
      density: 0,
      congestionLevel: 'low',
      averageSpeed: 40,
      timestamp: new Date()
    }
  ];

  intersections.forEach(intersection => {
    trafficData[intersection.id] = intersection;
  });

  logger.info(`Initialized ${intersections.length} intersections for traffic simulation`);
}

/**
 * POST /api/traffic/update
 * Receive traffic updates from the hardware simulator
 * 
 * Request Body:
 * {
 *   timestamp: "2026-08-22T14:32:45.123Z",
 *   intersections: [
 *     {
 *       id: "CHN-001",
 *       name: "Velachery Junction",
 *       vehicleCount: 67,
 *       density: 45,
 *       congestionLevel: "medium",
 *       averageSpeed: 28,
 *       timestamp: "2026-08-22T14:32:45.123Z"
 *     },
 *     ...
 *   ]
 * }
 */
router.post('/update', (req, res) => {
  try {
    const { timestamp, intersections } = req.body;

    if (!Array.isArray(intersections)) {
      return res.status(400).json({
        error: 'Invalid request format',
        message: 'Expected intersections array in request body'
      });
    }

    // Update traffic data
    let processedCount = 0;
    intersections.forEach(intersection => {
      if (intersection.id && trafficData[intersection.id]) {
        trafficData[intersection.id] = {
          ...trafficData[intersection.id],
          ...intersection,
          timestamp: new Date(intersection.timestamp || timestamp)
        };
        processedCount++;

        // Log significant changes
        if (intersection.congestionLevel === 'critical' || intersection.density > 80) {
          logger.warn(`🚨 High congestion detected at ${intersection.name}: ${intersection.density}%`);
        }
      }
    });

    res.json({
      success: true,
      processed: processedCount,
      total: intersections.length,
      timestamp: new Date()
    });

    logger.debug(`Traffic update received: ${processedCount}/${intersections.length} intersections processed`);
  } catch (error) {
    logger.error('Error processing traffic update:', error);
    res.status(500).json({ error: 'Failed to process traffic update' });
  }
});

/**
 * GET /api/traffic/intersections
 * OR
 * GET /api/intersections
 * 
 * Returns all intersections with current traffic data
 * This is used by the p5.js visualizer
 * 
 * Response:
 * [
 *   {
 *     id: "CHN-001",
 *     name: "Velachery Junction",
 *     location: { lat: 12.9656, lng: 80.2094 },
 *     vehicleCount: 67,
 *     density: 45,
 *     congestionLevel: "medium",
 *     averageSpeed: 28,
 *     timestamp: "2026-08-22T14:32:45.123Z"
 *   },
 *   ...
 * ]
 */
router.get('/intersections', (req, res) => {
  try {
    const intersections = Object.values(trafficData);

    // Optional filtering by congestion level
    const { level } = req.query;
    if (level) {
      const filtered = intersections.filter(i => i.congestionLevel === level);
      return res.json(filtered);
    }

    res.json(intersections);
  } catch (error) {
    logger.error('Error fetching intersections:', error);
    res.status(500).json({ error: 'Failed to fetch intersections' });
  }
});

/**
 * GET /api/traffic/intersections/:id
 * OR
 * GET /api/intersections/:id
 * 
 * Returns specific intersection data
 */
router.get('/intersections/:id', (req, res) => {
  try {
    const intersection = trafficData[req.params.id];

    if (!intersection) {
      return res.status(404).json({
        error: 'Not found',
        message: `Intersection ${req.params.id} not found`
      });
    }

    res.json(intersection);
  } catch (error) {
    logger.error('Error fetching intersection:', error);
    res.status(500).json({ error: 'Failed to fetch intersection' });
  }
});

/**
 * GET /api/traffic/stats
 * Returns aggregated traffic statistics
 */
router.get('/stats', (req, res) => {
  try {
    const intersections = Object.values(trafficData);

    if (intersections.length === 0) {
      return res.json({
        averageDensity: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        totalVehicles: 0,
        averageSpeed: 0
      });
    }

    const stats = {
      averageDensity: Math.round(
        intersections.reduce((sum, i) => sum + i.density, 0) / intersections.length
      ),
      totalVehicles: intersections.reduce((sum, i) => sum + i.vehicleCount, 0),
      averageSpeed: Math.round(
        intersections.reduce((sum, i) => sum + i.averageSpeed, 0) / intersections.length
      ),
      criticalCount: intersections.filter(i => i.congestionLevel === 'critical').length,
      highCount: intersections.filter(i => i.congestionLevel === 'high').length,
      mediumCount: intersections.filter(i => i.congestionLevel === 'medium').length,
      lowCount: intersections.filter(i => i.congestionLevel === 'low').length,
      timestamp: new Date()
    };

    res.json(stats);
  } catch (error) {
    logger.error('Error calculating traffic stats:', error);
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
});

/**
 * GET /api/traffic/alerts
 * Returns only critical congestion alerts
 */
router.get('/alerts', (req, res) => {
  try {
    const intersections = Object.values(trafficData);
    const alerts = intersections.filter(i => i.congestionLevel === 'critical' || i.density > 80);

    res.json({
      count: alerts.count,
      timestamp: new Date(),
      intersections: alerts
    });
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/**
 * IMPORTANT: Wire up these routes in your main server.js
 * 
 * Example:
 * 
 * const trafficRoutes = require('./routes/traffic');
 * app.use('/api/traffic', trafficRoutes);  // For /api/traffic/* routes
 * app.use('/api', trafficRoutes);           // For /api/intersections/* routes
 * 
 * Also initialize intersections on server startup:
 * 
 * initializeIntersections();
 */

module.exports = {
  router,
  initializeIntersections,
  trafficData  // Export for testing/debugging
};
