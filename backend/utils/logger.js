// Simple logging utility
const logLevel = process.env.LOG_LEVEL || 'info';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLevel = levels[logLevel] || levels.info;

function log(level, message, data = '') {
  if (levels[level] <= currentLevel) {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase();
    
    if (data) {
      console.log(`[${timestamp}] ${levelUpper}: ${message}`, data);
    } else {
      console.log(`[${timestamp}] ${levelUpper}: ${message}`);
    }
  }
}

const logger = {
  error: (message, data) => log('error', message, data),
  warn: (message, data) => log('warn', message, data),
  info: (message, data) => log('info', message, data),
  debug: (message, data) => log('debug', message, data)
};

module.exports = { logger };
