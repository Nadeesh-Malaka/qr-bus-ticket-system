import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const UserDashboard = () => {
  const [user, setUser] = useState({ full_name: "", user_id: "" });

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || storedUser.role !== "passenger") {
      // Redirect if not logged in or wrong role
      window.location.href = "/home";
    } else {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/home";
  };

  return (
    <div className="container-fluid bg-light min-vh-100">
      
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
        <span className="navbar-brand">Bus Ticket System</span>
        <div className="ms-auto text-white">
          Welcome, {user.full_name}
        </div>
      </nav>

      <div className="row mt-4 px-3">

        {/* Sidebar */}
        <div className="col-md-3 col-lg-2">
          <div className="list-group">
            <a href="#" className="list-group-item list-group-item-action active">
              Dashboard
            </a>
            <Link to="/seat-booking" className="list-group-item list-group-item-action">
              Book Ticket
            </Link>
            <Link to="/booking-history" className="list-group-item list-group-item-action">
              My Bookings
            </Link>
            <a href="#" className="list-group-item list-group-item-action">
              Profile
            </a>
            <button
              onClick={handleLogout}
              className="list-group-item list-group-item-action text-danger border-0"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10">
          <h4 className="mb-4">User Dashboard</h4>

          {/* Summary Cards */}
          <div className="row">
            <div className="col-md-4">
              <div className="card text-bg-success mb-3">
                <div className="card-body">
                  <h6>Total Trips</h6>
                  <h3>12</h3>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-bg-info mb-3">
                <div className="card-body">
                  <h6>Active Bookings</h6>
                  <h3>2</h3>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-bg-warning mb-3">
                <div className="card-body">
                  <h6>Wallet Balance</h6>
                  <h3>Rs. 1,500</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Trips */}
          <div className="card mt-4">
            <div className="card-header">
              Upcoming Trips
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Bus No</th>
                    <th>Route</th>
                    <th>Date</th>
                    <th>Seat</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>QW12-R456</td>
                    <td>Colombo → Kandy</td>
                    <td>2026-01-20</td>
                    <td>A3</td>
                    <td>
                      <span className="badge bg-success">Confirmed</span>
                    </td>
                  </tr>
                  <tr>
                    <td>LK09-X123</td>
                    <td>Galle → Colombo</td>
                    <td>2026-01-25</td>
                    <td>B5</td>
                    <td>
                      <span className="badge bg-warning">Pending</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row mt-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body text-center">
                  <h5>Book a New Ticket</h5>
                  <Link to="/seat-booking" className="btn btn-primary mt-2">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-body text-center">
                  <h5>View Booking History</h5>
                  <Link to="/booking-history" className="btn btn-primary mt-2">
                    Booking History
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
