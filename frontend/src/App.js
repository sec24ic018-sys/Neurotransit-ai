import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Activity, MapPin, BarChart3, Radio, Clock, Leaf, Zap } from 'lucide-react';

import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Intersections from './pages/Intersections';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Router>
      <div className="app-container">
        <Header />

        <div className="navigation-tabs">
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Activity size={20} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'intersections' ? 'active' : ''}`}
            onClick={() => setActiveTab('intersections')}
          >
            <MapPin size={20} />
            <span>Intersections</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </button>
        </div>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/intersections" element={<Intersections />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
