import React, { useState, useEffect } from 'react';
import { FiMapPin, FiDollarSign, FiMap, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import Footer from '../components/Footer';

export default function ViewRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await fetch('http://localhost/qrsys/api/get_routes.php');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setRoutes(data);
      } else {
        setRoutes([]);
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError('Failed to load routes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter(route => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      route.route_name?.toLowerCase().includes(search) ||
      route.start_city?.toLowerCase().includes(search) ||
      route.end_city?.toLowerCase().includes(search) ||
      route.province?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading routes...</p>
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
          <button style={styles.retryButton} onClick={fetchRoutes}>
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
          <FiMap size={40} color="#10b981" />
          <div style={styles.headerText}>
            <h1 style={styles.title}>Available Routes</h1>
            <p style={styles.subtitle}>
              Explore all available bus routes and plan your journey
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <FiMapPin size={20} color="#94a3b8" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by city, route name, or province..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.statsBar}>
            <span style={styles.statText}>
              {filteredRoutes.length} {filteredRoutes.length === 1 ? 'Route' : 'Routes'} Found
            </span>
          </div>
        </div>
      </div>

      {/* Routes List */}
      <div style={styles.content}>
        {filteredRoutes.length === 0 ? (
          <div style={styles.emptyState}>
            <FiMap size={64} color="#cbd5e1" />
            <h3 style={styles.emptyTitle}>
              {searchTerm ? 'No Routes Found' : 'No Routes Available'}
            </h3>
            <p style={styles.emptyText}>
              {searchTerm
                ? 'Try adjusting your search criteria or browse all routes.'
                : 'There are currently no routes available. Please check back later.'}
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
          <div style={styles.routeGrid}>
            {filteredRoutes.map((route) => (
              <div key={route.route_id} style={styles.routeCard}>
                {/* Route Name Badge */}
                <div style={styles.routeBadge}>
                  <FiMap size={18} color="#fff" />
                  <span style={styles.routeBadgeText}>
                    {route.route_name || `Route ${route.route_id}`}
                  </span>
                </div>

                {/* Journey Path */}
                <div style={styles.journeySection}>
                  {/* Start City */}
                  <div style={styles.locationBox}>
                    <div style={styles.locationIcon}>
                      <FiMapPin size={20} color="#10b981" />
                    </div>
                    <div style={styles.locationInfo}>
                      <span style={styles.locationLabel}>From</span>
                      <h3 style={styles.locationCity}>
                        {route.start_city || 'Not specified'}
                      </h3>
                    </div>
                  </div>

                  {/* Arrow Divider */}
                  <div style={styles.journeyArrow}>
                    <FiArrowRight size={32} color="#3b82f6" />
                  </div>

                  {/* End City */}
                  <div style={styles.locationBox}>
                    <div style={styles.locationIcon}>
                      <FiMapPin size={20} color="#ef4444" />
                    </div>
                    <div style={styles.locationInfo}>
                      <span style={styles.locationLabel}>To</span>
                      <h3 style={styles.locationCity}>
                        {route.end_city || 'Not specified'}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Route Details */}
                <div style={styles.detailsSection}>
                  {route.province && (
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Province:</span>
                      <span style={styles.detailValue}>{route.province}</span>
                    </div>
                  )}
                  {route.postal_code && (
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Postal Code:</span>
                      <span style={styles.detailValue}>{route.postal_code}</span>
                    </div>
                  )}
                </div>

                {/* Price Section */}
                {route.price && (
                  <div style={styles.priceSection}>
                    <FiDollarSign size={20} color="#10b981" />
                    <div style={styles.priceInfo}>
                      <span style={styles.priceLabel}>Fare</span>
                      <span style={styles.priceValue}>
                        Rs. {parseFloat(route.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #f0fdf4, #dbeafe)',
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
    borderTop: '4px solid #10b981',
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
    background: '#10b981',
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
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  routeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '24px',
  },
  routeCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  routeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 700,
    marginBottom: '24px',
    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
  },
  routeBadgeText: {
    fontSize: '15px',
  },
  journeySection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    gap: '12px',
  },
  locationBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
  },
  locationIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 500,
    marginBottom: '4px',
  },
  locationCity: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
  },
  journeyArrow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px',
  },
  detailLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 500,
  },
  detailValue: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: 600,
  },
  priceSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    borderRadius: '12px',
    border: '2px solid #6ee7b7',
  },
  priceInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  priceLabel: {
    fontSize: '14px',
    color: '#065f46',
    fontWeight: 600,
  },
  priceValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#065f46',
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
    border-color: #10b981 !important;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
  }
  
  @media (hover: hover) {
    .route-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15) !important;
    }
    
    button:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
  }
  
  @media (max-width: 768px) {
    .route-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);
