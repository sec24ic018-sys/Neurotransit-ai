const express = require('express');
const router = express.Router();
const { validateIntersectionId, validateTrafficData } = require('../middleware/validation');
const { logger } = require('../utils/logger');

/**
 * GET /api/intersections
 * Returns all intersections with current status
 */
router.get('/', (req, res) => {
  try {
    const intersections = Array.from(global.intersections.values());
    
    res.json({
      success: true,
      data: intersections,
      count: intersections.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching intersections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch intersections'
    });
  }
});

/**
 * GET /api/intersections/:id
 * Returns single intersection details
 */
router.get('/:id', validateIntersectionId, (req, res) => {
  try {
    const intersection = global.intersections.get(req.params.id);
    
    res.json({
      success: true,
      data: intersection,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching intersection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch intersection'
    });
  }
});

/**
 * POST /api/intersections/:id/traffic
 * Updates vehicle count at intersection
 */
router.post('/:id/traffic', validateIntersectionId, validateTrafficData, (req, res) => {
  try {
    const { vehicleCount } = req.body;
    const intersection = global.intersections.get(req.params.id);

    if (!intersection) {
      return res.status(404).json({
        success: false,
        error: 'Intersection not found'
      });
    }

    // Update vehicle count
    intersection.vehicleCount = vehicleCount;
    intersection.lastUpdated = new Date().toISOString();

    res.json({
      success: true,
      message: 'Traffic data updated',
      data: intersection,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating traffic data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update traffic data'
    });
  }
});

/**
 * POST /api/intersections/:id/update
 * Updates vehicle data received from the Python computer vision engine
 */
router.post('/:id/update', validateIntersectionId, validateTrafficData, (req, res) => {
  try {
    const { vehicleCount } = req.body;
    const intersection = global.intersections.get(req.params.id);
    const greenTime = Math.min(Math.max(Math.round(vehicleCount * 1.8), 15), 90);
    const redTime = Math.max(0, 60 - greenTime - (intersection.yellowTime || 5));

    intersection.vehicleCount = vehicleCount;
    intersection.greenTime = greenTime;
    intersection.redTime = redTime;
    intersection.waitTime = Math.round(redTime * 0.9);
    intersection.lastUpdated = new Date().toISOString();

    res.json({
      success: true,
      message: 'Traffic data updated',
      data: intersection,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating AI traffic data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update AI traffic data'
    });
  }
});

/**
 * GET /api/intersections/:id/signal
 * Returns current signal timing for intersection
 */
router.get('/:id/signal', validateIntersectionId, (req, res) => {
  try {
    const intersection = global.intersections.get(req.params.id);

    if (!intersection) {
      return res.status(404).json({
        success: false,
        error: 'Intersection not found'
      });
    }

    res.json({
      success: true,
      data: {
        intersectionId: intersection.id,
        greenTime: intersection.greenTime,
        yellowTime: intersection.yellowTime || 5,
        redTime: intersection.redTime,
        signalDuration: intersection.signalDuration,
        status: intersection.status,
        vehicleCount: intersection.vehicleCount,
        efficiency: intersection.efficiency
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching signal data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch signal data'
    });
  }
});

/**
 * GET /api/intersections/:id/history
 * Returns historical data for intersection
 */
router.get('/:id/history', validateIntersectionId, (req, res) => {
  try {
    const intersection = global.intersections.get(req.params.id);

    if (!intersection) {
      return res.status(404).json({
        success: false,
        error: 'Intersection not found'
      });
    }

    const history = intersection.history || [];

    res.json({
      success: true,
      data: history,
      count: history.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching intersection history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch intersection history'
    });
  }
});

module.exports = router;
