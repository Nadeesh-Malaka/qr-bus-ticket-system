import React, { useState, useEffect } from 'react';
import { FiTruck, FiClock, FiMapPin, FiAlertCircle, FiPhone, FiGrid, FiSearch } from 'react-icons/fi';

export default function ViewTimetable() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch buses with joined route information from the API
      const response = await fetch('http://localhost/qrsys/api/bus_api.php');
      const data = await response.json();

      if (Array.isArray(data)) {
        setBuses(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load bus timetable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBuses = buses.filter(bus => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      bus.bus_no?.toLowerCase().includes(search) ||
      bus.route_name?.toLowerCase().includes(search) ||
      bus.start_city?.toLowerCase().includes(search) ||
      bus.end_city?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading timetable...</p>
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
          <button style={styles.retryButton} onClick={fetchData}>
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
          <FiGrid size={40} color="#1984cc" />
          <div style={styles.headerText}>
            <h1 style={styles.title}>Bus Timetable</h1>
            <p style={styles.subtitle}>
              Complete list of all buses with routes and schedules
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <FiSearch size={20} color="#94a3b8" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by bus number, route, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.statsBar}>
            <span style={styles.statText}>
              {filteredBuses.length} {filteredBuses.length === 1 ? 'Bus' : 'Buses'} Available
            </span>
          </div>
        </div>
      </div>

      {/* Bus List */}
      <div style={styles.content}>
        {filteredBuses.length === 0 ? (
          <div style={styles.emptyState}>
            <FiTruck size={64} color="#cbd5e1" />
            <h3 style={styles.emptyTitle}>
              {searchTerm ? 'No Buses Found' : 'No Buses Available'}
            </h3>
            <p style={styles.emptyText}>
              {searchTerm
                ? 'Try adjusting your search criteria or browse all buses.'
                : 'There are currently no buses in the system. Please check back later.'}
            </p>
            {searchTerm && (
              <button 
                style={styles.clearButton}
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div style={styles.busGrid}>
            {filteredBuses.map((bus) => {
              return (
                <div key={bus.bus_id} style={styles.busCard}>
                  {/* Bus Number Header */}
                  <div style={styles.busHeader}>
                    <div style={styles.busNumberBadge}>
                      <FiTruck size={20} color="#fff" />
                      <span style={styles.busNumber}>Bus {bus.bus_no}</span>
                    </div>
                    <div style={styles.seatsBadge}>
                      {bus.no_of_seats} Seats
                    </div>
                  </div>

                  {/* Route Information */}
                  <div style={styles.routeSection}>
                    <div style={styles.routeLabel}>
                      <FiMapPin size={16} color="#1984cc" />
                      <span style={styles.routeLabelText}>Route</span>
                    </div>
                    <h3 style={styles.routeNameText}>
                      {bus.route_name || bus.bus_route || 'Route Information'}
                    </h3>
                    
                    {bus.start_city && bus.end_city && (
                      <div style={styles.journeyPath}>
                        <div style={styles.cityBox}>
                          <div style={{...styles.cityDot, background: '#10b981'}}></div>
                          <span style={styles.cityName}>{bus.start_city}</span>
                        </div>
                        <div style={styles.journeyLine}></div>
                        <div style={styles.cityBox}>
                          <div style={{...styles.cityDot, background: '#ef4444'}}></div>
                          <span style={styles.cityName}>{bus.end_city}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Additional Route Details */}
                    {(bus.province || bus.price) && (
                      <div style={styles.routeDetails}>
                        {bus.province && (
                          <div style={styles.routeDetailItem}>
                            <span style={styles.routeDetailLabel}>Province:</span>
                            <span style={styles.routeDetailValue}>{bus.province}</span>
                          </div>
                        )}
                        {bus.price && (
                          <div style={styles.routeDetailItem}>
                            <span style={styles.routeDetailLabel}>Fare:</span>
                            <span style={styles.routeDetailValue}>Rs. {parseFloat(bus.price).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Schedule Section */}
                  <div style={styles.scheduleSection}>
                    <div style={styles.scheduleRow}>
                      <div style={styles.scheduleItem}>
                        <FiClock size={16} color="#1984cc" />
                        <div style={styles.scheduleInfo}>
                          <span style={styles.scheduleLabel}>Departure</span>
                          <span style={styles.scheduleTime}>
                            {bus.start_time || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div style={styles.timeDivider}>→</div>
                      <div style={styles.scheduleItem}>
                        <FiClock size={16} color="#ec4899" />
                        <div style={styles.scheduleInfo}>
                          <span style={styles.scheduleLabel}>Arrival</span>
                          <span style={styles.scheduleTime}>
                            {bus.reach_time || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  {bus.bus_service_tel && (
                    <div style={styles.contactSection}>
                      <FiPhone size={16} color="#64748b" />
                      <span style={styles.contactText}>{bus.bus_service_tel}</span>
                    </div>
                  )}


                </div>
              );
            })}
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
    background: 'linear-gradient(to bottom, #faf5ff, #f3e8ff)',
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
    borderTop: '4px solid #1984cc',
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
    background: '#1984cc',
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
    marginBottom: '30px',
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
  searchContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  searchWrapper: {
    position: 'relative',
    marginBottom: '16px',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  searchInput: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    fontSize: '15px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
  },
  statText: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#64748b',
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
    marginBottom: '20px',
  },
  clearButton: {
    padding: '10px 24px',
    background: '#8b5cf6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  busGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '24px',
  },
  busCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  busHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  busNumberBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 700,
    boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)',
  },
  busNumber: {
    fontSize: '16px',
  },
  seatsBadge: {
    padding: '6px 14px',
    background: '#f1f5f9',
    color: '#475569',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
  },
  routeSection: {
    marginBottom: '20px',
    padding: '16px',
    background: '#faf5ff',
    borderRadius: '12px',
    border: '1px solid #e9d5ff',
  },
  routeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  routeLabelText: {
    fontSize: '12px',
    color: '#7c3aed',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  routeNameText: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '12px',
  },
  journeyPath: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cityBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  cityDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  cityName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#475569',
  },
  journeyLine: {
    flex: '0 0 30px',
    height: '2px',
    background: '#cbd5e1',
  },
  routeDetails: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #e9d5ff',
  },
  routeDetailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  routeDetailLabel: {
    fontSize: '11px',
    color: '#7c3aed',
    fontWeight: 500,
    textTransform: 'uppercase',
  },
  routeDetailValue: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1e293b',
  },
  scheduleSection: {
    marginBottom: '16px',
  },
  scheduleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
  },
  scheduleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  scheduleInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  scheduleLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 500,
  },
  scheduleTime: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1e293b',
  },
  timeDivider: {
    fontSize: '20px',
    color: '#8b5cf6',
    fontWeight: 700,
    padding: '0 12px',
  },
  contactSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: '#eff6ff',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  contactText: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e40af',
  },
  configSection: {
    padding: '12px 16px',
    background: '#fefce8',
    borderRadius: '8px',
    border: '1px solid #fde047',
  },
  configItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  configLabel: {
    fontSize: '13px',
    color: '#713f12',
    fontWeight: 500,
  },
  configValue: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#854d0e',
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

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1) !important;
  }
  
  @media (hover: hover) {
    .bus-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15) !important;
    }
    
    button:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
  }
  
  @media (max-width: 768px) {
    .bus-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);
