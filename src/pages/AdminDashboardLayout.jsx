import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiTruck, FiUsers, FiBarChart2, FiMessageSquare,
  FiLogOut, FiHome, FiMap, FiActivity
} from 'react-icons/fi';
import './AdminDashboard.css';

export default function AdminDashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <FiHome /> },
    { path: '/admin/routes', label: 'Manage Routes', icon: <FiMap /> },
    { path: '/admin/buses', label: 'Manage Buses', icon: <FiTruck /> },
    { path: '/admin/users', label: 'Manage Users', icon: <FiUsers /> },
    { path: '/admin/activity-log', label: 'User Activity', icon: <FiActivity /> },
    { path: '/admin/reports', label: 'Reports', icon: <FiBarChart2 /> },
    { path: '/admin/feedback', label: 'Feedback', icon: <FiMessageSquare /> },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
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
          <div className="sidebar-subtitle">Admin Panel</div>
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
              {user?.full_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.full_name || 'Admin'}</p>
              <p className="user-role">{user?.role || 'Administrator'}</p>
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
