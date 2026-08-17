import React, { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import StatusIndicator from '../components/StatusIndicator';
import { intersectionsAPI } from '../services/api';

const Intersections = () => {
  const [intersections, setIntersections] = useState([]);
  const [selectedIntersection, setSelectedIntersection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntersections = async () => {
      try {
        setLoading(true);
        const res = await intersectionsAPI.getAll();
        if (res.data.success) {
          setIntersections(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedIntersection(res.data.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching intersections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIntersections();

    // Refresh every 5 seconds
    const interval = setInterval(fetchIntersections, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading">Loading intersections...</div>;
  }

  return (
    <div className="intersections-page">
      <h2>Intersection Management</h2>

      <div className="intersections-layout">
        {/* Left Sidebar - Intersection List */}
        <div className="intersections-list">
          <h3>
            <MapPin size={20} />
            Intersections ({intersections.length})
          </h3>

          <div className="intersection-cards">
            {intersections.map(intersection => (
              <div
                key={intersection.id}
                className={`intersection-card ${selectedIntersection?.id === intersection.id ? 'selected' : ''}`}
                onClick={() => setSelectedIntersection(intersection)}
              >
                <div className="card-header">
                  <strong>{intersection.name.split(' ').slice(0, 2).join(' ')}</strong>
                  <span className={`status-badge ${intersection.status}`}>{intersection.status}</span>
                </div>

                <div className="card-info">
                  <div className="info-item">
                    <span>Vehicles:</span>
                    <strong>{intersection.vehicleCount}</strong>
                  </div>
                  <div className="info-item">
                    <span>Green:</span>
                    <strong>{intersection.greenTime}s</strong>
                  </div>
                </div>

                <div className="efficiency-bar">
                  <div
                    className="efficiency-fill"
                    style={{ width: `${intersection.efficiency}%` }}
                  ></div>
                </div>
                <small>{intersection.efficiency.toFixed(1)}% efficiency</small>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Intersection Details */}
        {selectedIntersection && (
          <div className="intersection-detail">
            <div className="detail-header">
              <h3>{selectedIntersection.name}</h3>
              <StatusIndicator
                status={selectedIntersection.status}
                vehicleCount={selectedIntersection.vehicleCount}
                efficiency={selectedIntersection.efficiency}
              />
            </div>

            {/* Signal Visualization */}
            <div className="signal-visualization">
              <h4>Signal State</h4>
              <div className="traffic-lights">
                <div className="light red">
                  <div className={`bulb ${selectedIntersection.status === 'active' ? '' : 'off'}`}></div>
                  <span>Red: {selectedIntersection.redTime}s</span>
                </div>
                <div className="light yellow">
                  <div className={`bulb ${selectedIntersection.status === 'active' ? '' : 'off'}`}></div>
                  <span>Yellow: {selectedIntersection.yellowTime || 5}s</span>
                </div>
                <div className="light green">
                  <div className={`bulb ${selectedIntersection.status === 'active' ? '' : 'off'}`}></div>
                  <span>Green: {selectedIntersection.greenTime}s</span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="details-grid">
              <div className="detail-box">
                <span>Vehicle Count</span>
                <strong>{selectedIntersection.vehicleCount}</strong>
              </div>
              <div className="detail-box">
                <span>Cycle Duration</span>
                <strong>{selectedIntersection.signalDuration}s</strong>
              </div>
              <div className="detail-box">
                <span>Efficiency Score</span>
                <strong>{selectedIntersection.efficiency.toFixed(1)}%</strong>
              </div>
              <div className="detail-box">
                <span>Status</span>
                <strong style={{ color: '#10b981' }}>{selectedIntersection.status}</strong>
              </div>
            </div>

            {/* Location Info */}
            <div className="location-info">
              <h4>
                <Navigation size={16} />
                Location
              </h4>
              <div className="location-details">
                <div>
                  <span>Latitude:</span>
                  <strong>{selectedIntersection.lat}</strong>
                </div>
                <div>
                  <span>Longitude:</span>
                  <strong>{selectedIntersection.lng}</strong>
                </div>
              </div>
              <a
                href={`https://maps.google.com/?q=${selectedIntersection.lat},${selectedIntersection.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-link"
              >
                View on Google Maps
              </a>
            </div>

            {/* Last Updated */}
            <small className="last-updated">
              Last updated: {new Date(selectedIntersection.lastUpdated).toLocaleTimeString()}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default Intersections;
