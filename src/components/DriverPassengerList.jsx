import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export default function DriverPassengerList() {
  const { user } = useAuth();
  const [passengers, setPassengers] = useState([]);
  const [stats, setStats] = useState({ total: 0, booked: 0, verified: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBus, setSelectedBus] = useState('');
  const [buses, setBuses] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchDriverBuses();
  }, []);

  useEffect(() => {
    if (selectedBus) {
      fetchPassengers();
    }
  }, [selectedBus]);

  const fetchDriverBuses = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${API_BASE_URL}/get_driver_schedule.php?driver_id=${user.user_id}&date=${today}`
      );
      
      const data = await response.json();
      
      if (data.success && data.schedules && data.schedules.length > 0) {
        setBuses(data.schedules);
        setSelectedBus(data.schedules[0].bus_no); // Auto-select first bus
      } else {
        setError('No buses assigned for today');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching buses:', err);
      setError('Error loading buses');
      setLoading(false);
    }
  };

  const fetchPassengers = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(
        `${API_BASE_URL}/get_driver_passengers.php?bus_no=${selectedBus}&travel_date=${today}`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setPassengers(data.passengers || []);
        setStats(data.stats || { total: 0, booked: 0, verified: 0 });
      } else {
        setPassengers([]);
        setStats({ total: 0, booked: 0, verified: 0 });
      }
    } catch (err) {
      console.error('Error fetching passengers:', err);
      setError('Error loading passenger list');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (stats.total === 0) return 0;
    return (stats.booked / stats.total) * 360;
  };

  if (error && buses.length === 0) {
    return (
      <div className="driver-empty-state">
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-text">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#2d3748' }}>
        📋 Passenger List
      </h2>

      {buses.length > 1 && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#4a5568'
          }}>
            Select Bus
          </label>
          <select
            className="driver-input"
            value={selectedBus}
            onChange={(e) => setSelectedBus(e.target.value)}
            style={{ marginBottom: 0 }}
          >
            {buses.map((bus, index) => (
              <option key={index} value={bus.bus_no}>
                {bus.bus_no} - {bus.route_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="driver-loading">
          <div className="spinner"></div>
          <p>Loading passengers...</p>
        </div>
      ) : (
        <>
          <div className="passenger-stats">
            <h3 style={{ marginTop: 0 }}>Booking Status</h3>
            
            <div 
              className="stats-circle"
              style={{ '--progress-deg': `${calculateProgress()}deg` }}
            >
              <div className="stats-circle-inner">
                <div className="stats-number">{stats.booked}</div>
                <div className="stats-label">of {stats.total}</div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px',
              marginTop: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '12px', color: '#718096' }}>Total Seats</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#48bb78' }}>
                  {stats.booked}
                </div>
                <div style={{ fontSize: '12px', color: '#718096' }}>Booked</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#38a169' }}>
                  {stats.verified}
                </div>
                <div style={{ fontSize: '12px', color: '#718096' }}>Verified</div>
              </div>
            </div>

            {passengers.length > 0 && (
              <button 
                className="driver-btn driver-btn-secondary"
                onClick={() => setShowDetails(!showDetails)}
                style={{ width: '100%', marginTop: '20px' }}
              >
                {showDetails ? 'Hide' : 'Show'} Passenger Details
              </button>
            )}
          </div>

          {showDetails && passengers.length > 0 && (
            <div className="passenger-list">
              <h3 style={{ marginTop: '20px', marginBottom: '15px' }}>
                Passenger Details ({passengers.length})
              </h3>
              
              {passengers.map((passenger, index) => (
                <div key={index} className="passenger-item">
                  <div className="passenger-info">
                    <div className="passenger-name">
                      {passenger.passenger_name}
                    </div>
                    <div className="passenger-seat">
                      Seat {passenger.seat_no} • {passenger.reference_no}
                    </div>
                    {passenger.travel_date && (
                      <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '2px' }}>
                        {new Date(passenger.travel_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <span className={`passenger-badge ${
                    passenger.booking_status === 'confirmed' || passenger.is_verified 
                      ? 'verified' 
                      : 'pending'
                  }`}>
                    {passenger.booking_status === 'confirmed' || passenger.is_verified 
                      ? '✓ Verified' 
                      : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {passengers.length === 0 && (
            <div className="driver-empty-state" style={{ marginTop: '20px' }}>
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-text">
                No passengers booked for this trip yet
              </div>
            </div>
          )}

          <button 
            className="driver-btn driver-btn-secondary"
            onClick={fetchPassengers}
            style={{ width: '100%', marginTop: '20px' }}
          >
            🔄 Refresh List
          </button>
        </>
      )}
    </div>
  );
}
