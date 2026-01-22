import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles.css";

export default function Users() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    fullname: "",
    gender: "",
    dob: "",
    nic: "",
    address1: "",
    address2: "",
    city: "",
    mobile: "",
    gmail: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors

    try {
      const response = await fetch(
        "http://localhost/qrsys/api/register_api.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (result.status) {
        // Show success notification
        setShowSuccess(true);
        
        // Clear form
        setFormData({
          fullname: "",
          gender: "",
          dob: "",
          nic: "",
          address1: "",
          address2: "",
          city: "",
          mobile: "",
          gmail: "",
          password: ""
        });

        // Check if there's a redirect URL stored (from booking flow)
        const redirectUrl = sessionStorage.getItem('redirectAfterSignup');
        
        // Navigate after 2 seconds
        setTimeout(() => {
          if (redirectUrl) {
            // Clear the stored URL
            sessionStorage.removeItem('redirectAfterSignup');
            // Redirect back to booking page
            navigate(redirectUrl);
          } else {
            // Default: go to home
            navigate("/home");
          }
        }, 2000);
      } else {
        setErrorMessage(result.message || "Registration Failed");
      }

    } catch (error) {
      setErrorMessage("Server Error: Unable to connect to server");
      console.error(error);
    }
  };

  return (
    <div className="main-center">
      {/* Success Notification */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span style={{ fontSize: '24px' }}>✓</span>
          <div>
            <strong>Registration Successful!</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
              Account created as Passenger. Redirecting to login...
            </p>
          </div>
        </div>
      )}
{/* Error Notification */}
      {errorMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span style={{ fontSize: '24px' }}>✕</span>
          <div>
            <strong>Registration Failed</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
              {errorMessage}
            </p>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            style={{
              marginLeft: '10px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}

      
      <div className="form-container">
        <form onSubmit={handleSubmit}>

          <h2 className="form-title">User Registration</h2>

          <label className="form-label">Full Name*</label>
          <input
            type="text"
            name="fullname"
            className="form-input"
            value={formData.fullname}
            onChange={handleChange}
            required
          />

          <label className="form-label">Gender*</label>
          <select
            name="gender"
            className="form-select"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <label className="form-label">Date of Birth*</label>
          <input
            type="date"
            name="dob"
            className="form-input"
            value={formData.dob}
            onChange={handleChange}
            required
          />

          <label className="form-label">NIC Number*</label>
          <input
            type="text"
            name="nic"
            className="form-input"
            value={formData.nic}
            onChange={handleChange}
            required
          />

          <label className="form-label">Street Address (Line 1)*</label>
          <input
            type="text"
            name="address1"
            className="form-input"
            value={formData.address1}
            onChange={handleChange}
            required
          />

          <label className="form-label">Street Address (Line 2)</label>
          <input
            type="text"
            name="address2"
            className="form-input"
            value={formData.address2}
            onChange={handleChange}
          />

          <label className="form-label">City / Town*</label>
          <input
            type="text"
            name="city"
            className="form-input"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <label className="form-label">Contact Number*</label>
          <input
            type="tel"
            name="mobile"
            className="form-input"
            value={formData.mobile}
            onChange={handleChange}
            required
          />

          <label className="form-label">Gmail*</label>
          <input
            type="gmail"
            name="gmail"
            className="form-input"
            value={formData.gmail}
            onChange={handleChange}
            required
          />

          <label className="form-label">Password*</label>
          <input
            type="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="form-checkbox-row">
            <input type="checkbox" required />
            <span>I confirm these information are accurate.</span>
          </div>

          <button type="submit" className="form-btn">
            Register Now
          </button>

        </form>
      </div>
    </div>
  );
}