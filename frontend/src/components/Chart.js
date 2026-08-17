import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Chart = ({ type = 'line', data, dataKey, title, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  const renderChart = () => {
    if (type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="timestamp" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }} />
            <Legend />
            {Array.isArray(dataKey) ? (
              dataKey.map((key, idx) => (
                <Line key={idx} type="monotone" dataKey={key} stroke={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][idx]} />
              ))
            ) : (
              <Line type="monotone" dataKey={dataKey} stroke="#10b981" />
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }} />
            <Legend />
            {Array.isArray(dataKey) ? (
              dataKey.map((key, idx) => (
                <Bar key={idx} dataKey={key} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][idx]} />
              ))
            ) : (
              <Bar dataKey={dataKey} fill="#3b82f6" />
            )}
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      {renderChart()}
    </div>
  );
};

export default Chart;
