import { Radio } from 'lucide-react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <div className="header-icon">
            <Radio size={32} />
          </div>
          <div className="title-text">
            <h1>NeuroTransit AI</h1>
            <p className="subtitle">Decentralized AI-Powered Traffic Management System</p>
          </div>
        </div>
        
        <div className="header-status">
          <div className="status-item">
            <div className="status-indicator active"></div>
            <span>System Operational</span>
          </div>
          <div className="status-item">
            <div className="status-indicator active"></div>
            <span>MQTT Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
