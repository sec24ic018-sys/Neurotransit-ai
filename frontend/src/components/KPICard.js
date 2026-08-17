import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ title, value, unit = '', icon: Icon, trend = null, description = '' }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <h3>{title}</h3>
        <div className="kpi-icon">
          <Icon size={24} />
        </div>
      </div>

      <div className="kpi-value">
        <span className="value">{value}</span>
        {unit && <span className="unit">{unit}</span>}
      </div>

      {trend && (
        <div className={`kpi-trend ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}

      {description && <p className="kpi-description">{description}</p>}
    </div>
  );
};

export default KPICard;
