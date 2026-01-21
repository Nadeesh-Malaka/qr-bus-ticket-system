import React, { useState } from "react";
import "../assets/styles.css";
import Footer from './Footer';

export default function FeedbackForm() {

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    review_rate: ""
  });

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
        alert("Feedback Added Successfully");
        setFormData({
          name: "",
          description: "",
          email: "",
          review_rate: ""
        });
      } else {
        alert(result.message || "Failed to add feedback");
      }

    } catch (error) {
      alert("Server Error");
      console.error(error);
    }
  };

  return (
    <div className="main-center">
      <div className="form-container">
        <form onSubmit={handleSubmit}>

          <h2 className="form-title">Feedback Form</h2>

          <label className="form-label">Name *</label>
          <input
            type="text"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label className="form-label">Description *</label>
          <input
            type="text"
            name="description"
            className="form-input"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label className="form-label">Email *</label>
          <input
            type="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label className="form-label">Review Rate *</label>
          <div className="star-rating">
            {[5, 4, 3, 2, 1].map((star) => (
              <React.Fragment key={star}>
                <input
                  type="radio"
                  id={`star${star}`}
                  name="review_rate"
                  value={star}
                  checked={formData.review_rate === String(star)}
                  onChange={handleChange}
                  required
                />
                <label htmlFor={`star${star}`} title={`${star} stars`}>
                  ★
                </label>
              </React.Fragment>
            ))}
          </div>

          <button type="submit" className="form-btn">
            Submit
          </button>

        </form>
      </div>
      <Footer />
    </div>
  );
}
