import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiClock, FiTruck } from 'react-icons/fi';
import axios from 'axios';
import '../pages/AdminDashboard.css';

export default function OperatorTrackBuses() {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    if (user?.user_id) {
      fetchOperatorBuses();
    }
  }, [user]);

  const fetchOperatorBuses = async () => {
    try {
      const response = await axios.get(
        `http://localhost/qrsys/api/get_operator_buses.php?operator_id=${user.user_id}`
      );
      
      if (response.data.success) {
        setBuses(response.data.buses);
      } else {
        console.error('Failed to fetch buses:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching operator buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackBus = (bus) => {
    setSelectedBus(bus);
    // In a real implementation, this would open a map or tracking interface
    alert(`Tracking feature for ${bus.bus_no} will be implemented with GPS integration.`);
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Track Buses</h1>
          <p>Loading bus tracking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Track Buses</h1>
          <p>Monitor real-time location of your bus fleet</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="dashboard-section">
        <div className="info-card" style={{ backgroundColor: '#e3f2fd', borderLeft: '4px solid #3498db' }}>
          <h3 style={{ color: '#3498db', marginTop: 0 }}>GPS Tracking</h3>
          <p>Real-time GPS tracking requires GPS hardware integration with each bus. This feature displays the current location and status of your buses.</p>
        </div>
      </div>

      {/* Buses Grid */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Your Fleet</h2>
          <p>{buses.length} bus{buses.length !== 1 ? 'es' : ''} in your fleet</p>
        </div>

        {buses.length === 0 ? (
          <div className="info-card">
            <p>No buses assigned to you yet. Please contact the administrator.</p>
          </div>
        ) : (
          <div className="bus-tracking-grid">
            {buses.map((bus) => (
              <div key={bus.bus_id} className="tracking-card">
                <div className="tracking-card-header">
                  <div className="bus-icon">
                    <FiTruck size={24} />
                  </div>
                  <div className="bus-details">
                    <h3>{bus.bus_no}</h3>
                    <p className="route-name">{bus.bus_route || bus.route_name || 'No Route Assigned'}</p>
                  </div>
                </div>

                <div className="tracking-card-body">
                  <div className="tracking-info">
                    <div className="info-row">
                      <FiMapPin size={18} color="#3498db" />
                      <div>
                        <p className="info-label">Current Location</p>
                        <p className="info-value">GPS tracking pending</p>
                      </div>
                    </div>

                    <div className="info-row">
                      <FiClock size={18} color="#2ecc71" />
                      <div>
                        <p className="info-label">Schedule</p>
                        <p className="info-value">{bus.start_time} - {bus.reach_time}</p>
                      </div>
                    </div>

                    <div className="info-row">
                      <FiTruck size={18} color="#f39c12" />
                      <div>
                        <p className="info-label">Capacity</p>
                        <p className="info-value">{bus.no_of_seats} seats</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="btn-primary btn-full-width"
                    onClick={() => handleTrackBus(bus)}
                  >
                    <FiMapPin /> Track on Map
                  </button>
                </div>

                <div className="tracking-card-footer">
                  <span className="status-badge status-active">Active</span>
                  <span className="last-update">Last updated: Just now</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Implementation Notice
      <div className="dashboard-section">
        <div className="info-card">
          <h3>Implementation Note</h3>
          <p>To enable full GPS tracking functionality, the following components are required:</p>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>GPS hardware installation in each bus</li>
            <li>GPS data transmission system</li>
            <li>Real-time map integration (Google Maps or similar)</li>
            <li>WebSocket or polling mechanism for live updates</li>
          </ul>
          <p style={{ marginTop: '10px' }}>
            This interface provides the frontend structure. Backend GPS integration and map APIs need to be configured.
          </p>
        </div>
      </div> */}

      {/* Custom Styles */}
      <style jsx>{`
        .bus-tracking-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .tracking-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .tracking-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .tracking-card-header {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          padding: 20px;
          color: white;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .bus-icon {
          background: rgba(255,255,255,0.2);
          padding: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bus-details h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .route-name {
          margin: 5px 0 0 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .tracking-card-body {
          padding: 20px;
        }

        .tracking-info {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .info-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .info-label {
          margin: 0;
          font-size: 12px;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          margin: 3px 0 0 0;
          font-size: 14px;
          color: #2c3e50;
          font-weight: 500;
        }

        .tracking-card-footer {
          padding: 15px 20px;
          background: #f8f9fa;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #ecf0f1;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-active {
          background: #d4edda;
          color: #155724;
        }

        .last-update {
          font-size: 12px;
          color: #7f8c8d;
        }

        .btn-full-width {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}
