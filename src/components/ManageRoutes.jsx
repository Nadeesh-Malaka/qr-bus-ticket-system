import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiMap } from 'react-icons/fi';
import '../pages/AdminDashboard.css';

export default function ManageRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    route_name: '',
    city: '',
    province: '',
    postal_code: ''
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await fetch('http://localhost/qrsys/api/route_api.php');
      const data = await response.json();
      setRoutes(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching routes:', error);
      setMessage({ type: 'error', text: 'Failed to fetch routes' });
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const action = editingRoute ? 'update' : 'create';
      const payload = {
        action,
        ...formData,
        ...(editingRoute && { route_id: editingRoute.route_id })
      };

      const response = await fetch('http://localhost/qrsys/api/route_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status) {
        setMessage({ 
          type: 'success', 
          text: editingRoute ? 'Route updated successfully' : 'Route added successfully'
        });
        fetchRoutes();
        closeModal();
      } else {
        setMessage({ type: 'error', text: result.message || 'Operation failed' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Server error occurred' });
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      route_name: route.route_name,
      city: route.city,
      province: route.province,
      postal_code: route.postal_code
    });
    setShowModal(true);
  };

  const handleDelete = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;

    try {
      const response = await fetch('http://localhost/qrsys/api/route_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          route_id: routeId
        })
      });

      const result = await response.json();

      if (result.status) {
        setMessage({ type: 'success', text: 'Route deleted successfully' });
        fetchRoutes();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to delete route' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Server error occurred' });
    }
  };

  const openAddModal = () => {
    setEditingRoute(null);
    setFormData({
      route_name: '',
      city: '',
      province: '',
      postal_code: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRoute(null);
    setFormData({
      route_name: '',
      city: '',
      province: '',
      postal_code: ''
    });
  };

  const filteredRoutes = routes.filter(route =>
    route.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.province?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Parse route name to get start and end cities
  const parseRouteName = (routeName) => {
    if (!routeName) return { start: '', end: '' };
    const parts = routeName.split('_');
    if (parts.length < 2) return { start: '', end: routeName };
    const cities = parts[1].split('-');
    return { 
      start: cities[0]?.trim() || '', 
      end: cities[1]?.trim() || '' 
    };
  };

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="page-header">
        <h1>Manage Routes</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={openAddModal}>
            <FiPlus />
            <span>Add Route</span>
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Search Bar */}
      <div className="dashboard-section">
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <FiSearch style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b'
          }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      {/* Routes Table */}
      <div className="data-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="empty-state">
            <FiMap size={48} />
            <h3>No routes found</h3>
            <p>Start by adding your first route</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Route ID</th>
                <th>Start City</th>
                <th>End City</th>
                <th>Province</th>
                <th>Postal Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map((route) => {
                const { start, end } = parseRouteName(route.route_name);
                return (
                  <tr key={route.route_id}>
                    <td>{route.route_name?.split('_')[0] || '-'}</td>
                    <td>{start || route.city}</td>
                    <td>{end || '-'}</td>
                    <td>{route.province}</td>
                    <td>{route.postal_code}</td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-edit"
                          onClick={() => handleEdit(route)}
                        >
                          <FiEdit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDelete(route.route_id)}
                        >
                          <FiTrash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRoute ? 'Edit Route' : 'Add New Route'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label required">Route Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., 100-Panadura"
                    value={formData.route_name}
                    onChange={(e) => setFormData({...formData, route_name: e.target.value})}
                    required
                  />
                  <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Format: Route Number_Start City - End City
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label required">City / Stops</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Pettah - Panadura"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">Province</label>
                    <select
                      className="form-select"
                      value={formData.province}
                      onChange={(e) => setFormData({...formData, province: e.target.value})}
                      required
                    >
                      <option value="">Select Province</option>
                      <option value="Western">Western</option>
                      <option value="Central">Central</option>
                      <option value="Southern">Southern</option>
                      <option value="Northern">Northern</option>
                      <option value="Eastern">Eastern</option>
                      <option value="North Western">North Western</option>
                      <option value="North Central">North Central</option>
                      <option value="Uva">Uva</option>
                      <option value="Sabaragamuwa">Sabaragamuwa</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Postal Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., 12500"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingRoute ? 'Update Route' : 'Add Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
