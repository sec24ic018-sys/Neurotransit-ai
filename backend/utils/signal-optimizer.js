/**
 * Signal Optimization Algorithm
 * Dynamically adjusts traffic signal timing based on vehicle density
 */

function optimizeSignal(vehicleCount, maxVehicles = 100) {
  // Calculate density ratio (0 to 1)
  const densityRatio = Math.min(vehicleCount / maxVehicles, 1.0);

  // Base timing values
  const baseGreenTime = 25; // seconds
  const maxGreenTime = 50; // seconds
  const minGreenTime = 15; // seconds
  const baseCycleTime = 60; // seconds

  // Calculate optimized green time
  // More vehicles = longer green time
  const greenTimeIncrease = (densityRatio * (maxGreenTime - baseGreenTime));
  let optimizedGreenTime = baseGreenTime + greenTimeIncrease;
  optimizedGreenTime = Math.max(minGreenTime, Math.min(optimizedGreenTime, maxGreenTime));

  // Yellow time (fixed)
  const yellowTime = 5;

  // Calculate red time
  const redTime = baseCycleTime - optimizedGreenTime - yellowTime;

  return {
    vehicleCount,
    densityRatio: Math.round(densityRatio * 100) / 100,
    greenTime: Math.round(optimizedGreenTime),
    yellowTime,
    redTime: Math.round(redTime),
    signalDuration: baseCycleTime
  };
}

/**
 * Calculate efficiency score based on various metrics
 */
function calculateEfficiency(vehicleCount, greenTime, redTime) {
  // Vehicles passed per second of green time
  const throughput = (vehicleCount / 100) * 100;
  
  // Optimal efficiency when vehicles pass at good rate
  const idealVehiclesPerSecond = 2;
  const actualVehiclesPerSecond = vehicleCount / greenTime;
  
  // Calculate efficiency (0-100)
  const efficiency = Math.min(100, (actualVehiclesPerSecond / idealVehiclesPerSecond) * 100);
  
  return Math.round(efficiency * 10) / 10;
}

/**
 * Predict wait time for vehicles at an intersection
 */
function predictWaitTime(vehicleCount, greenTime, redTime) {
  // Average wait time during red phase
  const avgWaitDuringRed = (redTime / 2) * 1000; // convert to ms
  
  // Queue clearance time
  const vehicleClearanceTime = (vehicleCount / 10) * 1000; // assume 10 vehicles per second
  
  // Total predicted wait
  const predictedWait = Math.min(avgWaitDuringRed, vehicleClearanceTime);
  
  return Math.round(predictedWait / 100) / 10; // convert back to seconds
}

/**
 * Calculate emissions savings based on reduced wait time
 */
function calculateEmissionsSavings(vehicleCount, avgWaitTime) {
  // CO2 emissions per vehicle per second of idling: ~0.048 kg
  const emissionPerVehiclePerSecond = 0.048;
  
  // Baseline wait time (without optimization)
  const baselineWaitTime = 45; // seconds
  
  // Time saved
  const timeSaved = Math.max(0, baselineWaitTime - avgWaitTime);
  
  // Total emissions saved in kg
  const emissionsSaved = vehicleCount * emissionPerVehiclePerSecond * timeSaved;
  
  return Math.round(emissionsSaved * 100) / 100;
}

module.exports = {
  optimizeSignal,
  calculateEfficiency,
  predictWaitTime,
  calculateEmissionsSavings
};
