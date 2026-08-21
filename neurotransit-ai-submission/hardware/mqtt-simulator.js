const mqtt = require('mqtt');

const broker = process.env.MQTT_BROKER || 'mqtt://test.mosquitto.org';
const client = mqtt.connect(broker);
const intersectionId = process.env.INTERSECTION_ID || 'CHN-001';

client.on('connect', () => {
  console.log(`Connected to ${broker}`);
  setInterval(() => {
    const vehicleCount = Math.floor(Math.random() * 81) + 10;
    client.publish(`traffic/sensors/${intersectionId}`, JSON.stringify({
      intersectionId,
      vehicleCount,
      timestamp: new Date().toISOString()
    }), { qos: 1 });
    console.log(`Published ${vehicleCount} vehicles for ${intersectionId}`);
  }, Number(process.env.SIMULATION_INTERVAL || 5000));
});

client.on('error', (error) => console.error('MQTT simulator error:', error.message));