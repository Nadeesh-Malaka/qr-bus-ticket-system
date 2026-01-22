import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export default function DriverProfile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/get_users.php?user_id=${user.user_id}`
      );
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setProfile(data[0]);
        setFormData(data[0]);
      } else {
        setProfile(user);
        setFormData(user);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(user);
      setFormData(user);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare clean data - only send fields that should be updated
      const updateData = {
        user_id: user.user_id,
        full_name: formData.full_name || '',
        gender: formData.gender || '',
        dob: formData.dob || '',
        nic: formData.nic || '',
        address1: formData.address1 || '',
        address2: formData.address2 || '',
        city: formData.city || '',
        mobile_no: formData.mobile_no || '',
        gmail: formData.gmail || formData.email || ''
      };
      
      const response = await fetch(`${API_BASE_URL}/update_user_profile.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned invalid response format');
      }

      const data = await response.json();
      
      if (data.success) {
        setProfile(updateData);
        setEditing(false);
        alert('Profile updated successfully!');
        // Refresh profile data
        fetchProfile();
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="driver-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#2d3748' }}>
        👤 Profile
      </h2>

      <div className="driver-profile-container">
        <div className="profile-avatar">
          {profile?.full_name?.charAt(0).toUpperCase() || '👤'}
        </div>

        {!editing ? (
          <>
            <div className="profile-field">
              <div className="profile-label">User ID</div>
              <div className="profile-value">{profile?.user_id}</div>
            </div>

            <div className="profile-field">
              <div className="profile-label">Full Name</div>
              <div className="profile-value">{profile?.full_name}</div>
            </div>

            <div className="profile-field">
              <div className="profile-label">Email</div>
              <div className="profile-value">{profile?.gmail || profile?.email || 'Not set'}</div>
            </div>

            <div className="profile-field">
              <div className="profile-label">Mobile Number</div>
              <div className="profile-value">{profile?.mobile_no || 'Not set'}</div>
            </div>

            <div className="profile-field">
              <div className="profile-label">NIC</div>
              <div className="profile-value">{profile?.nic || 'Not set'}</div>
            </div>

            <div className="profile-field">
              <div className="profile-label">Gender</div>
              <div className="profile-value" style={{ textTransform: 'capitalize' }}>
                {profile?.gender || 'Not set'}
              </div>
            </div>

            <div className="profile-field">
              <div className="profile-label">Address</div>
              <div className="profile-value">
                {profile?.address1 && profile?.address2 
                  ? `${profile.address1}, ${profile.address2}` 
                  : profile?.address1 || 'Not set'}
              </div>
            </div>

            <div className="profile-field">
              <div className="profile-label">City</div>
              <div className="profile-value">{profile?.city || 'Not set'}</div>
            </div>

            <div className="profile-field">
              <div className="profile-label">Role</div>
              <div className="profile-value" style={{ 
                textTransform: 'capitalize',
                color: '#667eea',
                fontWeight: '700'
              }}>
                Bus Driver
              </div>
            </div>

            <div className="profile-field">
              <div className="profile-label">Member Since</div>
              <div className="profile-value">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'N/A'}
              </div>
            </div>

            <button 
              className="driver-btn driver-btn-primary"
              onClick={() => setEditing(true)}
              style={{ width: '100%', marginTop: '10px' }}
            >
              ✏️ Edit Profile
            </button>
          </>
        ) : (
          <>
            <div className="profile-field">
              <div className="profile-label">Full Name</div>
              <input
                type="text"
                name="full_name"
                className="driver-input"
                value={formData.full_name || ''}
                onChange={handleInputChange}
                style={{ marginBottom: 0 }}
              />
            </div>

            <div className="profile-field">
              <div className="profile-label">Email</div>
              <input
                type="email"
                name="gmail"
                className="driver-input"
                value={formData.gmail || formData.email || ''}
                onChange={handleInputChange}
                style={{ marginBottom: 0 }}
              />
            </div>

            <div className="profile-field">
              <div className="profile-label">Mobile Number</div>
              <input
                type="tel"
                name="mobile_no"
                className="driver-input"
                value={formData.mobile_no || ''}
                onChange={handleInputChange}
                style={{ marginBottom: 0 }}
              />
            </div>

            <div className="profile-field">
              <div className="profile-label">Address Line 1</div>
              <input
                type="text"
                name="address1"
                className="driver-input"
                value={formData.address1 || ''}
                onChange={handleInputChange}
                style={{ marginBottom: 0 }}
              />
            </div>

            <div className="profile-field">
              <div className="profile-label">Address Line 2</div>
              <input
                type="text"
                name="address2"
                className="driver-input"
                value={formData.address2 || ''}
                onChange={handleInputChange}
                style={{ marginBottom: 0 }}
              />
            </div>

            <div className="profile-field">
              <div className="profile-label">City</div>
              <input
                type="text"
                name="city"
                className="driver-input"
                value={formData.city || ''}
                onChange={handleInputChange}
                style={{ marginBottom: 0 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                className="driver-btn driver-btn-success"
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 1 }}
              >
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
              <button 
                className="driver-btn driver-btn-secondary"
                onClick={() => {
                  setEditing(false);
                  setFormData(profile);
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      <button 
        className="driver-btn driver-btn-danger"
        onClick={handleLogout}
        style={{ width: '100%', marginTop: '20px' }}
      >
        🚪 Logout
      </button>
    </div>
  );
}
