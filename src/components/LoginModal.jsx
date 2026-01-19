import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles.css";

export default function LoginModal({ show, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await fetch("http://localhost/qrsys/api/login.php", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.status) {
        // Use AuthContext to store user info
        login({
          user_id: data.user_id,
          role: data.role,
          full_name: data.full_name,
        });

        // Close modal
        onClose();

        // Role-based redirect
        if (data.role === "passenger") {
          navigate("/passenger/dashboard");
        } else if (data.role === "admin") {
          navigate("/admin/dashboard");
        } else if (data.role === "bus operator") {
          navigate("/operator/dashboard");
        } else if (data.role === "bus driver") {
          navigate("/driver/dashboard");
        }
      } else {
        setError(data.message || "Login failed");
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
      <div className="modal-content modal-login" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="login-container">
          <div className="form-header">
            <h2 className="form-title-main">Welcome Back</h2>
            <p className="form-subtitle">
              Sign in to continue your booking experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="alert alert-danger alert-modern">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            <div className="login-form-content">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{marginLeft: '8px'}}>
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </>
              )}
            </button>

            <p className="form-footer-text">
              Don't have an account?{" "}
              <a
                href="#"
                className="form-link"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  if (window.openSignupModal) {
                    window.openSignupModal();
                  }
                }}
              >
                Sign up here
              </a>
            </p>

            <p className="form-footer-text" style={{ marginTop: "0.75rem" }}>
              <a
                href="#"
                className="form-link"
              >
                Forgot Password?
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
