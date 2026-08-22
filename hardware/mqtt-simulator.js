#!/usr/bin/env node
/**
 * MQTT Traffic Sensor Simulator
 * Simulates 6 ESP32 sensors sending traffic data via MQTT
 * Also publishes to REST API for redundancy
 */

const mqtt = require('mqtt');
const axios = require('axios');
require('dotenv').config();

// Configuration
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com';
const MQTT_PORT = process.env.MQTT_PORT || 1883;
const API_URL = process.env.API_URL || 'http://localhost:5000';
const UPDATE_INTERVAL = process.env.UPDATE_INTERVAL || 2000; // 2 seconds
const SIMULATION_MODE = process.env.SIMULATION_MODE || 'realistic'; // realistic, random, peak, off-peak

// 6 Chennai Intersections
const INTERSECTIONS = [
  { id: 'CHN-001', name: 'Velachery Junction', location: { lat: 12.9656, lng: 80.2094 } },
  { id: 'CHN-002', name: 'Adyar Signal', location: { lat: 13.0051, lng: 80.2110 } },
  { id: 'CHN-003', name: 'Thiruvanmiyur Signal', location: { lat: 12.9944, lng: 80.2473 } },
  { id: 'CHN-004', name: 'Besant Nagar Signal', location: { lat: 13.0099, lng: 80.2604 } },
  { id: 'CHN-005', name: 'Mylapore Signal', location: { lat: 13.0382, lng: 80.2708 } },
  { id: 'CHN-006', name: 'Triplicane Signal', location: { lat: 13.0559, lng: 80.2807 } }
];

let mqttClient = null;
let simulationRunning = false;
let trafficData = {};

// Initialize traffic data
INTERSECTIONS.forEach(intersection => {
  trafficData[intersection.id] = {
    id: intersection.id,
    name: intersection.name,
    location: intersection.location,
    vehicleCount: 0,
    density: 0,
    congestionLevel: 'low',
    averageSpeed: 40,
    timestamp: new Date()
  };
});

/**
 * Connect to MQTT Broker
 */
function connectMQTT() {
  return new Promise((resolve, reject) => {
    console.log(`🔌 Connecting to MQTT broker: ${MQTT_BROKER}:${MQTT_PORT}`);

    const options = {
      port: MQTT_PORT,
      username: process.env.MQTT_USER || undefined,
      password: process.env.MQTT_PASS || undefined,
      clean: true,
      connectTimeout: 10000,
      reconnectPeriod: 5000,
      clientId: `traffic-simulator-${Date.now()}`
    };

    mqttClient = mqtt.connect(MQTT_BROKER, options);

    mqttClient.on('connect', () => {
      console.log('✅ Connected to MQTT Broker');
      resolve(mqttClient);
    });

    mqttClient.on('error', (error) => {
      console.error('❌ MQTT Connection Error:', error.message);
      reject(error);
    });

    mqttClient.on('reconnect', () => {
      console.log('🔄 Reconnecting to MQTT Broker...');
    });

    setTimeout(() => {
      reject(new Error('MQTT connection timeout'));
    }, 15000);
  });
}

/**
 * Generate realistic traffic data based on time of day
 */
function generateTrafficData(intersectionId) {
  const hour = new Date().getHours();
  let baseDensity = 30; // Base traffic density

  // Peak hours: 7-9 AM (1.5x traffic) and 5-7 PM (1.5x traffic)
  if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19)) {
    baseDensity = 45;
  }
  // Off-peak: 11 PM - 6 AM (0.3x traffic)
  else if (hour >= 23 || hour < 6) {
    baseDensity = 15;
  }

  // Add randomness (±20%)
  const variance = (Math.random() - 0.5) * 40;
  let density = Math.min(100, Math.max(5, baseDensity + variance));

  // Simulate different behaviors for each intersection
  const intersectionVariance = {
    'CHN-001': 1.2,  // Velachery - higher traffic
    'CHN-002': 0.9,  // Adyar - medium traffic
    'CHN-003': 1.0,  // Thiruvanmiyur - normal
    'CHN-004': 0.8,  // Besant Nagar - lower traffic
    'CHN-005': 1.1,  // Mylapore - higher traffic
    'CHN-006': 0.7   // Triplicane - lower traffic
  };

  density *= (intersectionVariance[intersectionId] || 1.0);
  density = Math.min(100, Math.max(5, density));

  // Calculate congestion level
  let congestionLevel = 'low';
  if (density > 75) congestionLevel = 'critical';
  else if (density > 60) congestionLevel = 'high';
  else if (density > 40) congestionLevel = 'medium';

  // Average speed inversely related to density
  const averageSpeed = Math.max(10, 50 - (density * 0.3));

  // Vehicle count (0-150 vehicles)
  const vehicleCount = Math.round((density / 100) * 150);

  return {
    id: intersectionId,
    name: INTERSECTIONS.find(i => i.id === intersectionId)?.name || intersectionId,
    location: INTERSECTIONS.find(i => i.id === intersectionId)?.location,
    vehicleCount,
    density: Math.round(density),
    congestionLevel,
    averageSpeed: Math.round(averageSpeed),
    timestamp: new Date()
  };
}

