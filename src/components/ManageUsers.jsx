import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUsers, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import '../pages/AdminDashboard.css';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [changingRole, setChangingRole] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    nic: '',
    mobile_no: '',
    city: '',
    gmail: '',
    password: '',
    user_type: 'passenger'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost/qrsys/api/get_users.php');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to fetch users' });
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        action: editingUser ? 'update' : 'create',
        ...formData,
        ...(editingUser && { id: editingUser.id })
      };

      const response = await fetch('http://localhost/qrsys/api/user_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status) {
        setMessage({ 
          type: 'success', 
          text: editingUser ? 'User updated successfully' : 'User added successfully'
        });
        fetchUsers();
        closeModal();
      } else {
        setMessage({ type: 'error', text: result.message || 'Operation failed' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Server error occurred' });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || '',
      gender: user.gender || '',
      nic: user.nic || '',
      mobile_no: user.mobile_no || '',
      city: user.city || '',
      gmail: user.gmail || '',
      password: '',
      user_type: (user.user_type || 'passenger').replace(/_/g, ' ')
    });
    setShowModal(true);
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?\n\nThis action cannot be undone.`)) return;

    try {
      const response = await fetch('http://localhost/qrsys/api/user_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id: userId
        })
      });

      const result = await response.json();

      if (result.status) {
        setMessage({ type: 'success', text: 'User deleted successfully' });
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to delete user' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Server error occurred' });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change user role to "${newRole}"?`)) {
      setChangingRole(null);
      return;
    }

    try {
      const response = await fetch('http://localhost/qrsys/api/update_user_role.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          user_type: newRole
        })
      });

      const result = await response.json();

      if (result.status) {
        setMessage({ type: 'success', text: 'User role updated successfully' });
        fetchUsers();
        setChangingRole(null);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update role' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Server error occurred' });
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      full_name: '',
      gender: '',
      nic: '',
      mobile_no: '',
      city: '',
      gmail: '',
      password: '',
      user_type: 'passenger'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const getRoleBadge = (role) => {
    // Normalize role to handle both formats
    const normalizedRole = role?.toLowerCase().replace(/_/g, ' ').trim();
    
    const roleStyles = {
      admin: { bg: '#ef4444', label: 'Administrator' },
      'bus operator': { bg: '#f59e0b', label: 'Bus Operator' },
      'bus driver': { bg: '#06b6d4', label: 'Bus Driver' },
      passenger: { bg: '#10b981', label: 'Passenger' }
    };

    const style = roleStyles[normalizedRole] || roleStyles.passenger;

    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: '6px',
        background: style.bg,
        color: 'white',
        fontSize: '12px',
        fontWeight: 500,
        display: 'inline-block'
      }}>
        {style.label}
      </span>
    );
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.gmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Manage Users</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            View, create, and manage user accounts with role assignments
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={openAddModal}>
            <FiPlus />
            <span>Add User</span>
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
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="data-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <FiUsers size={48} />
            <h3>No users found</h3>
            <p>Start by adding your first user</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Gender</th>
                <th>NIC</th>
                <th>City</th>
                <th>Mobile</th>
                <th>User Type</th>
                <th>Gmail</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.user_id || `PAS${String(user.id).padStart(6, '0')}`}</strong></td>
                  <td>{user.full_name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{user.gender}</td>
                  <td>{user.nic}</td>
                  <td>{user.city}</td>
                  <td>{user.mobile_no}</td>
                  <td>
                    {changingRole === user.id ? (
                      <select
                        defaultValue={user.user_type?.replace(/_/g, ' ')}
                        onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                        onBlur={() => setChangingRole(null)}
                        autoFocus
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '2px solid #3b82f6',
                          fontSize: '13px',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="passenger">Passenger</option>
                        <option value="bus driver">Bus Driver</option>
                        <option value="bus operator">Bus Operator</option>
                        <option value="admin">Administrator</option>
                      </select>
                    ) : (
                      <div onClick={() => setChangingRole(user.id)} style={{ cursor: 'pointer' }}>
                        {getRoleBadge(user.user_type)}
                      </div>
                    )}
                  </td>
                  <td>{user.gmail}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(user)}
                      >
                        <FiEdit2 size={14} />
                        <span>Edit</span>
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(user.id, user.full_name)}
                      >
                        <FiTrash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Personal Information Section */}
                <div style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FiUsers size={16} />
                    Personal Information
                  </h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label required">Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., John Doe"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Gender</label>
                      <select
                        className="form-select"
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label required">NIC Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., 200112345678"
                        value={formData.nic}
                        onChange={(e) => setFormData({...formData, nic: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">City</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Polgasowita"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div style={{
                  background: '#eff6ff',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  border: '1px solid #bfdbfe'
                }}>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#1e40af',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FiPhone size={16} />
                    Contact Information
                  </h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label required">Mobile Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="e.g., 0771234567"
                        value={formData.mobile_no}
                        onChange={(e) => setFormData({...formData, mobile_no: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="e.g., user@gmail.com"
                        value={formData.gmail}
                        onChange={(e) => setFormData({...formData, gmail: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Account Security Section */}
                <div style={{
                  background: '#fef2f2',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  border: '1px solid #fecaca'
                }}>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#991b1b',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🔐 Account Security & Role
                  </h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label required">Password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required={!editingUser}
                      />
                      {editingUser && (
                        <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                          Leave empty to keep the current password
                        </small>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label required">User Role</label>
                      <select
                        className="form-select"
                        value={formData.user_type}
                        onChange={(e) => setFormData({...formData, user_type: e.target.value})}
                        required
                      >
                        <option value="passenger">Passenger</option>
                        <option value="bus driver">Bus Driver</option>
                        <option value="bus operator">Bus Operator</option>
                        <option value="admin">Administrator</option>
                      </select>
                      <small style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        ⚠️ Admin only - Role determines system permissions
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
