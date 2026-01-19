import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles.css";

export default function SignupModal({ show, onClose }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    nic: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Send JSON data matching backend expectations
    const payload = {
      fullname: formData.fullName,
      mobile: formData.phoneNumber,
      nic: formData.nic,
      address1: formData.address,
      address2: "",
      city: "",
      gender: "",
      dob: "",
      gmail: formData.email,
      password: formData.password,
    };

    try {
      const response = await fetch(
        "http://localhost/qrsys/api/register_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.status) {
        setSuccess(true);
        
        // Auto-login after successful registration
        setTimeout(async () => {
          onClose();
          
          // Perform login
          const loginPayload = new FormData();
          loginPayload.append("email", formData.email);
          loginPayload.append("password", formData.password);

          try {
            const loginResponse = await fetch("http://localhost/qrsys/api/login.php", {
              method: "POST",
              body: loginPayload,
            });

            const loginData = await loginResponse.json();

            if (loginData.status) {
              // Use AuthContext to store user info
              login({
                user_id: loginData.user_id,
                role: loginData.role,
                full_name: loginData.full_name,
              });

              // Redirect to User Dashboard (passenger)
              navigate("/passenger/dashboard");
            }
          } catch (err) {
            console.error("Auto-login failed:", err);
            // If auto-login fails, just open login modal
            if (window.openLoginModal) {
              window.openLoginModal();
            }
          }
        }, 2000);
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay modal-overlay-enhanced" onClick={onClose}>
      <div
        className="modal-content modal-signup"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="signup-container">
          {success ? (
            <div className="success-notification">
              <div className="success-icon">✓</div>
              <h2>Registration Successful!</h2>
              <p>Your account has been created successfully.</p>
              <p>Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-header">
                <h2 className="form-title-main">Create Your Account</h2>
                <p className="form-subtitle">
                  Join us for a seamless bus booking experience
                </p>
              </div>

              {error && (
                <div className="alert alert-danger alert-modern">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  {error}
                </div>
              )}

              <div className="signup-form-grid">
                {/* Left Column - Personal Details */}
                <div className="form-column">
                  <h3 className="column-title">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{marginRight: '8px'}}>
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                    Personal Information
                  </h3>
                  
                  <div className="form-group">
                    <label htmlFor="fullName" className="form-label-modern">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      className="form-input-modern"
                      placeholder="Enter Your Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phoneNumber" className="form-label-modern">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      className="form-input-modern"
                      placeholder="Enter Phone Number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="nic" className="form-label-modern">
                      NIC
                    </label>
                    <input
                      type="text"
                      name="nic"
                      id="nic"
                      className="form-input-modern"
                      placeholder="Enter NIC"
                      value={formData.nic}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address" className="form-label-modern">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      className="form-input-modern"
                      placeholder="Enter Address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Right Column - Account Credentials */}
                <div className="form-column">
                  <h3 className="column-title">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{marginRight: '8px'}}>
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                    Account Credentials
                  </h3>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="form-label-modern">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="form-input-modern"
                      placeholder="Enter Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="form-label-modern">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="form-input-modern"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label-modern">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      className="form-input-modern"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                className="form-btn-modern"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{marginLeft: '8px'}}>
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </>
                )}
              </button>

              <p className="form-footer-text">
                Already have an account?{" "}
                <a
                  href="#"
                  className="form-link"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    if (window.openLoginModal) {
                      window.openLoginModal();
                    }
                  }}
                >
                  Login here
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
