import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminDashboard = () => {
  const [user, setUser] = useState({ full_name: "", user_id: "", role: "" });

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (
      !storedUser ||
      !["admin", "bus operator", "bus driver"].includes(storedUser.role)
    ) {
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
    <div className="container-fluid">
      <div className="row">

        {/* Sidebar */}
        <div className="col-md-2 bg-dark text-white min-vh-100 p-3">
          <h5 className="text-center border-bottom pb-2">Admin Panel</h5>

          <ul className="nav flex-column mt-3">
            <li className="nav-item">
              <a className="nav-link text-white" href="#">Dashboard</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="#">Buses</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="#">Routes</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="#">Bookings</a>
            </li>
            <li className="nav-item">
              <button
                onClick={handleLogout}
                className="nav-link text-danger border-0 bg-dark text-start w-100"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="col-md-10 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Dashboard</h3>
            <span>Welcome, {user.full_name} ({user.role})</span>
          </div>

          {/* Stats Cards */}
          <div className="row">
            <div className="col-md-3">
              <div className="card text-white bg-primary mb-3">
                <div className="card-body">
                  <h5>Total Buses</h5>
                  <h3>25</h3>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-white bg-success mb-3">
                <div className="card-body">
                  <h5>Routes</h5>
                  <h3>18</h3>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-white bg-warning mb-3">
                <div className="card-body">
                  <h5>Bookings</h5>
                  <h3>120</h3>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-white bg-danger mb-3">
                <div className="card-body">
                  <h5>Revenue</h5>
                  <h3>Rs. 45,000</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="card mt-4">
            <div className="card-header">
              Recent Bookings
            </div>
            <div className="card-body p-0">
              <table className="table table-striped mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Passenger</th>
                    <th>Bus No</th>
                    <th>Seat</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Sajini</td>
                    <td>QW12-R456</td>
                    <td>A3</td>
                    <td>
                      <span className="badge bg-success">Confirmed</span>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Kamal</td>
                    <td>LK09-X123</td>
                    <td>B5</td>
                    <td>
                      <span className="badge bg-warning">Pending</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
