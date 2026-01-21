import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../assets/fonts/icomoon/style.css";
import "../assets/fonts/flaticon/font/flaticon.css";
import "../assets/css/bootstrap.min.css";
import "../assets/css/jquery.fancybox.min.css";
import "../assets/css/aos.css";
import "../assets/css/style.css";
import "../assets/styles.css";

export default function Home() {
  const navigate = useNavigate();
  
  // Search state
  const [routes, setRoutes] = useState([]);
  const [cities, setCities] = useState([]);
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [travelDate, setTravelDate] = useState("");
  
  // Feedback state
  const [feedbacks, setFeedbacks] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    // Load JS scripts
    const scripts = [
      "/js/jquery-3.3.1.min.js",
      "/js/popper.min.js",
      "/js/bootstrap.min.js",
      "/js/owl.carousel.min.js",
      "/js/jquery.sticky.js",
      "/js/jquery.waypoints.min.js",
      "/js/jquery.animateNumber.min.js",
      "/js/jquery.fancybox.min.js",
      "/js/jquery.easing.1.3.js",
      "/js/bootstrap-datepicker.min.js",
      "/js/aos.js",
      "/js/main.js"
    ];
    scripts.forEach(src => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      document.body.appendChild(script);
    });

    // Fetch routes for search dropdowns
    fetch("http://localhost/qrsys/api/get_routes.php")
      .then(res => res.json())
      .then(data => {
        console.log("Routes API Response:", data); // Debug log
        if (data && Array.isArray(data) && data.length > 0) {
          setRoutes(data);
          // Extract unique cities from start_city and end_city
          const allCities = data.flatMap(route => [route.start_city, route.end_city]);
          const uniqueCities = [...new Set(allCities)].filter(city => city); // Remove null/undefined
          console.log("Extracted Cities:", uniqueCities); // Debug log
          setCities(uniqueCities);
        } else {
          console.warn("No routes found in database");
        }
      })
      .catch(err => {
        console.error("Failed to fetch routes:", err);
      });

    // Fetch feedbacks
    fetch("http://localhost/qrsys/api/feedback_api.php")
      .then(res => res.json())
      .then(data => {
        if (data.status) setFeedbacks(data.data);
      })
      .catch(err => {
        console.error("Failed to fetch feedbacks:", err);
      });
      
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    setTravelDate(today);
  }, []);

  const handleSearchBuses = (e) => {
    e.preventDefault();
    
    if (!fromCity || !toCity || !travelDate) {
      alert("Please fill all search fields");
      return;
    }
    
    if (fromCity === toCity) {
      alert("From and To cities cannot be the same");
      return;
    }
    
    // Navigate to schedules page with search parameters
    navigate(`/schedules?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&date=${travelDate}`);
  };

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);
  const renderStars = (count) => "★".repeat(count) + "☆".repeat(5 - count);
  const filteredFeedbacks = feedbacks.filter(item => {
    const matchSearch =
      item.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase());
    const matchRating = ratingFilter === "all" || item.review_rate === Number(ratingFilter);
    return matchSearch && matchRating;
  });

  return (
    <div className="site-wrap" id="home-section">

      {/* Home Section */}
 <section id="home">
  <div className="site-mobile-menu site-navbar-target">
    <div className="site-mobile-menu-header">
      <div className="site-mobile-menu-close mt-3">
        <span className="icon-close2 js-menu-toggle" />
      </div>
    </div>
    <div className="site-mobile-menu-body" />
  </div>

  <div className="ftco-blocks-cover-1">
    <div
      className="ftco-cover-1 overlay"
      style={{ backgroundImage: "url('/images/main_img.jpg')" }}
    >
      <div className="container">
        <div className="row align-items-center justify-content-center text-center" style={{ minHeight: '70vh' }}>
          <div className="col-lg-10">
            <h1 className="mb-4" style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Welcome to ExpressBook
            </h1>
            <p className="mb-5" style={{ fontSize: '1.3rem', color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
              Your trusted online bus booking platform. Fast, simple, and convenient travel at your fingertips.
            </p>
            
            {/* Modern Search Container */}
            <div className="search-container" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '15px',
              padding: '40px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              <h3 style={{ color: '#333', marginBottom: '25px', fontSize: '1.5rem' }}>Find Your Bus</h3>
              <form onSubmit={handleSearchBuses}>
                <div className="row g-3">
                  {/* From City */}
                  <div className="col-md-4">
                    <label style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px', display: 'block', textAlign: 'left' }}>
                      <i className="icon-location-pin" style={{ marginRight: '5px' }}></i> From
                    </label>
                    <select 
                      className="form-control" 
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      style={{ 
                        height: '50px', 
                        borderRadius: '8px',
                        border: '2px solid #e0e0e0',
                        fontSize: '1rem'
                      }}
                      required
                    >
                      <option value="">Select Start City</option>
                      {cities.map((city, idx) => (
                        <option key={idx} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* To City */}
                  <div className="col-md-4">
                    <label style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px', display: 'block', textAlign: 'left' }}>
                      <i className="icon-location-pin" style={{ marginRight: '5px' }}></i> To
                    </label>
                    <select 
                      className="form-control"
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      style={{ 
                        height: '50px', 
                        borderRadius: '8px',
                        border: '2px solid #e0e0e0',
                        fontSize: '1rem'
                      }}
                      required
                    >
                      <option value="">Select End City</option>
                      {cities.map((city, idx) => (
                        <option key={idx} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Travel Date */}
                  <div className="col-md-4">
                    <label style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px', display: 'block', textAlign: 'left' }}>
                      <i className="icon-calendar" style={{ marginRight: '5px' }}></i> Travel Date
                    </label>
                    <input 
                      type="date"
                      className="form-control"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{ 
                        height: '50px', 
                        borderRadius: '8px',
                        border: '2px solid #e0e0e0',
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>
                </div>
                
                {/* Search Button */}
                <div className="row mt-4">
                  <div className="col-12">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg"
                      style={{
                        width: '100%',
                        height: '55px',
                        borderRadius: '8px',
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(0,123,255,0.3)',
                        transition: 'all 0.3s'
                      }}
                    >
                      <i className="icon-search" style={{ marginRight: '10px' }}></i>
                      Find Buses
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Call to Action Buttons */}
            <div className="d-flex justify-content-center gap-3 mt-5">
              <a href="#about" className="btn btn-outline-light btn-lg px-4 py-3" style={{ fontSize: '1rem' }}>
                Learn More
              </a>
              <a href="#services" className="btn btn-outline-light btn-lg px-4 py-3" style={{ fontSize: '1rem' }}>
                Our Services
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<br />

      
      
      {/* About Section */}
      <section id="about">
          <div className="ftco-blocks-cover-1">
      <div className="ftco-cover-1 overlay innerpage" style={{
  backgroundImage: "url('/images/alma-Pew_ognBPc8-unsplash.jpg')",
}}>
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-lg-6 text-center">
              <h1>About Us</h1>
              <p>Our goal is to make bus travel faster, simpler, and more convenient</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="site-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 mb-5 mb-lg-0 order-lg-2">
            <img src="images/1920_oxfordshirecountycouncilwithstagecoachbusandchilternrailways.jpg" alt="Image" className="img-fluid" />
          </div>
          <div className="col-lg-4 mr-auto">
            <h2>Our Vision</h2>
            <p>To be a trusted digital platform that transforms bus travel by providing fast, simple, and convenient online booking through ExpressBook.</p>
          </div>
        </div>
      </div>
    </div>

    <div className="site-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 mb-5 mb-lg-0">
            <img src="images/thumb2-4k-volvo-9900-bridge-passenger-transport-2022-buses.jpg" alt="Image" className="img-fluid" />
          </div>
          <div className="col-lg-4 ml-auto">
            <h2>About Us</h2>
            <p>We provide a smart and reliable online bus system designed to make travel easier for everyone. Our platform allows passengers to view bus schedules, check seat availability, and book tickets online with ease.</p>
            <p>By using modern technology, we aim to reduce waiting time, improve efficiency, and offer a convenient travel experience for both passengers and bus operators.</p>
          </div>
        </div>
      </div>
    </div>

      </section>

      {/* Services Section */}
      <section id="services">
           <div className="ftco-blocks-cover-1">
      <div className="ftco-cover-1 overlay innerpage" style={{
  backgroundImage: "url('/images/jun-ren-il3IqT8s_nU-unsplash.jpg')",
}}>
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-lg-6 text-center">
              <h1>Our Services</h1>
              <p>We offer a simple and fast online bus booking service that allows passengers to check schedules, select seats, and book tickets easily with secure QR-based e-tickets for a smooth travel experience.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

   <div class="site-section">
      <div class="container">
        <div class="row">
          <div class="col-lg-4 mb-4 mb-lg-5">
            <div class="service-1 dark">
              <span class="service-1-icon">
                <span class="flaticon-car"></span>
              </span>
              <div class="service-1-contents">
                <h3>E-Ticket Generate</h3>
                <p>Passengers can select their route, choose seats, and receive a digital ticket with a QR code instantly.</p>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mb-4 mb-lg-5">
            <div class="service-1 dark">
              <span class="service-1-icon">
                <span class="flaticon-valet-1"></span>
              </span>
              <div class="service-1-contents">
                <h3>Seat Booking</h3>
                <p>Passengers can easily view available seats in real time and reserve them during ticket booking.</p>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mb-4 mb-lg-5">
            <div class="service-1 dark">
              <span class="service-1-icon">
                <span class="flaticon-key"></span>
              </span>
              <div class="service-1-contents">
                <h3>View Bus Schedule</h3>
                <p>Users able to view available buses, routes, and departure times in one place. Passengers can easily plan their journey by checking schedules in advance.</p>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mb-4 mb-lg-5">
            <div class="service-1 dark">
              <span class="service-1-icon">
                <span class="flaticon-car-1"></span>
              </span>
              <div class="service-1-contents">
                <h3>Chat Bot</h3>
                <p>The chatbot service provides instant assistance to passengers by answering common questions and guiding users through the booking process and users find bus schedules, ticket details, and other information quickly without waiting for support.</p>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mb-4 mb-lg-5">
            <div class="service-1 dark">
              <span class="service-1-icon">
                <span class="flaticon-traffic"></span>
              </span>
              <div class="service-1-contents">
                <h3>Bus Route tracking</h3>
                <p>Passengers able to monitor bus routes and current locations in real time and they can track their bus, check estimated arrival times, and plan their journey more efficiently.</p>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mb-4 mb-lg-5">
            <div class="service-1 dark">
              <span class="service-1-icon">
                <span class="flaticon-valet"></span>
              </span>
              <div class="service-1-contents">
                <h3>E-Ticket Scanning</h3>
                <p>System allows to quickly verify passengers’ e-tickets using QR code scanning. This ensures fast and secure ticket validation, reduces manual checking, and helps prevent ticket fraud.</p>
              </div>
            </div>
     </div>
     </div>
     </div>
</div> 
  </section>

  {/* Feedback Section */}
    <section id="feedback" className="site-section bg-light"  style={{
    backgroundImage: "url('/images/360_F_202179910_Uv0HNNaT1LklpUAwfC5eJY3QhGL2IkAc.jpg')", 
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "relative",
    color: "white", 
    padding: "60px 0"
  }}>
        <div className="container">
          <div className="row justify-content-center text-center mb-5">
            <div className="col-7">
              <h2 style={{color: "white"}}>Customer Feedback</h2>
              <p>See what our passengers are saying about their experience with ExpressBook.</p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="feedback-controls text-center mb-4">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="feedback-search mr-2"
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

          {/* Feedback Grid */}
          <div className="row feedback-grid">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map(item => (
                <div
                  key={item.review_id}
                  className={`col-md-4 mb-4 feedback-card ${expandedId === item.review_id ? "expanded" : ""}`}
                  onClick={() => toggleExpand(item.review_id)}
                >
                  <div className="card h-100 shadow-sm p-3">
                    <div className="feedback-stars mb-2">{renderStars(item.review_rate)}</div>
                    <p className="feedback-description">{item.description}</p>
                    <div className="feedback-footer mt-2">
                      <strong>{item.customer_name}</strong>
                      <br />
                      <small>{item.email}</small>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-feedback text-center">No feedback found</p>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact">
           <div className="site-section bg-light" id="contact-section">
      <div className="container">
        <div className="row justify-content-center text-center">
        <div className="col-7 text-center mb-5">
          <h2>Contact Us</h2>
        </div>
      </div>
        <div className="row">
          <div className="col-lg-8 mb-5" >
            <form action="#" method="post">
              <div className="form-group row">
                <div className="col-md-6 mb-4 mb-lg-0">
                  <input type="text" className="form-control" placeholder="First Name" />
                </div>
                <div className="col-md-6">
                  <input type="text" className="form-control" placeholder="Last name" />
                </div>
              </div>

              <div className="form-group row">
                <div className="col-md-12">
                  <input type="text" className="form-control" placeholder="Email address" />
                </div>
              </div>

              <div className="form-group row">
                <div className="col-md-12">
                  <textarea name="" id="" className="form-control" placeholder="Write your message." cols="30" rows="10"></textarea>
                </div>
              </div>
              <div className="form-group row">
                <div className="col-md-6 mr-auto">
                  <input type="submit" className="btn btn-block btn-primary text-white py-3 px-5" value="Send Message" />
                </div>
              </div>
            </form>
          </div>
          <div className="col-lg-4 ml-auto">
            <div className="bg-white p-3 p-md-5">
              <h3 className="text-black mb-4">Contact Info</h3>
              <ul className="list-unstyled footer-link">
                <li className="d-block mb-3"><span className="d-block text-black">Phone:</span><span>+94 118 1234 23</span></li>
                <li className="d-block mb-3"><span className="d-block text-black">Email:</span><span>expressbook@gmail.com</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
   </section>
      
      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 ml-auto">
              <div className="row">
                {[...Array(4)].map((_, idx) => (
                  <div className="col-lg-3" key={idx}>
                    <h2 className="footer-heading mb-4">Quick Links</h2>
                    <ul className="list-unstyled">
                      <li><a href="#">About Us</a></li>
                      <li><a href="#">Testimonials</a></li>
                      <li><a href="#">Terms of Service</a></li>
                      <li><a href="#">Privacy</a></li>
                      <li><a href="#">Contact Us</a></li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="row pt-5 mt-5 text-center">
            <div className="col-md-12">
              <div className="border-top pt-5">
                <p>
                  Copyright &copy; {new Date().getFullYear()} All rights reserved
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}