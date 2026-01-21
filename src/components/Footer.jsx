import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#1e293b',
      color: '#e2e8f0',
      padding: '60px 20px 30px',
      marginTop: 'auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* About Section */}
          <div>
            <h3 style={{ 
              color: '#ffffff', 
              fontSize: '20px', 
              fontWeight: '700', 
              marginBottom: '20px',
              letterSpacing: '-0.3px'
            }}>
              QR Bus System
            </h3>
            <p style={{ 
              fontSize: '14px', 
              lineHeight: '1.8', 
              color: '#cbd5e1',
              marginBottom: '20px'
            }}>
              Modern bus booking platform with QR code tickets. Book your journey quickly, 
              securely, and conveniently.
            </p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              {['📧', '📱', '🌐'].map((icon, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#334155',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    fontSize: '18px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#667eea';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#334155';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ 
              color: '#ffffff', 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '20px',
              letterSpacing: '-0.2px'
            }}>
              Quick Links
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Home', path: '/home' },
                { label: 'Search Buses', path: '/home' },
                { label: 'View Routes', path: '/routes' },
                { label: 'View Timetable', path: '/timetable' },
                { label: 'Track Bus', path: '/busTracker' }
              ].map((link, idx) => (
                <li key={idx} style={{ marginBottom: '12px' }}>
                  <Link
                    to={link.path}
                    style={{
                      color: '#cbd5e1',
                      textDecoration: 'none',
                      fontSize: '14px',
                      display: 'inline-block',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = '#667eea';
                      e.currentTarget.style.paddingLeft = '5px';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = '#cbd5e1';
                      e.currentTarget.style.paddingLeft = '0';
                    }}
                  >
                    → {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Passenger Services */}
          <div>
            <h3 style={{ 
              color: '#ffffff', 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '20px',
              letterSpacing: '-0.2px'
            }}>
              Passenger Services
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'My Bookings', path: '/booking-history' },
                { label: 'My Tickets', path: '/booking-history' },
                { label: 'My Profile', path: '/profile' },
                { label: 'Feedback', path: '/feedback' }
              ].map((link, idx) => (
                <li key={idx} style={{ marginBottom: '12px' }}>
                  <Link
                    to={link.path}
                    style={{
                      color: '#cbd5e1',
                      textDecoration: 'none',
                      fontSize: '14px',
                      display: 'inline-block',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = '#667eea';
                      e.currentTarget.style.paddingLeft = '5px';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = '#cbd5e1';
                      e.currentTarget.style.paddingLeft = '0';
                    }}
                  >
                    → {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h3 style={{ 
              color: '#ffffff', 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '20px',
              letterSpacing: '-0.2px'
            }}>
              Support
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Help Center', icon: '❓' },
                { label: 'Contact Us', icon: '📞' },
                { label: 'Terms of Service', icon: '📄' },
                { label: 'Privacy Policy', icon: '🔒' }
              ].map((item, idx) => (
                <li key={idx} style={{ marginBottom: '12px' }}>
                  <span
                    style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'color 0.3s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = '#cbd5e1';
                    }}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #334155',
          paddingTop: '30px',
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#94a3b8'
          }}>
            © {new Date().getFullYear()} QR Bus System. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Made with ❤️ for travelers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
