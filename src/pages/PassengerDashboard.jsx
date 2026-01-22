import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import '../assets/dashboard.css';

export default function PassengerDashboard() {
  const { user } = useAuth();

  // Primary actions - most important features
  const primaryActions = [
    {
      title: 'Search & Book Bus',
      description: 'Find available buses and book your journey',
      icon: '🔍',
      link: '/home',
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      priority: 'high'
    },
    {
      title: 'My Bookings',
      description: 'View booking history and pending payments',
      icon: '📋',
      link: '/booking-history',
      color: '#f093fb',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      priority: 'high'
    },
    {
      title: 'View Tickets',
      description: 'Access your confirmed tickets with QR codes',
      icon: '🎫',
      link: '/booking-history',
      color: '#4facfe',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      priority: 'high'
    }
  ];

  // Secondary actions - additional features
  const secondaryActions = [
    {
      title: 'View Routes',
      description: 'Browse all available bus routes',
      icon: '🗺️',
      link: '/routes',
      color: '#43e97b'
    },
    {
      title: 'View Timetable',
      description: 'Check complete bus schedules',
      icon: '🕐',
      link: '/timetable',
      color: '#fa709a'
    },
    {
      title: 'Track Bus',
      description: 'Track real-time bus locations',
      icon: '📍',
      link: '/busTracker',
      color: '#ff6b6b'
    },
    {
      title: 'My Profile',
      description: 'Manage your account details',
      icon: '👤',
      link: '/profile',
      color: '#a78bfa'
    },
    {
      title: 'Feedback',
      description: 'Share your experience with us',
      icon: '💬',
      link: '/feedback',
      color: '#38bdf8'
    }
  ];

  return (
    <div style={{ 
      padding: '30px 20px', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Welcome Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 35px',
          borderRadius: '20px',
          marginBottom: '40px',
          color: 'white',
          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '36px', 
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>
            Welcome, {user?.full_name}! 👋
          </h1>
          <p style={{ 
            margin: '12px 0 0 0', 
            fontSize: '16px', 
            opacity: 0.95,
            fontWeight: '400'
          }}>
            User ID: {user?.user_id} | Role: Passenger
          </p>
        </div>

        {/* Primary Actions Section */}
        <div style={{ marginBottom: '35px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#1e293b', 
            marginBottom: '20px',
            letterSpacing: '-0.3px'
          }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '25px'
          }}>
            {primaryActions.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                style={{
                  textDecoration: 'none',
                  background: item.gradient,
                  padding: '30px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                }}
              >
                <div style={{
                  fontSize: '48px',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  padding: '18px',
                  borderRadius: '14px',
                  lineHeight: 1,
                  backdropFilter: 'blur(10px)'
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    color: 'white', 
                    fontSize: '22px',
                    fontWeight: '700',
                    letterSpacing: '-0.3px'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    color: 'rgba(255,255,255,0.95)', 
                    fontSize: '14px',
                    fontWeight: '400',
                    lineHeight: '1.5'
                  }}>
                    {item.description}
                  </p>
                </div>
                <div style={{
                  color: 'white',
                  fontSize: '24px',
                  opacity: 0.8
                }}>
                  →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Secondary Actions Section */}
        <div>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#1e293b', 
            marginBottom: '20px',
            letterSpacing: '-0.3px'
          }}>
            More Options
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px'
          }}>
            {secondaryActions.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                style={{
                  textDecoration: 'none',
                  backgroundColor: 'white',
                  padding: '25px',
                  borderRadius: '14px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '12px',
                  border: '1px solid #e2e8f0'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = item.color;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div style={{
                  fontSize: '36px',
                  backgroundColor: item.color + '15',
                  padding: '14px',
                  borderRadius: '12px',
                  lineHeight: 1,
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ 
                    margin: '0 0 6px 0', 
                    color: '#1e293b', 
                    fontSize: '18px',
                    fontWeight: '600',
                    letterSpacing: '-0.2px'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    color: '#64748b', 
                    fontSize: '13px',
                    lineHeight: '1.5',
                    fontWeight: '400'
                  }}>
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div style={{
          marginTop: '40px',
          padding: '25px',
          backgroundColor: 'white',
          borderRadius: '14px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap',
          border: '1px solid #e2e8f0'
        }}>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
            🚀 Need help?
          </span>
          <Link 
            to="/feedback" 
            style={{ 
              color: '#667eea', 
              textDecoration: 'none', 
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Contact Support
          </Link>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <Link 
            to="/routes" 
            style={{ 
              color: '#667eea', 
              textDecoration: 'none', 
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            View All Routes
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
