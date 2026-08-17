import React, { useState, useEffect } from 'react';
import { Radio, Clock, Leaf, Zap } from 'lucide-react';
import KPICard from '../components/KPICard';
import Chart from '../components/Chart';
import { analyticsAPI, healthAPI } from '../services/api';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [trafficTrends, setTrafficTrends] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch metrics
        const metricsRes = await analyticsAPI.getMetrics();
        if (metricsRes.data.success) {
          setMetrics(metricsRes.data.data);
        }

        // Fetch traffic trends
        const trafficRes = await analyticsAPI.getTraffic();
        if (trafficRes.data.success) {
          const formattedData = trafficRes.data.data.map(item => ({
            timestamp: new Date(item.timestamp).toLocaleTimeString(),
            'Wait Time': item.avgWaitTime,
            'Travel Time': item.avgTravelTime
          }));
          setTrafficTrends(formattedData);
        }

        // Fetch system status
        const statusRes = await healthAPI.getSystemStatus();
        if (statusRes.data.success) {
          setSystemStatus(statusRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh every 5 seconds
    const interval = setInterval(fetchDashboardData, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <h2>Traffic Management Dashboard</h2>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          title="Total Vehicles"
          value={metrics?.totalVehicles || 0}
          unit="vehicles"
          icon={Radio}
          description="Active vehicles in network"
        />
        <KPICard
          title="Avg Wait Time"
          value={metrics?.avgWaitTime || 0}
          unit="seconds"
          icon={Clock}
          description="Average vehicle wait time"
        />
        <KPICard
          title="Emissions Saved"
          value={metrics?.emissionsSaved || 0}
          unit="kg CO₂"
          icon={Leaf}
          description="Daily emissions reduction"
        />
        <KPICard
          title="Fuel Saved"
          value={metrics?.fuelConsumption || 0}
          unit="liters"
          icon={Zap}
          description="Fuel consumption reduction"
        />
      </div>

      {/* Charts */}
      <div className="charts-container">
        <Chart
          type="line"
          data={trafficTrends}
          dataKey={['Wait Time', 'Travel Time']}
          title="Traffic Trends"
          height={300}
        />
      </div>

      {/* System Status */}
      <div className="system-status-card">
        <h3>System Status</h3>
        <div className="status-grid">
          <div className="status-info">
            <span>Active Intersections:</span>
            <strong>{systemStatus?.activeIntersections || 0}/{systemStatus?.totalIntersections || 0}</strong>
          </div>
          <div className="status-info">
            <span>Emergency Vehicles Active:</span>
            <strong>{systemStatus?.emergencyVehiclesActive || 0}</strong>
          </div>
          <div className="status-info">
            <span>Average Efficiency:</span>
            <strong>{systemStatus?.averageEfficiency || 0}%</strong>
          </div>
          <div className="status-info">
            <span>MQTT Status:</span>
            <strong style={{ color: systemStatus?.mqttConnected ? '#10b981' : '#ef4444' }}>
              {systemStatus?.mqttConnected ? 'Connected' : 'Disconnected'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
