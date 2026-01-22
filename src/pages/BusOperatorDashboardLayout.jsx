import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiTruck, FiMap, FiDollarSign, FiBarChart2,
  FiLogOut, FiHome, FiPackage
} from 'react-icons/fi';
import './AdminDashboard.css';

export default function BusOperatorDashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const navItems = [
    { path: '/operator/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { path: '/operator/buses', label: 'My Buses', icon: <FiTruck /> },
    { path: '/operator/bookings', label: 'Bookings', icon: <FiPackage /> },
    { path: '/operator/track', label: 'Track Buses', icon: <FiMap /> },
    { path: '/operator/reports', label: 'Reports', icon: <FiBarChart2 /> },
  ];

  const isActive = (path) => {
    if (path === '/operator/dashboard') {
      return location.pathname === '/operator/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FiTruck size={28} />
            <span>ExpressBook</span>
          </div>
          <div className="sidebar-subtitle">Bus Operator Panel</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.full_name?.charAt(0).toUpperCase() || 'O'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.full_name || 'Operator'}</p>
              <p className="user-role">Bus Operator</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
