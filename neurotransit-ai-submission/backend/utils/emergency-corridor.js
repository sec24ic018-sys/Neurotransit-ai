/**
 * Emergency Corridor Management
 * Handles priority signal setup for emergency vehicles
 */

const { publishMessage } = require('../config/mqtt');
const { logger } = require('./logger');

/**
 * Coordinate emergency vehicle through intersection corridor
 */
async function coordinateEmergencyVehicle(emergencyVehicle, intersectionPath) {
  try {
    const corridorCleared = [];
    
    // Set all intersections in path to emergency mode (extended green)
    for (const intersectionId of intersectionPath) {
      const intersection = global.intersections.get(intersectionId);
      
      if (intersection) {
        // Extend green time for emergency corridor
        intersection.greenTime = 55; // Maximum green time for emergency
        intersection.redTime = 5;
        intersection.emergencyMode = true;
        intersection.emergencyVehicleId = emergencyVehicle.id;
        intersection.lastUpdated = new Date().toISOString();

        // Publish emergency signal via MQTT
        await publishMessage(`signals/emergency/${intersectionId}`, {
          intersectionId,
          emergencyVehicleId: emergencyVehicle.id,
          greenTime: 55,
          mode: 'emergency',
          priority: 'high',
          timestamp: new Date().toISOString()
        });

        corridorCleared.push(intersectionId);
        logger.info(`Emergency corridor established at ${intersectionId} for vehicle ${emergencyVehicle.id}`);
      }
    }

    // Calculate ETA (simplified calculation)
    const distanceBetweenIntersections = 2; // km
    const averageSpeed = 20; // km/h during traffic
    const emergencySpeed = 35; // km/h with corridor
    const numIntersections = intersectionPath.length;
    const totalDistance = numIntersections * distanceBetweenIntersections;
    const eta = (totalDistance / emergencySpeed) * 60; // minutes

    logger.info(`Emergency corridor cleared for ${emergencyVehicle.vehicleType}. ETA: ${eta.toFixed(1)} minutes`);

    return {
      success: true,
      corridorCleared,
      eta: Math.round(eta * 10) / 10,
      intersectionsCount: corridorCleared.length,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Emergency corridor coordination error:', error);
    throw error;
  }
}

/**
 * Clear emergency corridor when vehicle passes
 */
async function clearEmergencyCorridor(emergencyVehicleId, intersectionPath) {
  try {
    for (const intersectionId of intersectionPath) {
      const intersection = global.intersections.get(intersectionId);
      
      if (intersection && intersection.emergencyVehicleId === emergencyVehicleId) {
        // Reset to normal operation
        intersection.emergencyMode = false;
        intersection.emergencyVehicleId = null;
        intersection.greenTime = 25;
        intersection.redTime = 35;
        intersection.lastUpdated = new Date().toISOString();

        // Publish normal signal via MQTT
        await publishMessage(`signals/control/${intersectionId}`, {
          intersectionId,
          mode: 'normal',
          greenTime: 25,
          redTime: 35,
          timestamp: new Date().toISOString()
        });

        logger.info(`Emergency corridor cleared at ${intersectionId}`);
      }
    }

    return {
      success: true,
      clearedIntersections: intersectionPath,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Error clearing emergency corridor:', error);
    throw error;
  }
}

/**
 * Find optimal path through intersections for emergency vehicle
 */
function findOptimalPath(startIntersectionId, endIntersectionId) {
  // Simplified path finding - in production use A* or Dijkstra
  const allIntersections = Array.from(global.intersections.keys());
  
  // For now, return all intersections as path
  // In production, implement proper routing algorithm
  return allIntersections;
}

module.exports = {
  coordinateEmergencyVehicle,
  clearEmergencyCorridor,
  findOptimalPath
};
