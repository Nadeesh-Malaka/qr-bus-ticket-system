import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../assets/driver.css';
import DriverScanTicket from '../components/DriverScanTicket';
import DriverSchedule from '../components/DriverSchedule';
import DriverPassengerList from '../components/DriverPassengerList';
import DriverProfile from '../components/DriverProfile';

export default function BusDriverDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'scan':
        return <DriverScanTicket />;
      case 'schedule':
        return <DriverSchedule />;
      case 'passengers':
        return <DriverPassengerList />;
      case 'profile':
        return <DriverProfile />;
      default:
        return <DriverHome setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="driver-dashboard-wrapper">
      <header className="driver-header">
        <div className="driver-header-content">
          <div>
            <h1>🚍 Driver Dashboard</h1>
            <p className="driver-header-time">{formatDate(currentTime)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{formatTime(currentTime)}</div>
            <div style={{ fontSize: '12px', color: '#718096' }}>{user?.full_name}</div>
          </div>
        </div>
      </header>

      <div className="driver-content">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <nav className="driver-bottom-nav">
        <button 
          className={`driver-nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="driver-nav-icon">🏠</span>
          <span className="driver-nav-label">Home</span>
        </button>
        <button 
          className={`driver-nav-item ${activeTab === 'scan' ? 'active' : ''}`}
          onClick={() => setActiveTab('scan')}
        >
          <span className="driver-nav-icon">📷</span>
          <span className="driver-nav-label">Scan</span>
        </button>
        <button 
          className={`driver-nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <span className="driver-nav-icon">📅</span>
          <span className="driver-nav-label">Schedule</span>
        </button>
        <button 
          className={`driver-nav-item ${activeTab === 'passengers' ? 'active' : ''}`}
          onClick={() => setActiveTab('passengers')}
        >
          <span className="driver-nav-icon">📋</span>
          <span className="driver-nav-label">Passengers</span>
        </button>
        <button 
          className={`driver-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className="driver-nav-icon">👤</span>
          <span className="driver-nav-label">Profile</span>
        </button>
      </nav>

      {/* Footer */}
      {activeTab === 'home' && (
        <div className="driver-footer">
          <p>QR Bus System - Driver Portal</p>
          <p>&copy; 2026 All Rights Reserved</p>
        </div>
      )}
    </div>
  );
}

// Home Screen Component
function DriverHome({ setActiveTab }) {
  const tiles = [
    {
      icon: '📷',
      title: 'Scan Ticket',
      desc: 'Verify passenger QR codes',
      tab: 'scan',
      color: '#667eea'
    },
    {
      icon: '📅',
      title: 'My Schedule',
      desc: 'View today\'s trips',
      tab: 'schedule',
      color: '#48bb78'
    },
    {
      icon: '📋',
      title: 'Passengers',
      desc: 'Check booking status',
      tab: 'passengers',
      color: '#ed8936'
    },
    {
      icon: '👤',
      title: 'Profile',
      desc: 'View & edit profile',
      tab: 'profile',
      color: '#4299e1'
    }
  ];

  return (
    <div className="driver-home-tiles">
      {tiles.map((tile, index) => (
        <button
          key={index}
          className="driver-tile"
          onClick={() => setActiveTab(tile.tab)}
          style={{ borderTop: `4px solid ${tile.color}` }}
        >
          <span className="driver-tile-icon">{tile.icon}</span>
          <h3 className="driver-tile-title">{tile.title}</h3>
          <p className="driver-tile-desc">{tile.desc}</p>
        </button>
      ))}
    </div>
  );
}
