const mqtt = require('mqtt');
const { logger } = require('../utils/logger');

let client = null;

async function initMQTT() {
  try {
    const brokerURL = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com';
    const options = {
      port: process.env.MQTT_PORT || 1883,
      username: process.env.MQTT_USER || undefined,
      password: process.env.MQTT_PASS || undefined,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 10000,
      clientId: `neurotransit-ai-${Date.now()}`
    };

    client = mqtt.connect(brokerURL, options);

    client.on('connect', () => {
      logger.info('Connected to MQTT Broker');
      // Subscribe to traffic sensor data
      client.subscribe('traffic/sensors/+', (err) => {
        if (!err) logger.info('Subscribed to traffic/sensors/+');
      });
      // Subscribe to emergency vehicle signals
      client.subscribe('emergency/vehicles/+', (err) => {
        if (!err) logger.info('Subscribed to emergency/vehicles/+');
      });
    });

    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        logger.info(`Received message on ${topic}:`, data);
        // Handle incoming messages if needed
      } catch (error) {
        logger.error(`Error parsing MQTT message: ${error.message}`);
      }
    });

    client.on('error', (error) => {
      // Only log connection errors at debug level to avoid log spam
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
        logger.debug(`MQTT Connection Error (${error.code}): Retrying...`);
      } else {
        logger.error('MQTT Error:', error);
      }
    });

    client.on('reconnect', () => {
      logger.debug('Attempting to reconnect to MQTT Broker...');
    });

  } catch (error) {
    logger.error('MQTT Initialization Error:', error);
    throw error;
  }
}

function publishMessage(topic, data) {
  if (client && client.connected) {
    client.publish(topic, JSON.stringify(data), { qos: 1 }, (err) => {
      if (err) {
        logger.error(`Error publishing to ${topic}:`, err);
      } else {
        logger.debug(`Published to ${topic}`);
      }
    });
  }
}

function subscribe(topic, callback) {
  if (client) {
    client.subscribe(topic, (err) => {
      if (!err) {
        logger.info(`Subscribed to ${topic}`);
        if (callback) callback();
      }
    });
  }
}

function isConnected() {
  return client && client.connected;
}

module.exports = {
  initMQTT,
  publishMessage,
  subscribe,
  isConnected,
  getClient: () => client
};
