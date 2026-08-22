# 🚀 Hardware Simulator - Quick Start Guide

**Get the traffic simulator running in 3 minutes!**

## Prerequisites
- Node.js 14+ installed
- Access to your NeuroTransit AI backend (running on port 5000)
- Modern web browser (Chrome, Edge, Firefox)

## Quick Setup

### Step 1: Navigate to Hardware Directory
```bash
cd hardware
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure (Optional)
Create a `.env` file from the template:
```bash
cp .env.example .env
```

Edit `.env` if your backend is on a different URL or port.

### Step 4: Start the Simulator
```bash
npm start
```

You should see output like:
```
🔌 Connecting to MQTT broker: mqtt://broker.hivemq.com:1883
✅ Connected to MQTT Broker
🚀 Starting traffic simulation (realistic mode)
📊 Update interval: 2000ms
```

### Step 5: Open the Visualizer
1. Open `traffic-visualizer.html` in your web browser
2. Click the **▶ Start** button in the top right
3. Watch the real-time traffic visualization!

## What You'll See

**Terminal (Simulator)**
- MQTT messages being published every 2 seconds
- Vehicle density data for all 6 intersections
- Current congestion levels

**Browser (Visualizer)**
- 6 circles representing intersections
- Circle size = traffic density
- Circle color = congestion level (🟢 low → 🔴 critical)
- Live sidebar with intersection statistics

## Configuration Options

Edit `.env` to customize:

```env
# Use a different MQTT broker
MQTT_BROKER=mqtt://test.mosquitto.org

# Change update frequency (in milliseconds)
UPDATE_INTERVAL=1000

# Point to your backend
API_URL=http://localhost:5000

# Simulation patterns: realistic, random, peak, off-peak
SIMULATION_MODE=realistic
```

## Simulation Modes

- **realistic** (default) - Simulates real traffic patterns based on time of day
- **random** - Random traffic values
- **peak** - Simulates peak hour traffic (60-100% density)
- **off-peak** - Simulates off-peak traffic (5-20% density)

## Troubleshooting

### MQTT Connection Fails
✅ **This is normal!** The simulator falls back to REST API
- Check that your backend is running on the configured API_URL
- For MQTT only, set up a local broker or use test.mosquitto.org

### No Data in Visualizer
- Check that the API endpoint is correct (top-right controls)
- Verify backend `/api/intersections` endpoint is working
- Check browser console for errors (F12)

### Slow Updates
- Reduce UPDATE_INTERVAL in .env (default: 2000ms)
- Or use the browser controls to adjust

## Next Steps

1. ✅ Simulator running
2. ✅ Visualizer displaying data
3. 📹 **Record your demo video** showing:
   - Terminal with MQTT messages
   - Browser with live visualization
   - Explain the data flow to judges
4. 📤 Push to GitHub
5. 🎯 Submit to SmartAIthon

## API Endpoints Required

Make sure your Express.js backend has these endpoints:

```javascript
// GET intersections data
GET /api/intersections

// GET specific intersection
GET /api/intersections/:id

// POST traffic updates (optional, for REST API mode)
POST /api/traffic/update
```

See `backend-endpoints-required.js` for implementation details.

## Need Help?

Check `SIMULATOR-README.md` for detailed documentation.

---

**Good luck with your SmartAIthon submission! 🏆**
