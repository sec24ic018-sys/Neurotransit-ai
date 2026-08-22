import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Activity, MapPin, BarChart3 } from 'lucide-react';

import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Intersections from './pages/Intersections';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />

        <div className="navigation-tabs">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          >
            <Activity size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/intersections"
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          >
            <MapPin size={20} />
            <span>Intersections</span>
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </NavLink>
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
