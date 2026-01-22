import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Footer from '../components/Footer';

// Helper function to normalize user_id format (ensure proper padding)
const normalizeUserId = (userId) => {
  if (!userId) return userId;
  
  // Extract prefix (PAS, DRV, etc.) and numeric part
  const match = userId.match(/^([A-Z]+)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const number = match[2];
    // Ensure numeric part is 6 digits with leading zeros
    return prefix + number.padStart(6, '0');
  }
  return userId;
};

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profileData, setProfileData] = useState({
    full_name: "",
    gender: "",
    dob: "",
    nic: "",
    address1: "",
    address2: "",
    city: "",
    mobile_no: "",
    gmail: ""
  });

  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  useEffect(() => {
    // Check if there are any changes
    const changed = JSON.stringify(profileData) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [profileData, originalData]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const normalizedUserId = normalizeUserId(user.user_id);
      console.log("Loading profile for user_id:", user.user_id, "-> normalized:", normalizedUserId);
      const response = await fetch(`http://localhost/qrsys/api/get_users.php?user_id=${normalizedUserId}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const userData = data[0];
        const profileInfo = {
          full_name: userData.full_name || "",
          gender: userData.gender || "",
          dob: userData.dob || "",
          nic: userData.nic || "",
          address1: userData.address1 || "",
          address2: userData.address2 || "",
          city: userData.city || "",
          mobile_no: userData.mobile_no || "",
          gmail: userData.gmail || ""
        };
        setProfileData(profileInfo);
        setOriginalData(profileInfo);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      showMessage('error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const normalizedUserId = normalizeUserId(user.user_id);
      console.log("Saving profile for user_id:", user.user_id, "-> normalized:", normalizedUserId);

      const response = await fetch('http://localhost/qrsys/api/update_user_profile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: normalizedUserId,
          ...profileData
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOriginalData(profileData);
        setIsEditing(false);
        showMessage('success', 'Profile updated successfully!');
        
        // Update auth context if needed
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showMessage('error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage('error', 'Server error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 4000);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Loading profile...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ flex: 1, padding: '40px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Message Notification */}
          {message.text && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545',
              color: 'white',
              padding: '15px 25px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'slideIn 0.3s ease-out',
              maxWidth: '400px'
            }}>
              <span style={{ fontSize: '24px' }}>
                {message.type === 'success' ? '✓' : '✕'}
              </span>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>{message.text}</span>
            </div>
          )}

          {/* Header Section */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 35px',
            borderRadius: '20px 20px 0 0',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                backdropFilter: 'blur(10px)'
              }}>
                👤
              </div>
              <div>
                <h1 style={{
                  margin: 0,
                  fontSize: '32px',
                  fontWeight: '700',
                  letterSpacing: '-0.5px'
                }}>
                  {isEditing ? 'Edit Profile' : 'My Profile'}
                </h1>
                <p style={{
                  margin: '8px 0 0 0',
                  fontSize: '15px',
                  opacity: 0.95
                }}>
                  User ID: {user?.user_id} | {user?.user_type || 'Passenger'}
                </p>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={handleEdit}
                style={{
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#667eea',
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                }}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {/* Form Section */}
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '0 0 20px 20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
          }}>

            {/* Personal Information Section */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '25px',
                paddingBottom: '12px',
                borderBottom: '2px solid #e2e8f0',
                letterSpacing: '-0.3px'
              }}>
                Personal Information
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '25px'
              }}>
                {/* Full Name */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#334155'
                  }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={profileData.full_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.3s',
                      backgroundColor: isEditing ? '#ffffff' : '#f8fafc',
                      cursor: isEditing ? 'text' : 'not-allowed',
                      color: '#1e293b'
                    }}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#334155'
                  }}>
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.3s',
                      backgroundColor: isEditing ? '#ffffff' : '#f8fafc',
                      cursor: isEditing ? 'pointer' : 'not-allowed',
                      color: '#1e293b'
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#334155'
                  }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={profileData.dob}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.3s',
                      backgroundColor: isEditing ? '#ffffff' : '#f8fafc',
                      cursor: isEditing ? 'text' : 'not-allowed',
                      color: '#1e293b'
                    }}
                  />
                </div>

                {/* NIC */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#334155'
                  }}>
                    NIC Number
                  </label>
                  <input
                    type="text"
                    name="nic"
                    value={profileData.nic}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.3s',
                      backgroundColor: isEditing ? '#ffffff' : '#f8fafc',
                      cursor: isEditing ? 'text' : 'not-allowed',
                      color: '#1e293b'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '25px',
                paddingBottom: '12px',
                borderBottom: '2px solid #e2e8f0',
                letterSpacing: '-0.3px'
              }}>
                Contact Information
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '25px'
              }}>
                {/* Address Line 1 */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#334155'
                  }}>
                    Street Address (Line 1)
                  </label>
                  <input
                    type="text"
                    name="address1"
                    value={profileData.address1}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.3s',
                      backgroundColor: isEditing ? '#ffffff' : '#f8fafc',
                      cursor: isEditing ? 'text' : 'not-allowed',
                      color: '#1e293b'
                    }}
                  />
                </div>

                {/* Address Line 2 */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#334155'
                  }}>
                    Street Address (Line 2)
                  </label>
                  <input
                    type="text"
                    name="address2"
                    value={profileData.address2}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.3s',
                      backgroundColor: isEditing ? '#ffffff' : '#f8fafc',
                      cursor: isEditing ? 'text' : 'not-allowed',
                      color: '#1e293b'
                    }}
                  />
                </div>

                {/* City */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#334155'
                  }}>
                    City / Town
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={profileData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.3s',
                      backgroundColor: isEditing ? '#ffffff' : '#f8fafc',
                      cursor: isEditing ? 'text' : 'not-allowed',
                      color: '#1e293b'
                    }}
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#334155'
                  }}>
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile_no"
                    value={profileData.mobile_no}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.3s',
                      backgroundColor: isEditing ? '#ffffff' : '#f8fafc',
                      cursor: isEditing ? 'text' : 'not-allowed',
                      color: '#1e293b'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '25px',
                paddingBottom: '12px',
                borderBottom: '2px solid #e2e8f0',
                letterSpacing: '-0.3px'
              }}>
                Account Information
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '25px'
              }}>
                {/* Email */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#334155'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="gmail"
                    value={profileData.gmail}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.3s',
                      backgroundColor: isEditing ? '#ffffff' : '#f8fafc',
                      cursor: isEditing ? 'text' : 'not-allowed',
                      color: '#1e293b'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'flex-end',
                paddingTop: '20px',
                borderTop: '2px solid #e2e8f0'
              }}>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  style={{
                    padding: '14px 32px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#64748b',
                    backgroundColor: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    opacity: saving ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.borderColor = '#cbd5e1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!saving) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#e2e8f0';
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  style={{
                    padding: '14px 32px',
                    fontSize: '15px',
                    fontWeight: '700',
                    color: 'white',
                    background: (saving || !hasChanges) 
                      ? '#94a3b8' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: (saving || !hasChanges) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: (saving || !hasChanges) 
                      ? 'none' 
                      : '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    if (!saving && hasChanges) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!saving && hasChanges) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* Info Message */}
            {!isEditing && (
              <div style={{
                marginTop: '30px',
                padding: '16px 20px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>ℹ️</span>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#0369a1',
                  fontWeight: '500'
                }}>
                  Click "Edit Profile" to update your information
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
