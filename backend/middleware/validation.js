/**
 * Input validation middleware
 */

const validateIntersectionId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Intersection ID is required'
    });
  }

  if (!global.intersections.has(id)) {
    return res.status(404).json({
      success: false,
      error: 'Intersection not found',
      id
    });
  }

  next();
};

const validateTrafficData = (req, res, next) => {
  const { vehicleCount } = req.body;

  if (vehicleCount === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Vehicle count is required'
    });
  }

  if (typeof vehicleCount !== 'number' || vehicleCount < 0 || vehicleCount > 1000) {
    return res.status(400).json({
      success: false,
      error: 'Vehicle count must be a number between 0 and 1000'
    });
  }

  next();
};

const validateEmergencyData = (req, res, next) => {
  const { vehicleType, location, destination } = req.body;

  if (!vehicleType || !location || !destination) {
    return res.status(400).json({
      success: false,
      error: 'Vehicle type, location, and destination are required'
    });
  }

  if (!['ambulance', 'firetruck', 'police'].includes(vehicleType.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid vehicle type. Must be ambulance, firetruck, or police'
    });
  }

  next();
};

module.exports = {
  validateIntersectionId,
  validateTrafficData,
  validateEmergencyData
};
