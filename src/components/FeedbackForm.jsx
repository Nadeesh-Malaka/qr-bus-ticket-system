import React, { useState } from "react";
import Footer from './Footer';

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    review_rate: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost/qrsys/api/feedback_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "create",
            customer_name: formData.name,
            description: formData.description,
            email: formData.email,
            review_rate: Number(formData.review_rate),
          }),
        }
      );

      const result = await response.json();

      if (result.status) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            name: "",
            description: "",
            email: "",
            review_rate: ""
          });
        }, 3000);
      } else {
        alert(result.message || "Failed to add feedback");
      }

    } catch (error) {
      alert("Server Error");
      console.error(error);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ flex: 1, padding: '40px 20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          
          {/* Header Section */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 35px',
            borderRadius: '20px 20px 0 0',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>💬</div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '32px', 
              fontWeight: '700',
              letterSpacing: '-0.5px'
            }}>
              We Value Your Feedback
            </h1>
            <p style={{ 
              margin: '12px 0 0 0', 
              fontSize: '16px', 
              opacity: 0.95
            }}>
              Help us improve our service by sharing your experience
            </p>
          </div>

          {/* Form Section */}
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '0 0 20px 20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
          }}>
            
            {submitted ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                animation: 'fadeIn 0.5s'
              }}>
                <div style={{
                  fontSize: '80px',
                  marginBottom: '20px'
                }}>✅</div>
                <h2 style={{
                  color: '#28a745',
                  fontSize: '28px',
                  fontWeight: '700',
                  marginBottom: '15px'
                }}>
                  Thank You!
                </h2>
                <p style={{
                  color: '#64748b',
                  fontSize: '16px'
                }}>
                  Your feedback has been submitted successfully.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>

                {/* Name Field */}
                <div style={{ marginBottom: '25px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#334155',
                    letterSpacing: '-0.2px'
                  }}>
                    Your Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.3s',
                      fontFamily: 'inherit',
                      backgroundColor: '#f8fafc'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                  />
                </div>

                {/* Email Field */}
                <div style={{ marginBottom: '25px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#334155',
                    letterSpacing: '-0.2px'
                  }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.3s',
                      fontFamily: 'inherit',
                      backgroundColor: '#f8fafc'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                  />
                </div>

                {/* Description Field */}
                <div style={{ marginBottom: '30px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#334155',
                    letterSpacing: '-0.2px'
                  }}>
                    Your Feedback <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Tell us about your experience..."
                    rows="5"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.3s',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      backgroundColor: '#f8fafc'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                  />
                </div>

                {/* Star Rating */}
                <div style={{ marginBottom: '35px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '15px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#334155',
                    letterSpacing: '-0.2px'
                  }}>
                    Rate Your Experience <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center',
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0'
                  }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <label
                        key={star}
                        style={{
                          cursor: 'pointer',
                          fontSize: '40px',
                          transition: 'all 0.2s',
                          color: formData.review_rate >= String(star) ? '#fbbf24' : '#e2e8f0',
                          transform: formData.review_rate >= String(star) ? 'scale(1.1)' : 'scale(1)',
                          filter: formData.review_rate >= String(star) ? 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.5))' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!formData.review_rate) {
                            e.target.style.transform = 'scale(1.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!formData.review_rate) {
                            e.target.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        <input
                          type="radio"
                          name="review_rate"
                          value={star}
                          checked={formData.review_rate === String(star)}
                          onChange={handleChange}
                          required
                          style={{ display: 'none' }}
                        />
                        ★
                      </label>
                    ))}
                  </div>
                  {formData.review_rate && (
                    <p style={{
                      textAlign: 'center',
                      marginTop: '10px',
                      fontSize: '14px',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      {formData.review_rate === '5' && '⭐ Excellent!'}
                      {formData.review_rate === '4' && '😊 Very Good!'}
                      {formData.review_rate === '3' && '👍 Good'}
                      {formData.review_rate === '2' && '😐 Fair'}
                      {formData.review_rate === '1' && '😞 Poor'}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'white',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  Submit Feedback
                </button>

              </form>
            )}
          </div>

          {/* Info Card */}
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#64748b'
            }}>
              💡 Your feedback helps us serve you better. Thank you for taking the time!
            </p>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
