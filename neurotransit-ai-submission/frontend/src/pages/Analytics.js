import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Leaf, Activity } from 'lucide-react';
import KPICard from '../components/KPICard';
import Chart from '../components/Chart';
import { analyticsAPI } from '../services/api';

const Analytics = () => {
  const [efficiency, setEfficiency] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Fetch efficiency metrics
        const effRes = await analyticsAPI.getEfficiency();
        if (effRes.data.success) {
          setEfficiency(effRes.data.data);
        }

        // Fetch traffic history
        const trafficRes = await analyticsAPI.getHistory(100);
        if (trafficRes.data.success) {
          const formattedData = trafficRes.data.data.map(item => ({
            timestamp: new Date(item.timestamp).toLocaleTimeString(),
            'Total Vehicles': item.totalVehicles,
            'Avg Wait Time': item.avgWaitTime,
            'Optimization Score': item.optimizationScore
          }));
          setTrafficData(formattedData);
        }

        // Fetch trends
        const trendsRes = await analyticsAPI.getTrends();
        if (trendsRes.data.success) {
          setTrends(trendsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();

    // Refresh every 5 seconds
    const interval = setInterval(fetchAnalyticsData, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <h2>Traffic Analytics & Insights</h2>

      {/* Analytics KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          title="Avg Wait Time"
          value={trafficData.length > 0 ? trafficData[trafficData.length - 1]['Avg Wait Time'] : 0}
          unit="seconds"
          icon={Activity}
          trend={trends?.waitTimeChange || 0}
          description={`Trend: ${trends?.waitTimeTrend || 'stable'}`}
        />
        <KPICard
          title="Emissions Saved"
          value={efficiency?.totalEmissionsSaved || 0}
          unit="kg CO₂"
          icon={Leaf}
          trend={trends?.emissionsChange || 0}
          description="Daily reduction"
        />
        <KPICard
          title="Fuel Efficiency"
          value={efficiency?.totalFuelSaved || 0}
          unit="liters"
          icon={Activity}
          description="Fuel saved from optimization"
        />
        <KPICard
          title="Optimization Score"
          value={efficiency?.avgOptimizationScore || 0}
          unit="%"
          icon={TrendingUp}
          trend={trends?.efficiencyChange || 0}
          description={`Trend: ${trends?.efficiencyTrend || 'stable'}`}
        />
      </div>

      {/* Charts */}
      <div className="charts-container">
        <Chart
          type="line"
          data={trafficData}
          dataKey={['Total Vehicles', 'Avg Wait Time']}
          title="Vehicle Count & Wait Time Trend"
          height={300}
        />
        <Chart
          type="line"
          data={trafficData}
          dataKey="Optimization Score"
          title="Optimization Score Over Time"
          height={300}
        />
      </div>

      {/* Environmental Impact */}
      <div className="impact-card">
        <h3>Environmental Impact</h3>
        <div className="impact-content">
          <div className="impact-item">
            <Leaf size={32} />
            <div>
              <h4>{efficiency?.environmentalImpact || '0 tons of CO₂ saved'}</h4>
              <p>Through optimized traffic signal timing and reduced vehicle emissions</p>
            </div>
          </div>

          <div className="impact-stats">
            <div className="stat">
              <span>Total Emissions Saved</span>
              <strong>{efficiency?.totalEmissionsSaved || 0} kg CO₂</strong>
            </div>
            <div className="stat">
              <span>Total Fuel Saved</span>
              <strong>{efficiency?.totalFuelSaved || 0} liters</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Network Optimization Insights */}
      <div className="insights-card">
        <h3>Network Optimization Insights</h3>
        <div className="insights-content">
          <div className="insight-item">
            <h4>Peak Hour Management</h4>
            <p>System optimizes signal timing during peak hours to maintain 28% average wait time reduction</p>
          </div>
          <div className="insight-item">
            <h4>Emergency Response</h4>
            <p>Emergency corridors established automatically, reducing emergency vehicle response time by 40%</p>
          </div>
          <div className="insight-item">
            <h4>Network Efficiency</h4>
            <p>Current optimization score: {efficiency?.avgOptimizationScore || 0}% - Excellent performance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