/**
 * Publish data via MQTT
 */
function publishViaMQTT() {
  INTERSECTIONS.forEach(intersection => {
    const data = generateTrafficData(intersection.id);
    trafficData[intersection.id] = data;

    const topic = `traffic/sensors/${intersection.id}`;
    const payload = JSON.stringify(data);

    mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Failed to publish to ${topic}:`, err.message);
      } else {
        console.log(`📡 Published to ${topic} | Density: ${data.density}% | Vehicles: ${data.vehicleCount} | Level: ${data.congestionLevel}`);
      }
    });
  });
}

/**
 * Publish data via REST API
 */
async function publishViaAPI() {
  try {
    const data = INTERSECTIONS.map(intersection => generateTrafficData(intersection.id));

    const response = await axios.post(`${API_URL}/api/traffic/update`, {
      timestamp: new Date(),
      intersections: data
    }, {
      timeout: 5000
    });

    console.log(`✅ API Update successful | Status: ${response.status}`);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.warn(`⚠️  Backend unavailable at ${API_URL} - using MQTT only`);
    } else {
      console.error(`❌ API Update failed:`, error.message);
    }
  }
}

/**
 * Simulate traffic sensor readings
 */
function startSimulation() {
  if (simulationRunning) {
    console.log('⚠️  Simulation already running');
    return;
  }

  simulationRunning = true;
  console.log(`\n🚀 Starting traffic simulation (${SIMULATION_MODE} mode)`);
  console.log(`📊 Update interval: ${UPDATE_INTERVAL}ms\n`);

  // Publish data at regular intervals
  const publishInterval = setInterval(async () => {
    if (!simulationRunning) {
      clearInterval(publishInterval);
      return;
    }

    try {
      if (mqttClient && mqttClient.connected) {
        publishViaMQTT();
      }
      publishViaAPI();
    } catch (error) {
      console.error('Error during simulation:', error.message);
    }
  }, UPDATE_INTERVAL);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n⏹️  Stopping simulation...');
    simulationRunning = false;
    clearInterval(publishInterval);

    if (mqttClient) {
      mqttClient.end(() => {
        console.log('✅ MQTT connection closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
}

/**
 * Display status dashboard
 */
function displayStatus() {
  if (!simulationRunning) return;

  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        TRAFFIC SENSOR SIMULATION - LIVE DASHBOARD           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  INTERSECTIONS.forEach(intersection => {
    const data = trafficData[intersection.id];
    const densityBar = '█'.repeat(Math.round(data.density / 5)) + '░'.repeat(20 - Math.round(data.density / 5));

    console.log(`📍 ${data.name} (${data.id})`);
    console.log(`   Density:  [${densityBar}] ${data.density}%`);
    console.log(`   Vehicles: ${data.vehicleCount} | Speed: ${data.averageSpeed} km/h | Status: ${data.congestionLevel.toUpperCase()}`);
    console.log();
  });

  console.log(`⏱️  Last update: ${new Date().toLocaleTimeString()}`);
  console.log(`📡 MQTT Broker: ${MQTT_BROKER}`);
  console.log(`🌐 Backend API: ${API_URL}\n`);
}

/**
 * Main initialization
 */
async function init() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         NeuroTransit AI - Hardware Simulator                ║');
  console.log('║         MQTT Traffic Sensor Emulator                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to MQTT
    await connectMQTT();

    // Start simulation
    startSimulation();

    // Display status every 5 seconds
    setInterval(displayStatus, 5000);
    displayStatus(); // Initial display
  } catch (error) {
    console.error('Failed to initialize:', error.message);
    console.log('\n⚠️  MQTT broker unavailable - API-only mode');
    startSimulation(); // Continue with API-only mode
  }
}

// Start the simulator
init();
