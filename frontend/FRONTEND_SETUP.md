# NeuroTransit AI - Frontend Quick Start Guide

## 📋 Prerequisites

Before running the frontend, you need:

1. **Node.js v14+** - [Download from nodejs.org](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Backend running** on `http://localhost:5000`

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Node.js

If you don't have Node.js installed:

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download LTS version (v18+ recommended)
3. Run the installer
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install Frontend Dependencies

**Windows (PowerShell/CMD):**
```bash
cd e:\SMARTHON\neurotransit-ai\frontend
npm install
```

**Mac/Linux (Terminal):**
```bash
cd ~/path/to/neurotransit-ai/frontend
npm install
```

This installs all required packages:
- React 18.2.0
- React Router v6
- Recharts 2.7.2
- Axios 1.4.0
- Lucide React 0.263.0
- Tailwind CSS 3.3.0

### Step 3: Start Development Server

**Windows:**
```bash
npm start
```

**Mac/Linux:**
```bash
npm start
```

The frontend will automatically open at **http://localhost:3000** 🎉

---

## 📁 Frontend Structure

```
frontend/
├── public/
│   └── index.html              # HTML entry point
├── src/
│   ├── index.js                # React entry point
│   ├── App.js                  # Main App component
│   ├── App.css                 # Global styles (1200+ lines)
│   ├── pages/                  # Page components
│   │   ├── Dashboard.js        # KPI cards & charts
│   │   ├── Intersections.js    # Intersection management
│   │   └── Analytics.js        # Analytics & insights
│   ├── components/             # Reusable components
│   │   ├── Header.js           # Navigation header
│   │   ├── KPICard.js          # KPI card
│   │   ├── Chart.js            # Recharts wrapper
│   │   └── StatusIndicator.js  # Status component
│   ├── hooks/                  # Custom React hooks
│   │   └── useAPI.js           # API call hook
│   ├── services/               # API client
│   │   └── api.js              # Axios configuration
│   └── styles/                 # Additional styles
├── package.json                # Dependencies
├── SETUP.bat                   # Windows setup script
└── setup.sh                    # Mac/Linux setup script
```

---

## 🌐 Pages Overview

### 1. **Dashboard** (/)
- Real-time KPI cards
  - Total Vehicles
  - Average Wait Time
  - Emissions Saved
  - Fuel Saved
- Live traffic trend charts
- System status panel
- Updates every 5 seconds

### 2. **Intersections** (/intersections)
- List of all intersections with:
  - Name and status
  - Vehicle count
  - Efficiency score
- Detailed view panel:
  - Signal visualization (Red/Yellow/Green lights)
  - Location coordinates
  - Google Maps link
  - Real-time performance metrics
- Click intersection to view details

### 3. **Analytics** (/analytics)
- 4 analytics KPI cards
  - Average wait time with trend
  - Emissions reduction
  - Fuel efficiency
  - Optimization score
- Multiple charts:
  - Vehicle count trend
  - Wait time reduction
  - Optimization score over time
- Environmental impact insights
- Network optimization details

---

## 🎨 Styling Features

✅ Dark mode theme (professional blues, greens, grays)  
✅ Fully responsive (320px to 2560px)  
✅ Mobile-first design  
✅ Smooth animations and transitions  
✅ Color-coded status indicators  
✅ Custom scrollbar styling  
✅ Gradient backgrounds  
✅ Professional shadows and rounded corners  

---

## 🔧 Environment Configuration

Create `.env` file in frontend folder:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

This tells the frontend where to find the backend API.

---

## 🖥️ Backend Requirements

The frontend needs the backend running. In another terminal:

```bash
cd e:\SMARTHON\neurotransit-ai\backend
npm install
npm run dev
```

Backend runs on **http://localhost:5000**

---

## 📡 Real-Time Features

- ✅ Data updates every 5 seconds
- ✅ Live traffic trends
- ✅ Real-time KPI updates
- ✅ Intersection status changes
- ✅ Emergency vehicle tracking
- ✅ Analytics calculations

---

## 🚨 Troubleshooting

### Issue: "npm command not found"
```
Solution: Node.js not installed or not in PATH
1. Install Node.js from https://nodejs.org/
2. Restart your terminal
3. Run: npm install
```

### Issue: "Cannot connect to backend"
```
Solution: Backend not running
1. Open new terminal
2. cd e:\SMARTHON\neurotransit-ai\backend
3. npm run dev
4. Verify running on http://localhost:5000
```

### Issue: "Port 3000 already in use"
```
Solution: Another process using port 3000
Option 1: Kill the process on port 3000
Option 2: Change port: PORT=3001 npm start
```

### Issue: "Module not found"
```
Solution: Dependencies not installed
1. Delete node_modules folder
2. Delete package-lock.json
3. Run: npm install
4. Run: npm start
```

### Issue: "Blank page or errors in console"
```
Solution: Check backend connection
1. Verify backend is running
2. Check REACT_APP_API_URL in .env
3. Open DevTools (F12) and check Console tab
4. Check Network tab for failed API requests
```

---

## 📦 Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject (⚠️ cannot be undone)
npm eject
```

---

## 🌐 Access Frontend

Once running, access at:
- **Local**: http://localhost:3000
- **Network**: http://YOUR_IP:3000
- **Production**: Deployed URL on Vercel

---

## 📊 Component Hierarchy

```
App (main component with routing)
├── Header (navigation & status)
├── Navigation Tabs (Dashboard/Intersections/Analytics)
└── Pages (routed content)
    ├── Dashboard
    │   ├── KPICard x4
    │   └── Chart x1
    ├── Intersections
    │   ├── Intersection List
    │   └── Intersection Detail
    │       ├── StatusIndicator
    │       └── Signal Visualization
    └── Analytics
        ├── KPICard x4
        ├── Chart x2
        ├── ImpactCard
        └── InsightsCard
```

---

## 🎯 Features Implemented

- ✅ React Router for navigation
- ✅ Axios for API calls
- ✅ Recharts for data visualization
- ✅ Real-time data updates (5s interval)
- ✅ Error handling & loading states
- ✅ Responsive CSS Grid layouts
- ✅ Dark mode theme
- ✅ Custom React hooks
- ✅ Environment configuration
- ✅ Professional UI/UX design

---

## 📝 Next Steps

1. **Install Node.js** if not already installed
2. **Run setup script** (SETUP.bat or setup.sh)
3. **Start backend** in separate terminal
4. **Access dashboard** at http://localhost:3000
5. **Explore the UI** and real-time features

---

## 🎬 Demo Features

Once running, you can:
- ✅ View live traffic data
- ✅ Monitor all intersections
- ✅ Track emergency vehicles
- ✅ See real-time analytics
- ✅ View traffic trends
- ✅ Check system health
- ✅ Monitor environmental impact

---

**Ready to launch?** Run your setup script now! 🚀

For issues, check the troubleshooting section above.
