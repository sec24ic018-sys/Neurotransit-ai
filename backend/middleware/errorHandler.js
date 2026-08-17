const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`Error [${status}]: ${message}`, err);

  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = errorHandler;
