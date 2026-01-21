import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiTruck, FiDollarSign, FiPackage, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';
import './AdminDashboard.css';

export default function BusOperatorDashboardMain() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBuses: 0,
    todayBookings: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    loading: true
  });

  useEffect(() => {
    if (user?.user_id) {
      fetchOperatorStats();
    }
  }, [user]);

  const fetchOperatorStats = async () => {
    try {
      const response = await axios.get(
        `http://localhost/qrsys/api/get_operator_stats.php?operator_id=${user.user_id}`
      );
      
      if (response.data.success) {
        setStats({
          ...response.data.data,
          loading: false
        });
      } else {
        console.error('Failed to fetch stats:', response.data.message);
        setStats(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching operator stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    {
      title: 'Total Assigned Buses',
      value: stats.totalBuses,
      icon: <FiTruck size={32} />,
      color: '#3498db',
      bgColor: '#e3f2fd'
    },
    {
      title: "Today's Bookings",
      value: stats.todayBookings,
      icon: <FiPackage size={32} />,
      color: '#2ecc71',
      bgColor: '#e8f5e9'
    },
    {
      title: "Today's Revenue",
      value: `Rs. ${parseFloat(stats.todayRevenue || 0).toFixed(2)}`,
      icon: <FiDollarSign size={32} />,
      color: '#f39c12',
      bgColor: '#fff3e0'
    },
    {
      title: 'Monthly Revenue',
      value: `Rs. ${parseFloat(stats.monthlyRevenue || 0).toFixed(2)}`,
      icon: <FiTrendingUp size={32} />,
      color: '#9b59b6',
      bgColor: '#f3e5f5'
    }
  ];

  if (stats.loading) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Bus Operator Dashboard</h1>
          <p>Loading your statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Bus Operator Dashboard</h1>
          <p>Welcome back, {user?.full_name || 'Operator'}!</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-content">
              <div className="stat-info">
                <p className="stat-title">{card.title}</p>
                <h2 className="stat-value">{card.value}</h2>
              </div>
              <div 
                className="stat-icon" 
                style={{ 
                  backgroundColor: card.bgColor,
                  color: card.color 
                }}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Info Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Quick Overview</h2>
        </div>
        <div className="info-cards-grid">
          <div className="info-card">
            <h3>Business Performance</h3>
            <p>Your buses are performing well this month with a total of {stats.monthlyBookings || 0} bookings.</p>
            <ul style={{ marginTop: '15px', paddingLeft: '20px' }}>
              <li>Average daily bookings: {Math.round((stats.monthlyBookings || 0) / 30)}</li>
              <li>Revenue per bus: Rs. {stats.totalBuses > 0 ? (stats.monthlyRevenue / stats.totalBuses).toFixed(2) : '0.00'}</li>
            </ul>
          </div>
          <div className="info-card">
            <h3>Fleet Management</h3>
            <p>You are currently managing {stats.totalBuses} bus{stats.totalBuses !== 1 ? 'es' : ''} across multiple routes.</p>
            <p style={{ marginTop: '10px' }}>Keep your fleet information updated for better service quality.</p>
          </div>
        </div>
      </div>

      {/* Instructions
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Getting Started</h2>
        </div>
        <div className="info-card">
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li><strong>My Buses:</strong> View and manage your assigned buses</li>
            <li><strong>Bookings:</strong> Monitor bookings and revenue for your buses</li>
            <li><strong>Track Buses:</strong> View real-time location of your fleet</li>
            <li><strong>Reports:</strong> Generate monthly income and performance reports</li>
          </ul>
        </div>
      </div> */}

    </div>
  );
}
