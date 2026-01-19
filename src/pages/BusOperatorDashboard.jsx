import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/dashboard.css';

export default function BusOperatorDashboard() {
  const { user } = useAuth();

  const menuItems = [
    {
      title: 'My Buses',
      description: 'View and manage assigned buses',
      icon: '🚌',
      link: '/operator/buses',
      color: '#3498db'
    },
    {
      title: 'My Routes',
      description: 'View assigned routes and schedules',
      icon: '🛣️',
      link: '/operator/routes',
      color: '#2ecc71'
    },
    {
      title: 'Schedules',
      description: 'Manage bus schedules',
      icon: '📅',
      link: '/operator/schedules',
      color: '#f39c12'
    },
    {
      title: 'Bookings',
      description: 'View booking data for your buses',
      icon: '📊',
      link: '/operator/bookings',
      color: '#9b59b6'
    }
  ];

  return (
    <div style={{ padding: '30px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #fd7e14 0%, #dc5f00 100%)',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          color: 'white'
        }}>
          <h1 style={{ margin: 0, fontSize: '32px' }}>Bus Operator Dashboard 🚌</h1>
          <p style={{ margin: '10px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
            Welcome, {user?.full_name} | User ID: {user?.user_id}
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
