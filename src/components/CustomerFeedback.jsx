import React, { useEffect, useState } from "react";
import "../assets/styles.css";

export default function CustomerFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    fetch("http://localhost/qrsys/api/feedback_api.php")
      .then(res => res.json())
      .then(data => {
        if (data.status) setFeedbacks(data.data);
      });
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderStars = (count) =>
    "★".repeat(count) + "☆".repeat(5 - count);

  const filteredFeedbacks = feedbacks.filter(item => {
    const matchSearch =
      item.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase());

    const matchRating =
      ratingFilter === "all" ||
      item.review_rate === Number(ratingFilter);

    return matchSearch && matchRating;
  });

  return (
    <div className="feedback-page">
      <h2 className="feedback-title">What Our Customers Say</h2>

      {/* FILTER CONTROLS */}
      <div className="feedback-controls">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="feedback-search"
        />

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="feedback-filter"
        >
          <option value="all">All Ratings</option>
          <option value="5">★★★★★</option>
          <option value="4">★★★★</option>
          <option value="3">★★★</option>
          <option value="2">★★</option>
          <option value="1">★</option>
        </select>
      </div>

      {/* FEEDBACK GRID */}
      <div className="feedback-grid">
        {filteredFeedbacks.length > 0 ? (
          filteredFeedbacks.map(item => (
            <div
              key={item.review_id}
              className={`feedback-card ${
                expandedId === item.review_id ? "expanded" : ""
              }`}
              onClick={() => toggleExpand(item.review_id)}
            >
              <div className="feedback-stars">
                {renderStars(item.review_rate)}
              </div>

              <p className="feedback-description">
                {item.description}
              </p>

              <div className="feedback-footer">
                <span className="feedback-name">
                  {item.customer_name}
                </span>
                <span className="feedback-email">
                  {item.email}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-feedback">No feedback found</p>
        )}
      </div>
    </div>
  );
}