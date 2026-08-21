const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { validateEmergencyData } = require('../middleware/validation');
const { coordinateEmergencyVehicle, clearEmergencyCorridor } = require('../utils/emergency-corridor');
const { logger } = require('../utils/logger');

/**
 * POST /api/emergency/register
 * Registers new emergency vehicle
 */
router.post('/register', validateEmergencyData, async (req, res) => {
  try {
    const { vehicleType, location, destination } = req.body;

    const emergencyVehicle = {
      id: uuidv4(),
      vehicleType: vehicleType.toLowerCase(),
      location,
      destination,
      status: 'registered',
      corridorCleared: [],
      registeredAt: new Date().toISOString()
    };

    global.emergencyVehicles.set(emergencyVehicle.id, emergencyVehicle);
    logger.info(`Emergency vehicle registered: ${emergencyVehicle.id} (${vehicleType})`);

    res.status(201).json({
      success: true,
      data: emergencyVehicle,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error registering emergency vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register emergency vehicle'
    });
  }
});

/**
 * POST /api/emergency/:id/prioritize
 * Creates green corridor for emergency vehicle
 */
router.post('/:id/prioritize', async (req, res) => {
  try {
    const { id } = req.params;
    const { corridorIntersections } = req.body;

    if (!corridorIntersections || !Array.isArray(corridorIntersections) || corridorIntersections.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Corridor intersections array is required'
      });
    }

    const emergencyVehicle = global.emergencyVehicles.get(id);

    if (!emergencyVehicle) {
      return res.status(404).json({
        success: false,
        error: 'Emergency vehicle not found'
      });
    }

    // Coordinate emergency vehicle
    const result = await coordinateEmergencyVehicle(emergencyVehicle, corridorIntersections);

    emergencyVehicle.status = 'prioritized';
    emergencyVehicle.corridorCleared = result.corridorCleared;
    emergencyVehicle.eta = result.eta;
    emergencyVehicle.prioritizedAt = new Date().toISOString();

    logger.info(`Emergency corridor created for vehicle ${id}`);

    res.json({
      success: true,
      data: {
        emergencyVehicleId: id,
        corridorCleared: result.corridorCleared,
        eta: result.eta,
        message: `Green corridor created through ${result.intersectionsCount} intersections`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error prioritizing emergency vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to prioritize emergency vehicle'
    });
  }
});

/**
 * GET /api/emergency/:id
 * Gets emergency vehicle status
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const emergencyVehicle = global.emergencyVehicles.get(id);

    if (!emergencyVehicle) {
      return res.status(404).json({
        success: false,
        error: 'Emergency vehicle not found'
      });
    }

    res.json({
      success: true,
      data: emergencyVehicle,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching emergency vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch emergency vehicle'
    });
  }
});

/**
 * POST /api/emergency/:id/clear
 * Clears emergency corridor, returns to normal
 */
router.post('/:id/clear', async (req, res) => {
  try {
    const { id } = req.params;
    const emergencyVehicle = global.emergencyVehicles.get(id);

    if (!emergencyVehicle) {
      return res.status(404).json({
        success: false,
        error: 'Emergency vehicle not found'
      });
    }

    // Clear corridor
    await clearEmergencyCorridor(id, emergencyVehicle.corridorCleared);

    emergencyVehicle.status = 'completed';
    emergencyVehicle.clearedAt = new Date().toISOString();

    logger.info(`Emergency corridor cleared for vehicle ${id}`);

    res.json({
      success: true,
      message: 'Emergency corridor cleared',
      data: emergencyVehicle,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error clearing emergency corridor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear emergency corridor'
    });
  }
});

/**
 * GET /api/emergency
 * Gets all active emergency vehicles
 */
router.get('/', (req, res) => {
  try {
    const emergencyVehicles = Array.from(global.emergencyVehicles.values())
      .filter(v => v.status !== 'completed');

    res.json({
      success: true,
      data: emergencyVehicles,
      count: emergencyVehicles.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching emergency vehicles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch emergency vehicles'
    });
  }
});

module.exports = router;
