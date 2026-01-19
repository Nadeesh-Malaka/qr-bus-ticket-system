import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/dashboard.css';

export default function PassengerDashboard() {
  const { user } = useAuth();

  const menuItems = [
    {
      title: 'View Bus Schedule',
      description: 'Search and view available bus routes and schedules',
      icon: '🚌',
      link: '/busSchedule',
      color: '#3498db'
    },
    {
      title: 'Book Seats',
      description: 'Reserve your seat for upcoming journeys',
      icon: '💺',
      link: '/seat-booking',
      color: '#2ecc71'
    },
    {
      title: 'My Bookings',
      description: 'View your booking history and active tickets',
      icon: '📋',
      link: '/booking-history',
      color: '#f39c12'
    },
    {
      title: 'Track Bus',
      description: 'Track real-time location of buses',
      icon: '📍',
      link: '/busTracker',
      color: '#e74c3c'
    },
    {
      title: 'My Profile',
      description: 'Manage your account settings',
      icon: '👤',
      link: '/profile',
      color: '#9b59b6'
    },
    {
      title: 'Feedback',
      description: 'Share your experience and suggestions',
      icon: '💬',
      link: '/feedback',
      color: '#1abc9c'
    }
  ];

  return (
    <div style={{ padding: '30px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          color: 'white'
        }}>
          <h1 style={{ margin: 0, fontSize: '32px' }}>Welcome, {user?.full_name}! 👋</h1>
          <p style={{ margin: '10px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
            User ID: {user?.user_id} | Role: Passenger
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              style={{
                textDecoration: 'none',
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '15px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                fontSize: '40px',
                backgroundColor: item.color + '20',
                padding: '15px',
                borderRadius: '10px',
                lineHeight: 1
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '20px' }}>
                  {item.title}
                </h3>
                <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
