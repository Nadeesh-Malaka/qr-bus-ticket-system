import React, { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiTruck, FiMapPin, FiAlertCircle } from 'react-icons/fi';

export default function ViewBusSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('http://localhost/qrsys/api/get_schedule.php');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setSchedules(data);
      } else {
        setSchedules([]);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load bus schedules. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading bus schedules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <FiAlertCircle size={48} color="#dc2626" />
          <h3 style={styles.errorTitle}>Oops! Something went wrong</h3>
          <p style={styles.errorText}>{error}</p>
          <button style={styles.retryButton} onClick={fetchSchedules}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <FiTruck size={40} color="#3b82f6" />
          <div style={styles.headerText}>
            <h1 style={styles.title}>Bus Schedules</h1>
            <p style={styles.subtitle}>
              Browse available bus schedules and plan your journey
            </p>
          </div>
        </div>
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <FiCalendar size={20} color="#3b82f6" />
            <span style={styles.statText}>
              {schedules.length} {schedules.length === 1 ? 'Schedule' : 'Schedules'} Available
            </span>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      <div style={styles.content}>
        {schedules.length === 0 ? (
          <div style={styles.emptyState}>
            <FiTruck size={64} color="#cbd5e1" />
            <h3 style={styles.emptyTitle}>No Schedules Available</h3>
            <p style={styles.emptyText}>
              There are currently no bus schedules available. Please check back later.
            </p>
          </div>
        ) : (
          <div style={styles.scheduleGrid}>
            {schedules.map((schedule) => (
              <div key={schedule.schedule_id} style={styles.scheduleCard}>
                {/* Bus Number Badge */}
                <div style={styles.busNumberBadge}>
                  <FiTruck size={18} color="#fff" />
                  <span style={styles.busNumberText}>Bus {schedule.bus_no}</span>
                </div>

                {/* Route Information */}
                <div style={styles.routeSection}>
                  <div style={styles.routeHeader}>
                    <FiMapPin size={20} color="#10b981" />
                    <h3 style={styles.routeName}>{schedule.route_name || 'Route Information'}</h3>
                  </div>
                </div>

                {/* Time Information */}
                <div style={styles.timeSection}>
                  <div style={styles.timeItem}>
                    <div style={styles.timeLabel}>
                      <FiClock size={16} color="#6366f1" />
                      <span style={styles.timeLabelText}>Departure</span>
                    </div>
                    <div style={styles.timeValue}>{schedule.start_time || 'N/A'}</div>
                  </div>

                  <div style={styles.timeDivider}>
                    <div style={styles.timeLine}></div>
                    <span style={styles.timeArrow}>→</span>
                  </div>

                  <div style={styles.timeItem}>
                    <div style={styles.timeLabel}>
                      <FiClock size={16} color="#ec4899" />
                      <span style={styles.timeLabelText}>Arrival</span>
                    </div>
                    <div style={styles.timeValue}>{schedule.reach_time || 'N/A'}</div>
                  </div>
                </div>

                {/* Date Information */}
                <div style={styles.dateSection}>
                  <FiCalendar size={16} color="#64748b" />
                  <span style={styles.dateText}>
                    {schedule.date ? new Date(schedule.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 'Date not specified'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerGrid}>
            <div style={styles.footerColumn}>
              <h3 style={styles.footerHeading}>Quick Links</h3>
              <ul style={styles.footerList}>
                <li style={styles.footerItem}><a href="#" style={styles.footerLink}>About Us</a></li>
                <li style={styles.footerItem}><a href="#" style={styles.footerLink}>Testimonials</a></li>
                <li style={styles.footerItem}><a href="#" style={styles.footerLink}>Terms of Service</a></li>
                <li style={styles.footerItem}><a href="#" style={styles.footerLink}>Privacy</a></li>
                <li style={styles.footerItem}><a href="#" style={styles.footerLink}>Contact Us</a></li>
              </ul>
            </div>
            <div style={styles.footerColumn}>
              <h3 style={styles.footerHeading}>Services</h3>
              <ul style={styles.footerList}>
                <li style={styles.footerItem}><a href="/schedules" style={styles.footerLink}>View Schedules</a></li>
                <li style={styles.footerItem}><a href="/routes" style={styles.footerLink}>View Routes</a></li>
                <li style={styles.footerItem}><a href="/timetable" style={styles.footerLink}>View Timetable</a></li>
                <li style={styles.footerItem}><a href="#" style={styles.footerLink}>Book Tickets</a></li>
              </ul>
            </div>
            <div style={styles.footerColumn}>
              <h3 style={styles.footerHeading}>Contact</h3>
              <ul style={styles.footerList}>
                <li style={styles.footerItem}><span style={styles.footerText}>Phone: +94 118 1234 23</span></li>
                <li style={styles.footerItem}><span style={styles.footerText}>Email: expressbook@gmail.com</span></li>
              </ul>
            </div>
          </div>
          <div style={styles.footerBottom}>
            <p style={styles.footerCopyright}>
              Copyright &copy; {new Date().getFullYear()} ExpressBook. All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #f8fafc, #e0e7ff)',
    paddingBottom: '60px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '20px',
    fontSize: '16px',
    color: '#64748b',
    fontWeight: 500,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    padding: '40px 20px',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1e293b',
    marginTop: '20px',
    marginBottom: '10px',
  },
  errorText: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '30px',
    maxWidth: '500px',
  },
  retryButton: {
    padding: '12px 32px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  header: {
    background: '#fff',
    padding: '40px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    marginBottom: '20px',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0,
  },
  statsBar: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: '20px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    background: '#eff6ff',
    borderRadius: '8px',
    border: '1px solid #bfdbfe',
  },
  statText: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1e40af',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    background: '#fff',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1e293b',
    marginTop: '24px',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#64748b',
    maxWidth: '500px',
  },
  scheduleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
  },
  scheduleCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },
  busNumberBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 700,
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
  },
  busNumberText: {
    fontSize: '15px',
  },
  routeSection: {
    marginBottom: '20px',
  },
  routeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  routeName: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  timeSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '16px',
  },
  timeItem: {
    flex: 1,
    textAlign: 'center',
  },
  timeLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  timeLabelText: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: 500,
  },
  timeValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1e293b',
  },
  timeDivider: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 20px',
  },
  timeLine: {
    width: '2px',
    height: '20px',
    background: '#cbd5e1',
  },
  timeArrow: {
    fontSize: '24px',
    color: '#3b82f6',
    fontWeight: 700,
  },
  dateSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: '#fef3c7',
    borderRadius: '8px',
    border: '1px solid #fcd34d',
  },
  dateText: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#92400e',
  },
  footer: {
    background: '#1e293b',
    color: '#fff',
    padding: '60px 20px 20px',
    marginTop: '60px',
  },
  footerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '40px',
    marginBottom: '40px',
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  footerHeading: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '20px',
    color: '#fff',
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  footerItem: {
    marginBottom: '12px',
  },
  footerLink: {
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s',
  },
  footerText: {
    color: '#cbd5e1',
    fontSize: '14px',
  },
  footerBottom: {
    borderTop: '1px solid #334155',
    paddingTop: '30px',
    textAlign: 'center',
  },
  footerCopyright: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
  },
};

// Add CSS animation for spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (hover: hover) {
    .schedule-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15) !important;
    }
  }
  
  @media (max-width: 768px) {
    .schedule-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);
