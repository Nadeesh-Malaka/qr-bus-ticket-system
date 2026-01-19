import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../assets/fonts/icomoon/style.css";
import "../assets/fonts/flaticon/font/flaticon.css";
import "../assets/css/bootstrap.min.css";
import "../assets/css/jquery.fancybox.min.css";
import "../assets/css/aos.css";
import "../assets/css/style.css";
import "../assets/styles.css";

export default function Home() {
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

    // Fetch feedbacks
    fetch("http://localhost/qrsys/api/feedback_api.php")
      .then(res => res.json())
      .then(data => {
        if (data.status) setFeedbacks(data.data);
      })
      .catch(err => {
        console.error("Failed to fetch feedbacks:", err);
      });
  }, []);

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

       {/* Header */}
      <header className="site-navbar site-navbar-target" role="banner">
        <div className="container">
          <div className="row align-items-center position-relative">
            <div className="col-3">
              <div className="site-logo">
                <a href="#">ExpressBook</a>
              </div>
            </div>
            <div className="col-9 text-right">
              <span className="d-inline-block d-lg-none">
                <a href="#" className="site-menu-toggle js-menu-toggle py-5 text-white">
                  <span className="icon-menu h3 text-white" />
                </a>
              </span>
             
            </div>
          </div>
        </div>
      </header>

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
        <div className="col-lg-5">
          <div className="feature-car-rent-box-1">
            <div className="main-center">
              <div className="form-container">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();

                    const email = e.target.email.value;
                    const password = e.target.password.value;

                    const formData = new FormData();
                    formData.append("email", email);
                    formData.append("password", password);

                    try {
                      const res = await fetch(
                        "http://localhost/qrsys/api/login.php",
                        {
                          method: "POST",
                          body: formData,
                        }
                      );

                      const data = await res.json();

                      if (data.status) {
                        // Save user info in localStorage
                        localStorage.setItem("user", JSON.stringify(data));

                        // Role-based redirect
                        if (data.role === "passenger") {
                          window.location.href = "/user-dashboard";
                        } else if (
                          data.role === "admin" ||
                          data.role === "bus operator" ||
                          data.role === "bus driver"
                        ) {
                          window.location.href = "/admin-dashboard";
                        } else {
                          alert("Unknown role");
                        }
                      } else {
                        alert(data.message || "Login failed");
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Server error");
                    }
                  }}
                >
                  <div style={{ marginBottom: "1rem" }}>
                    <h2 className="form-title">User Login</h2>
                  </div>

                  <label htmlFor="email" className="form-label">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="form-input"
                    placeholder="Enter Your Email"
                    required
                  />

                  <label htmlFor="password" className="form-label">
                    Password*
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="form-input"
                    placeholder="Enter your password"
                    required
                  />

                  <button className="form-btn" type="submit">
                    Sign In
                  </button>

                  <p
                    className="sign_up"
                    style={{
                      color: "black",
                      display: "block",
                      marginTop: "20px",
                      fontSize: "16px",
                    }}
                  >
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      style={{ color: "blue", textDecoration: "none" }}
                    >
                      Sign up
                    </Link>
                  </p>

                  <a
                    href="#"
                    style={{
                      color: "blue",
                      display: "block",
                      marginTop: "0.5rem",
                    }}
                  >
                    Forgot Password?
                  </a>
                </form>
              </div>
            </div>

            <div className="d-flex align-items-center bg-light p-3"></div>
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