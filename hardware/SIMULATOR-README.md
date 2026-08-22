# NeuroTransit AI - Hardware Simulator Documentation

Complete documentation for the MQTT-based traffic sensor simulator and visualization dashboard.

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Simulator](#running-the-simulator)
6. [Visualization Dashboard](#visualization-dashboard)
7. [Data Format](#data-format)
8. [Integration](#integration)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Hardware Simulator replicates **6 ESP32 traffic sensors** at Chennai intersections. It:

- ✅ Publishes vehicle density data every 2 seconds via MQTT
- ✅ Falls back to REST API if MQTT unavailable
- ✅ Simulates realistic traffic patterns based on time of day
- ✅ Integrates seamlessly with your Express.js backend
- ✅ Provides real-time p5.js visualization dashboard

### Key Features

| Feature | Description |
|---------|-------------|
| **MQTT Publishing** | Publishes to `traffic/sensors/{INTERSECTION_ID}` |
| **REST API** | Posts to `/api/traffic/update` endpoint |
| **Realistic Simulation** | Peak hours (7-9 AM, 5-7 PM) have 1.5x traffic |
| **6 Intersections** | Velachery, Adyar, Thiruvanmiyur, Besant Nagar, Mylapore, Triplicane |
| **Real-time Dashboard** | p5.js visualization with live updates |

---

## Architecture

### Data Flow Diagram

```
┌──────────────────────────┐
│  mqtt-simulator.js       │
│  (Node.js Process)       │
└──────────┬───────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
 MQTT Topic    REST API
 (QoS: 1)      (POST)
    │             │
    └──────┬──────┘
           │
    ┌──────▼────────────┐
    │ Express.js Backend│
    │ (Port 5000)       │
    └──────┬────────────┘
           │
    ┌──────▼──────────────────┐
    │ React Frontend           │
    │ + p5.js Visualizer       │
    └──────────────────────────┘
```

### Component Details

| Component | Purpose | Technology |
|-----------|---------|-----------|
| **Simulator** | Generates traffic data | Node.js, MQTT, Axios |
| **Backend** | Stores & serves data | Express.js |
| **Visualizer** | Displays traffic | p5.js, Canvas |
| **MQTT Broker** | Message transport | HiveMQ (cloud) |

---

## Installation

### Prerequisites
- Node.js 14.0.0 or higher
- npm 6.0.0 or higher
- Running NeuroTransit AI backend

### Step-by-Step Installation

```bash
# 1. Clone or navigate to the project
cd Neurotransit-ai/hardware

# 2. Install dependencies
npm install

# 3. Create environment configuration
cp .env.example .env

# 4. Edit .env if needed (optional)
# nano .env  # or open in editor
```

### Dependencies Installed

```json
{
  "mqtt": "^5.0.0",        // MQTT client library
  "axios": "^1.4.0",       // HTTP client for REST API
  "dotenv": "^16.0.3"      // Environment variable loader
}
```

---

## Configuration

### Environment Variables (.env)

```bash
# MQTT Broker Settings
MQTT_BROKER=mqtt://broker.hivemq.com
MQTT_PORT=1883
MQTT_USER=                # Leave empty for anonymous
MQTT_PASS=                # Leave empty for anonymous

# Backend API
API_URL=http://localhost:5000

# Simulation
UPDATE_INTERVAL=2000      # Milliseconds between updates
SIMULATION_MODE=realistic # realistic, random, peak, off-peak
```

### Configuration Examples

#### Using Local MQTT Broker
```bash
MQTT_BROKER=mqtt://localhost
MQTT_PORT=1883
MQTT_USER=admin
MQTT_PASS=password123
```

#### High-Frequency Updates
```bash
UPDATE_INTERVAL=500       # Updates every 500ms
```

#### Peak Hour Simulation
```bash
SIMULATION_MODE=peak      # Always simulate peak traffic
```

---

## Running the Simulator

### Start in Production Mode
```bash
npm start
```

### Start in Development Mode (with auto-reload)
```bash
npm run dev
```

### Expected Output

```
╔════════════════════════════════════════════════════════════╗
║         NeuroTransit AI - Hardware Simulator                ║
║         MQTT Traffic Sensor Emulator                        ║
╚════════════════════════════════════════════════════════════╝

🔌 Connecting to MQTT broker: mqtt://broker.hivemq.com:1883
✅ Connected to MQTT Broker
🚀 Starting traffic simulation (realistic mode)
📊 Update interval: 2000ms

📡 Published to traffic/sensors/CHN-001 | Density: 45% | Vehicles: 67 | Level: medium
📡 Published to traffic/sensors/CHN-002 | Density: 32% | Vehicles: 48 | Level: low
...
```

### Terminal Dashboard

The simulator displays a live dashboard every 5 seconds:

```
╔════════════════════════════════════════════════════════════╗
║        TRAFFIC SENSOR SIMULATION - LIVE DASHBOARD           ║
╚════════════════════════════════════════════════════════════╝

📍 Velachery Junction (CHN-001)
   Density:  [█████████████████████] 45%
   Vehicles: 67 | Speed: 28 km/h | Status: MEDIUM

📍 Adyar Signal (CHN-002)
   Density:  [███████████░░░░░░░░░░] 32%
   Vehicles: 48 | Speed: 35 km/h | Status: LOW

...

⏱️  Last update: 14:32:45
📡 MQTT Broker: mqtt://broker.hivemq.com
🌐 Backend API: http://localhost:5000
```

### Graceful Shutdown
Press `Ctrl+C` to stop the simulator gracefully.

---

## Visualization Dashboard

### Opening the Dashboard

1. Open `traffic-visualizer.html` in any modern web browser
2. Or run a local web server:
   ```bash
   python -m http.server 8000
   # Then visit http://localhost:8000/traffic-visualizer.html
   ```

### Dashboard Components

#### Main Canvas (Center)
- **6 Circles** = 6 traffic intersections
- **Circle Size** = Traffic density (0-100%)
- **Circle Color**:
  - 🟢 Green: Low congestion (0-40%)
  - 🟠 Orange: Medium congestion (40-60%)
  - 🟠 Dark Orange: High congestion (60-75%)
  - 🔴 Red: Critical congestion (75-100%)

#### Sidebar (Left)
- **Intersection List** with live statistics
- **Click to select** an intersection for highlighting
- **Real-time updates** every 2 seconds
- **Stats shown**:
  - Vehicle count
  - Density percentage
  - Average speed (km/h)
  - Congestion status

#### Controls (Top Right)
- **API Endpoint**: Change backend URL (default: localhost:5000)
- **Update Interval**: Control refresh rate (500-10000 ms)
- **Start/Stop Button**: Toggle simulation
- **Status Indicator**: Connection status

#### Legend (Bottom Left)
- Color coding for congestion levels
- Easy reference for data interpretation

#### Status (Bottom Right)
- Last update timestamp
- Helps verify real-time updates

### Interacting with Dashboard

```javascript
// Click an intersection in sidebar to highlight it on canvas
// The circle will display a selection ring

// Change API endpoint:
1. Edit the "API Endpoint" field (top right)
2. Press Enter or click outside the field
3. Data will refresh from new endpoint

// Adjust update speed:
1. Change "Update Interval (ms)" value
2. Lower = faster updates, higher = less network traffic

// Pause/Resume:
1. Click the "Stop" button to pause
2. Click "Start" to resume
```

---

## Data Format

### MQTT Message Format

**Topic**: `traffic/sensors/{INTERSECTION_ID}`

```json
{
  "id": "CHN-001",
  "name": "Velachery Junction",
  "location": {
    "lat": 12.9656,
    "lng": 80.2094
  },
  "vehicleCount": 67,
  "density": 45,
  "congestionLevel": "medium",
  "averageSpeed": 28,
  "timestamp": "2026-08-22T14:32:45.123Z"
}
```

### REST API Request Format

**Endpoint**: `POST /api/traffic/update`

```json
{
  "timestamp": "2026-08-22T14:32:45.123Z",
  "intersections": [
    {
      "id": "CHN-001",
      "name": "Velachery Junction",
      "location": { "lat": 12.9656, "lng": 80.2094 },
      "vehicleCount": 67,
      "density": 45,
      "congestionLevel": "medium",
      "averageSpeed": 28,
      "timestamp": "2026-08-22T14:32:45.123Z"
    },
    // ... more intersections
  ]
}
```

### Congestion Levels

| Level | Density Range | Speed Impact | Color |
|-------|---------------|--------------|-------|
| low | 0-40% | Normal (40+ km/h) | 🟢 Green |
| medium | 40-60% | Moderate (25-40 km/h) | 🟠 Orange |
| high | 60-75% | Slow (15-25 km/h) | 🟠 Dark Orange |
| critical | 75-100% | Very Slow (<15 km/h) | 🔴 Red |

---

## Integration

### Required Backend Endpoints

Your Express.js backend **must** have these endpoints:

#### 1. Get All Intersections
```javascript
/**
 * GET /api/intersections
 * Returns array of all intersections with current traffic data
 * 
 * Response:
 * [
 *   {
 *     id: "CHN-001",
 *     name: "Velachery Junction",
 *     vehicleCount: 67,
 *     density: 45,
 *     congestionLevel: "medium",
 *     averageSpeed: 28,
 *     timestamp: "2026-08-22T14:32:45.123Z"
 *   },
 *   ...
 * ]
 */
```

#### 2. Get Specific Intersection
```javascript
/**
 * GET /api/intersections/:id
 * Returns specific intersection data
 */
```

#### 3. Update Traffic Data (Optional, for REST API mode)
```javascript
/**
 * POST /api/traffic/update
 * Receives traffic data from simulator
 * 
 * Request Body:
 * {
 *   timestamp: "2026-08-22T14:32:45.123Z",
 *   intersections: [...]
 * }
 */
```

### Implementation Example

Add to your `backend/routes/traffic.js`:

```javascript
const express = require('express');
const router = express.Router();

// Store traffic data in memory (replace with database in production)
let trafficData = {};

// POST - Receive traffic updates from simulator
router.post('/update', (req, res) => {
  const { timestamp, intersections } = req.body;
  
  // Store or process the data
  intersections.forEach(intersection => {
    trafficData[intersection.id] = intersection;
  });
  
  res.json({ success: true, processed: intersections.length });
});

// GET - Return all intersections
router.get('/intersections', (req, res) => {
  res.json(Object.values(trafficData));
});

// GET - Return specific intersection
router.get('/intersections/:id', (req, res) => {
  const data = trafficData[req.params.id];
  if (!data) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

module.exports = router;
```

### Wiring in Server

```javascript
// In backend/server.js
const trafficRoutes = require('./routes/traffic');
app.use('/api/traffic', trafficRoutes);
```

---

## Troubleshooting

### Problem: MQTT Connection Timeout

**Error Message**:
```
MQTT Error: Error: connect ETIMEDOUT
```

**Solution**:
1. Check internet connection
2. Try different MQTT broker in `.env`:
   ```bash
   MQTT_BROKER=mqtt://test.mosquitto.org
   ```
3. Use API-only mode (simulator continues with REST API)

### Problem: Visualizer Shows "Connecting..."

**Cause**: Backend API not responding

**Solutions**:
1. Verify backend is running: `npm start` (in root directory)
2. Check API endpoint in visualizer (top right)
3. Ensure endpoint matches (e.g., `http://localhost:5000`)

### Problem: No Data Updates in Terminal

**Cause**: Backend might be offline, falling back to API-only

**Check**:
1. MQTT connection status in output
2. Verify backend is reachable:
   ```bash
   curl http://localhost:5000/api/intersections
   ```

### Problem: High CPU Usage

**Solution**: Increase `UPDATE_INTERVAL` in `.env`:
```bash
UPDATE_INTERVAL=5000  # Update every 5 seconds instead of 2
```

### Problem: "Cannot find module 'mqtt'"

**Solution**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## For Demo Day

### Recording Your Demo

**Script**:
> "The MQTT Simulator replicates 6 ESP32 traffic sensors at Chennai intersections. You can see in the terminal the MQTT messages being published with live density data, and in the browser, the p5.js visualizer displays this in real-time. When we deploy with actual ESP32 hardware, the data flow remains identical—the simulator gets replaced with Arduino firmware."

**Demo Steps**:
1. Show simulator running in terminal
2. Point out MQTT messages with density, vehicle count
3. Open `traffic-visualizer.html` in browser
4. Explain: circle size = density, color = congestion
5. Show live updates every 2 seconds
6. Discuss how this scales to real hardware

### GitHub Submission

Push these files to your repository:
```
hardware/
├── mqtt-simulator.js          # Core simulator
├── traffic-visualizer.html    # Dashboard
├── package.json               # Dependencies
├── .env.example               # Configuration template
├── mosquitto.conf             # MQTT broker config
├── QUICK-START.md             # This quick start
├── SIMULATOR-README.md        # This documentation
└── README.md                  # Hardware setup guide
```

---

## Advanced Usage

### Running Local MQTT Broker with Docker

```bash
docker run -d --name mosquitto -p 1883:1883 -p 9001:9001 eclipse-mosquitto:latest
```

Then update `.env`:
```bash
MQTT_BROKER=mqtt://localhost
```

### Custom Simulation Patterns

Modify `generateTrafficData()` in `mqtt-simulator.js`:

```javascript
// Add your custom pattern
if (SIMULATION_MODE === 'custom') {
  // Your logic here
}
```

### Connecting Real ESP32 Hardware

Replace this simulator with your actual ESP32 firmware:
```c
// esp32-main.ino
#include <PubSubClient.h>

// Publish to same MQTT topics: traffic/sensors/{ID}
// Same message format as simulator
client.publish("traffic/sensors/CHN-001", payload);
```

---

## Performance Notes

- **Network Usage**: ~1-2 KB per update × 6 intersections × 0.5 Hz = ~6 KB/s
- **CPU Usage**: <1% on modern hardware
- **Memory**: ~30-50 MB Node.js process
- **Latency**: MQTT <100ms, REST API <200ms

---

## Support & Issues

For issues or questions:
1. Check this documentation
2. Review `QUICK-START.md`
3. Check browser console (F12) for errors
4. Verify backend is running
5. Check `.env` configuration

---

**Happy simulating! 🚗💨**
