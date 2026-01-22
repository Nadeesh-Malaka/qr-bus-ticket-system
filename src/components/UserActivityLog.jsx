import React, { useState, useEffect } from 'react';
import { 
  FiActivity, FiSearch, FiFilter, FiCalendar, FiUser, 
  FiRefreshCw, FiDownload 
} from 'react-icons/fi';
import '../pages/AdminDashboard.css';

export default function UserActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    user_id: '',
    activity_type: '',
    start_date: '',
    end_date: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    bookings: 0,
    payments: 0
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.activity_type) params.append('activity_type', filters.activity_type);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      const response = await fetch(`http://localhost/qrsys/api/get_activity_logs.php?${params}`);
      const data = await response.json();
      
      if (data.status) {
        setLogs(data.data || []);
        calculateStats(data.data || []);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch activity logs' });
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setMessage({ type: 'error', text: 'Server error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logsData) => {
    const today = new Date().toISOString().split('T')[0];
    
    const todayLogs = logsData.filter(log => 
      log.created_at.startsWith(today)
    );
    
    const bookingLogs = logsData.filter(log => 
      log.activity_type.includes('BOOKING')
    );
    
    const paymentLogs = logsData.filter(log => 
      log.activity_type.includes('PAYMENT')
    );

    setStats({
      total: logsData.length,
      today: todayLogs.length,
      bookings: bookingLogs.length,
      payments: paymentLogs.length
    });
  };

  const handleSearch = () => {
    fetchLogs();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    fetchLogs();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      user_id: '',
      activity_type: '',
      start_date: '',
      end_date: ''
    });
    setSearchTerm('');
  };

  const handleRefresh = () => {
    clearFilters();
    fetchLogs();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityBadgeClass = (activityType) => {
    if (activityType.includes('BOOKING')) return 'badge-booking';
    if (activityType.includes('PAYMENT')) return 'badge-payment';
    if (activityType.includes('PROFILE')) return 'badge-profile';
    if (activityType.includes('LOGIN')) return 'badge-login';
    if (activityType.includes('REGISTER')) return 'badge-register';
    return 'badge-default';
  };

  const formatActivityType = (type) => {
    return type.replace(/_/g, ' ');
  };

  const exportToCSV = () => {
    if (logs.length === 0) {
      setMessage({ type: 'error', text: 'No data to export' });
      return;
    }

    const headers = ['Log ID', 'User ID', 'User Name', 'Activity Type', 'Description', 'IP Address', 'Date & Time'];
    const csvData = logs.map(log => [
      log.log_id,
      log.user_id,
      log.full_name || 'N/A',
      log.activity_type,
      log.activity_description,
      log.ip_address || 'N/A',
      formatDate(log.created_at)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_activity_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setMessage({ type: 'success', text: 'Activity log exported successfully' });
  };

  return (
    <div className="admin-content">
      {/* Header */}
      <div className="admin-header">
        <div className="header-left">
          <FiActivity size={28} />
          <div>
            <h2>User Activity Log</h2>
            <p>Monitor and track all user activities in the system</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-action" onClick={exportToCSV} title="Export to CSV">
            <FiDownload />
            <span>Export</span>
          </button>
          <button className="btn-refresh" onClick={handleRefresh} title="Refresh">
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FiActivity />
          </div>
          <div className="stat-details">
            <p className="stat-label">Total Activities</p>
            <h3 className="stat-value">{stats.total}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <FiCalendar />
          </div>
          <div className="stat-details">
            <p className="stat-label">Today's Activities</p>
            <h3 className="stat-value">{stats.today}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <FiUser />
          </div>
          <div className="stat-details">
            <p className="stat-label">Booking Activities</p>
            <h3 className="stat-value">{stats.bookings}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <FiActivity />
          </div>
          <div className="stat-details">
            <p className="stat-label">Payment Activities</p>
            <h3 className="stat-value">{stats.payments}</h3>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })} className="alert-close">×</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="content-card">
        <div className="search-filter-bar">
          <div className="search-box-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by User ID, Name, or Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
          </div>
          <div className="filter-actions">
            <button 
              className={`btn-filter ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter />
              <span>Filters</span>
            </button>
            <button className="btn-primary" onClick={handleSearch}>
              <FiSearch />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-grid">
              <div className="form-group">
                <label>User ID</label>
                <input
                  type="text"
                  placeholder="Enter User ID"
                  value={filters.user_id}
                  onChange={(e) => handleFilterChange('user_id', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Activity Type</label>
                <select
                  value={filters.activity_type}
                  onChange={(e) => handleFilterChange('activity_type', e.target.value)}
                  className="form-control"
                >
                  <option value="">All Activities</option>
                  <option value="BOOKING_CREATED">Booking Created</option>
                  <option value="PAYMENT_COMPLETED">Payment Completed</option>
                  <option value="PROFILE_UPDATED">Profile Updated</option>
                  <option value="LOGIN">Login</option>
                  <option value="REGISTER">Register</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            <div className="filter-actions-bottom">
              <button className="btn-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
              <button className="btn-primary" onClick={applyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Activity Log Table */}
      <div className="content-card">
        <div className="table-header">
          <h3>Activity Records</h3>
          <p className="text-muted">Showing {logs.length} activities</p>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <FiActivity size={48} />
            <h3>No Activity Logs Found</h3>
            <p>There are no activity records matching your criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>User Name</th>
                  <th>Activity Type</th>
                  <th>Description</th>
                  <th>IP Address</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.log_id} className="table-row-hover">
                    <td>
                      <span className="user-id-badge">{log.user_id}</span>
                    </td>
                    <td>
                      <div className="user-info-cell">
                        <strong>{log.full_name || 'Unknown User'}</strong>
                        <small className="text-muted">{log.user_type || 'N/A'}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`activity-badge ${getActivityBadgeClass(log.activity_type)}`}>
                        {formatActivityType(log.activity_type)}
                      </span>
                    </td>
                    <td className="description-cell">
                      {log.activity_description}
                    </td>
                    <td>
                      <span className="ip-address">{log.ip_address || 'N/A'}</span>
                    </td>
                    <td className="date-cell">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-content {
          padding: 0;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-left svg {
          color: #4a90e2;
        }

        .header-left h2 {
          margin: 0;
          font-size: 1.75rem;
          color: #2c3e50;
        }

        .header-left p {
          margin: 0.25rem 0 0 0;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.25rem;
          background: #4a90e2;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .btn-action:hover {
          background: #357abd;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
        }

        .btn-refresh {
          padding: 0.65rem;
          background: #ecf0f1;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: #34495e;
          transition: all 0.3s ease;
        }

        .btn-refresh:hover {
          background: #bdc3c7;
          transform: rotate(180deg);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .stat-icon.blue { background: linear-gradient(135deg, #4a90e2, #357abd); }
        .stat-icon.green { background: linear-gradient(135deg, #27ae60, #229954); }
        .stat-icon.orange { background: linear-gradient(135deg, #f39c12, #d68910); }
        .stat-icon.purple { background: linear-gradient(135deg, #9b59b6, #8e44ad); }

        .stat-details {
          flex: 1;
        }

        .stat-label {
          margin: 0 0 0.5rem 0;
          color: #7f8c8d;
          font-size: 0.875rem;
        }

        .stat-value {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #2c3e50;
        }

        .alert {
          padding: 1rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .alert-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: inherit;
          opacity: 0.7;
        }

        .alert-close:hover {
          opacity: 1;
        }

        .content-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .search-filter-bar {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-box-wrapper {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #7f8c8d;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 2px solid #ecf0f1;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .filter-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-filter {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: white;
          border: 2px solid #ecf0f1;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          color: #34495e;
        }

        .btn-filter:hover,
        .btn-filter.active {
          border-color: #4a90e2;
          color: #4a90e2;
          background: #f8fbff;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #4a90e2;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background: #357abd;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
        }

        .btn-secondary {
          padding: 0.75rem 1.5rem;
          background: #ecf0f1;
          color: #34495e;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: #bdc3c7;
        }

        .filter-panel {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 2px solid #ecf0f1;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #34495e;
        }

        .form-control {
          padding: 0.65rem;
          border: 2px solid #ecf0f1;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .filter-actions-bottom {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding-top: 1rem;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .table-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #2c3e50;
        }

        .text-muted {
          color: #7f8c8d;
          font-size: 0.875rem;
        }

        .loading-spinner {
          text-align: center;
          padding: 3rem;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #ecf0f1;
          border-top-color: #4a90e2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #7f8c8d;
        }

        .empty-state svg {
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .admin-table thead {
          background: #f8f9fa;
        }

        .admin-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #34495e;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #ecf0f1;
        }

        .admin-table td {
          padding: 1rem;
          border-bottom: 1px solid #ecf0f1;
          vertical-align: middle;
        }

        .table-row-hover:hover {
          background: #f8fbff;
        }

        .user-id-badge {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          background: #e3f2fd;
          color: #1976d2;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .user-info-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .user-info-cell strong {
          color: #2c3e50;
        }

        .user-info-cell small {
          font-size: 0.75rem;
          text-transform: capitalize;
        }

        .activity-badge {
          display: inline-block;
          padding: 0.4rem 0.85rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .badge-booking {
          background: #e3f2fd;
          color: #1976d2;
        }

        .badge-payment {
          background: #e8f5e9;
          color: #388e3c;
        }

        .badge-profile {
          background: #fff3e0;
          color: #f57c00;
        }

        .badge-login {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .badge-register {
          background: #e0f2f1;
          color: #00695c;
        }

        .badge-default {
          background: #ecf0f1;
          color: #34495e;
        }

        .description-cell {
          max-width: 400px;
          color: #34495e;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .ip-address {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #7f8c8d;
        }

        .date-cell {
          white-space: nowrap;
          color: #34495e;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .search-filter-bar {
            flex-direction: column;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .table-responsive {
            overflow-x: scroll;
          }

          .admin-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
}
