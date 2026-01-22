import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiFilter, FiDownload, FiDollarSign, FiCalendar } from 'react-icons/fi';
import axios from 'axios';
import '../pages/AdminDashboard.css';

export default function OperatorBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    confirmedBookings: 0,
    pendingBookings: 0
  });

  useEffect(() => {
    if (user?.user_id) {
      fetchOperatorBookings();
    }
  }, [user, filter, dateRange]);

  const fetchOperatorBookings = async () => {
    try {
      let url = `http://localhost/qrsys/api/get_operator_bookings.php?operator_id=${user.user_id}`;
      
      if (filter !== 'all') {
        url += `&filter=${filter}`;
      }
      
      if (dateRange.startDate && dateRange.endDate) {
        url += `&start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`;
      }

      const response = await axios.get(url);
      
      if (response.data.success) {
        setBookings(response.data.bookings);
        calculateStats(response.data.bookings);
      } else {
        console.error('Failed to fetch bookings:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching operator bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsList) => {
    const totalBookings = bookingsList.length;
    const totalRevenue = bookingsList.reduce((sum, booking) => 
      sum + parseFloat(booking.total_amount || 0), 0
    );
    const confirmedBookings = bookingsList.filter(b => b.booking_status === 'confirmed').length;
    const pendingBookings = bookingsList.filter(b => b.booking_status === 'pending').length;

    setStats({
      totalBookings,
      totalRevenue,
      confirmedBookings,
      pendingBookings
    });
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setLoading(true);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
    setLoading(true);
  };

  const clearDateFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
    setLoading(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Bookings & Revenue</h1>
          <p>Loading booking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Bookings & Revenue</h1>
          <p>Monitor bookings and earnings from your buses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-title">Total Bookings</p>
              <h2 className="stat-value">{stats.totalBookings}</h2>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#e3f2fd', color: '#3498db' }}>
              <FiCalendar size={32} />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-title">Total Revenue</p>
              <h2 className="stat-value">Rs. {stats.totalRevenue.toFixed(2)}</h2>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#fff3e0', color: '#f39c12' }}>
              <FiDollarSign size={32} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-title">Confirmed</p>
              <h2 className="stat-value">{stats.confirmedBookings}</h2>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#e8f5e9', color: '#2ecc71' }}>
              <FiCalendar size={32} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-title">Pending</p>
              <h2 className="stat-value">{stats.pendingBookings}</h2>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#fff9e6', color: '#f39c12' }}>
              <FiCalendar size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-section">
        <div className="filters-bar">
          <div className="filter-group">
            <label><FiFilter /> Filter by Status:</label>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
                onClick={() => handleFilterChange('today')}
              >
                Today
              </button>
              <button 
                className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
                onClick={() => handleFilterChange('month')}
              >
                This Month
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label><FiCalendar /> Custom Date Range:</label>
            <div className="date-range-inputs">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="form-control"
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="form-control"
              />
              {(dateRange.startDate || dateRange.endDate) && (
                <button className="btn-secondary" onClick={clearDateFilter}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="dashboard-section">
        {bookings.length === 0 ? (
          <div className="info-card">
            <p>No bookings found for the selected filters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference No</th>
                  <th>Bus Number</th>
                  <th>Route</th>
                  <th>Passenger</th>
                  <th>Travel Date</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Booked On</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.seat_booking_id}>
                    <td><strong>{booking.reference_no}</strong></td>
                    <td>{booking.bus_no}</td>
                    <td>{booking.route_name || 'N/A'}</td>
                    <td>{booking.passenger_name}</td>
                    <td>{booking.travel_date}</td>
                    <td>{booking.seat_no}</td>
                    <td>Rs. {parseFloat(booking.total_amount || 0).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(booking.booking_status)}`}>
                        {booking.booking_status}
                      </span>
                    </td>
                    <td>{new Date(booking.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
