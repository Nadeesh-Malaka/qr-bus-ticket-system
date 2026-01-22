import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiTruck, FiCalendar, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import './AdminDashboard.css';

export default function AdminDashboardMain() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuses: 0,
    bookingsToday: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch stats from admin stats API
      const response = await fetch('http://localhost/qrsys/api/get_admin_stats.php');
      const result = await response.json();

      if (result.success) {
        setStats({
          totalUsers: result.data.totalUsers,
          totalBuses: result.data.totalBuses,
          bookingsToday: result.data.todayBookings,
          revenue: result.data.todayRevenue
        });
      } else {
        console.error('Error fetching stats:', result.message);
        // Use fallback values
        setStats({
          totalUsers: 0,
          totalBuses: 0,
          bookingsToday: 0,
          revenue: 0
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use fallback values
      setStats({
        totalUsers: 0,
        totalBuses: 0,
        bookingsToday: 0,
        revenue: 0
      });
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon user-icon">
            <FiUsers size={24} />
          </div>
          <div className="stat-details">
            <div className="stat-change positive">
              <FiTrendingUp size={16} />
              <span>+12%</span>
            </div>
            <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bus-icon">
            <FiTruck size={24} />
          </div>
          <div className="stat-details">
            <div className="stat-change positive">
              <FiTrendingUp size={16} />
              <span>+5%</span>
            </div>
            <div className="stat-value">{stats.totalBuses}</div>
            <div className="stat-label">Total Buses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon booking-icon">
            <FiCalendar size={24} />
          </div>
          <div className="stat-details">
            <div className="stat-change positive">
              <FiTrendingUp size={16} />
              <span>+23%</span>
            </div>
            <div className="stat-value">{stats.bookingsToday}</div>
            <div className="stat-label">Bookings Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue-icon">
            <FiDollarSign size={24} />
          </div>
          <div className="stat-details">
            <div className="stat-change positive">
              <FiTrendingUp size={16} />
              <span>+18%</span>
            </div>
            <div className="stat-value">
              Rs. {stats.revenue >= 1000000 
                ? `${(stats.revenue / 1000000).toFixed(1)}M` 
                : stats.revenue >= 1000 
                  ? `${(stats.revenue / 1000).toFixed(1)}K`
                  : stats.revenue.toLocaleString()}
            </div>
            <div className="stat-label">Revenue</div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <button className="action-btn" onClick={() => navigate('/admin/routes')}>
            <FiTruck />
            <span>Manage Routes</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/admin/buses')}>
            <FiTruck />
            <span>Manage Buses</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/admin/users')}>
            <FiUsers />
            <span>Manage Users</span>
          </button>
        </div>
      </div>
    </div>
  );
}
