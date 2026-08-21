const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');

/**
 * GET /api/analytics/metrics
 * System-wide metrics
 */
router.get('/metrics', (req, res) => {
  try {
    if (global.analyticsData.length === 0) {
      return res.json({
        success: true,
        data: {
          totalVehicles: 0,
          avgWaitTime: 0,
          avgTravelTime: 0,
          fuelConsumption: 0,
          emissionsSaved: 0,
          optimizationScore: 0
        },
        timestamp: new Date().toISOString()
      });
    }

    const latestData = global.analyticsData[global.analyticsData.length - 1];

    res.json({
      success: true,
      data: latestData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics'
    });
  }
});

/**
 * GET /api/analytics/traffic
 * Traffic analytics
 */
router.get('/traffic', (req, res) => {
  try {
    const data = global.analyticsData.slice(-100); // Last 100 records

    res.json({
      success: true,
      data: data.map(record => ({
        timestamp: record.timestamp,
        totalVehicles: record.totalVehicles,
        avgWaitTime: record.avgWaitTime,
        avgTravelTime: record.avgTravelTime,
        vehicleThroughput: record.vehicleThroughput
      })),
      count: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching traffic analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch traffic analytics'
    });
  }
});

/**
 * GET /api/analytics/efficiency
 * Efficiency metrics
 */
router.get('/efficiency', (req, res) => {
  try {
    const data = global.analyticsData.slice(-100);

    const totalFuelSaved = data.reduce((sum, record) => {
      // Baseline consumption vs actual
      const baseline = 150; // kg per 100 records
      return sum + (baseline - record.fuelConsumption);
    }, 0);

    const totalEmissionsSaved = data.reduce((sum, record) => sum + record.emissionsSaved, 0);

    const avgOptimizationScore = data.length > 0
      ? data.reduce((sum, record) => sum + record.optimizationScore, 0) / data.length
      : 0;

    res.json({
      success: true,
      data: {
        totalFuelSaved: Math.round(totalFuelSaved * 10) / 10,
        totalEmissionsSaved: Math.round(totalEmissionsSaved),
        avgOptimizationScore: Math.round(avgOptimizationScore * 10) / 10,
        environmentalImpact: `${Math.round(totalEmissionsSaved / 1000)} tons of CO2 saved`,
        dataPoints: data.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching efficiency metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch efficiency metrics'
    });
  }
});

/**
 * GET /api/analytics/history
 * Historical data for trend analysis
 */
router.get('/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const data = global.analyticsData.slice(-limit);

    res.json({
      success: true,
      data: data,
      count: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching analytics history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics history'
    });
  }
});

/**
 * GET /api/analytics/trends
 * Traffic trends and patterns
 */
router.get('/trends', (req, res) => {
  try {
    const data = global.analyticsData.slice(-100);

    if (data.length < 2) {
      return res.json({
        success: true,
        data: {
          waitTimeTrend: 'insufficient data',
          emissionsTrend: 'insufficient data',
          efficiencyTrend: 'insufficient data'
        },
        timestamp: new Date().toISOString()
      });
    }

    const oldData = data[0];
    const newData = data[data.length - 1];

    const waitTimeTrend = newData.avgWaitTime < oldData.avgWaitTime ? 'improving' : 'degrading';
    const emissionsTrend = newData.emissionsSaved > oldData.emissionsSaved ? 'improving' : 'degrading';
    const efficiencyTrend = newData.optimizationScore > oldData.optimizationScore ? 'improving' : 'degrading';

    res.json({
      success: true,
      data: {
        waitTimeTrend,
        waitTimeChange: Math.round((newData.avgWaitTime - oldData.avgWaitTime) * 10) / 10,
        emissionsTrend,
        emissionsChange: Math.round((newData.emissionsSaved - oldData.emissionsSaved)),
        efficiencyTrend,
        efficiencyChange: Math.round((newData.optimizationScore - oldData.optimizationScore) * 10) / 10
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends'
    });
  }
});

module.exports = router;
