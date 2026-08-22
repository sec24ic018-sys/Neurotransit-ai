import { AlertCircle, CheckCircle } from 'lucide-react';

const StatusIndicator = ({ status = 'active', vehicleCount = 0, efficiency = 0 }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'warning':
        return 'status-warning';
      case 'critical':
        return 'status-critical';
      default:
        return 'status-inactive';
    }
  };

  return (
    <div className={`status-indicator-container ${getStatusColor(status)}`}>
      <div className="status-header">
        {status === 'active' && <CheckCircle size={20} />}
        {status === 'warning' && <AlertCircle size={20} />}
        {status === 'critical' && <AlertCircle size={20} />}
        <span className="status-text">{status.toUpperCase()}</span>
      </div>

      <div className="status-details">
        <div className="detail-item">
          <span>Vehicles:</span>
          <strong>{vehicleCount}</strong>
        </div>
        <div className="detail-item">
          <span>Efficiency:</span>
          <strong>{efficiency.toFixed(1)}%</strong>
        </div>
      </div>
    </div>
  );
};

export default StatusIndicator;
