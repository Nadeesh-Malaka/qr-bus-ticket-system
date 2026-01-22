import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export default function DriverSchedule() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDriverSchedule();
  }, []);

  const fetchDriverSchedule = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(
        `${API_BASE_URL}/get_driver_schedule.php?driver_id=${user.user_id}&date=${today}`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setSchedules(data.schedules || []);
      } else {
        setError(data.message || 'Failed to load schedule');
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Error loading schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScheduleStatus = (startTime) => {
    const now = new Date();
    const [hours, minutes] = startTime.split(':');
    const scheduleTime = new Date();
    scheduleTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const diffMinutes = (scheduleTime - now) / (1000 * 60);
    
    if (diffMinutes < -30) return { label: 'Completed', class: 'completed' };
    if (diffMinutes < 30) return { label: 'Active', class: 'active' };
    return { label: 'Upcoming', class: 'upcoming' };
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="driver-loading">
        <div className="spinner"></div>
        <p>Loading schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="driver-empty-state">
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-text">{error}</div>
        <button 
          className="driver-btn driver-btn-primary"
          onClick={fetchDriverSchedule}
          style={{ marginTop: '20px' }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="driver-empty-state">
        <div className="empty-state-icon">📅</div>
        <div className="empty-state-text">
          No trips scheduled for today.<br/>
          Enjoy your day off!
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#2d3748' }}>
        📅 Today's Schedule
      </h2>
      <p style={{ color: '#718096', marginBottom: '20px' }}>
        {new Date().toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>

      <div className="driver-schedule-list">
        {schedules.map((schedule, index) => {
          const status = getScheduleStatus(schedule.start_time);
          
          return (
            <div key={index} className="schedule-card">
              <div className="schedule-header">
                <div className="schedule-bus-no">
                  🚍 {schedule.bus_no}
                </div>
                <span className={`schedule-status ${status.class}`}>
                  {status.label}
                </span>
              </div>

              <div className="schedule-route">
                <span style={{ fontWeight: '600' }}>{schedule.start_city}</span>
                <span style={{ color: '#667eea' }}>→</span>
                <span style={{ fontWeight: '600' }}>{schedule.end_city}</span>
              </div>

              {schedule.route_name && (
                <div style={{ fontSize: '14px', color: '#718096', marginTop: '5px' }}>
                  Route: {schedule.route_name}
                </div>
              )}

              <div className="schedule-time">
                <div>
                  <span style={{ fontWeight: '600' }}>Departure:</span> {formatTime(schedule.start_time)}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Arrival:</span> {formatTime(schedule.reach_time)}
                </div>
              </div>

              {schedule.total_seats && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  background: '#f7fafc',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-around',
                  fontSize: '14px'
                }}>
                  <div>
                    <div style={{ color: '#718096' }}>Total Seats</div>
                    <div style={{ fontWeight: '700', color: '#2d3748' }}>{schedule.total_seats}</div>
                  </div>
                  <div>
                    <div style={{ color: '#718096' }}>Booked</div>
                    <div style={{ fontWeight: '700', color: '#48bb78' }}>{schedule.booked_seats || 0}</div>
                  </div>
                  <div>
                    <div style={{ color: '#718096' }}>Available</div>
                    <div style={{ fontWeight: '700', color: '#667eea' }}>
                      {schedule.total_seats - (schedule.booked_seats || 0)}
                    </div>
                  </div>
                </div>
              )}

              {schedule.bus_service_tel && (
                <div style={{ 
                  marginTop: '10px',
                  fontSize: '14px',
                  color: '#718096'
                }}>
                  📞 Contact: {schedule.bus_service_tel}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button 
        className="driver-btn driver-btn-secondary"
        onClick={fetchDriverSchedule}
        style={{ width: '100%', marginTop: '20px' }}
      >
        🔄 Refresh Schedule
      </button>
    </div>
  );
}
