import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Users from "./components/Users";
import BusSchedule from "./components/BusSchedule";
import BusData from "./components/BusData";
import BusTable from "./components/BusTable";
import BusTracker from "./components/BusTracker";
import BusSeatLayout from './components/BusSeatLayout';
import BookingHistory from './components/BookingHistory';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <div>
      {/* Bootstrap Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/home">BusApp</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                  aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/home">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/busSchedule">Bus Schedule</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/busData">Bus Data</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/busTable">Bus Table</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/users">Users</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/busTracker">Bus Tracker</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/seat-booking">Seat Booking</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/booking-history">Booking History</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/adminDashboard">Admin Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/userDashboard">User Dashboard</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Users />} />
        <Route path="/busSchedule" element={<BusSchedule />} />
        <Route path="/users" element={<Users />} />
        <Route path="/busData" element={<BusData />} />
        <Route path="/busTable" element={<BusTable />} />
        <Route path="/busTracker" element={<BusTracker />} />
        <Route path="/seat-booking" element={<BusSeatLayout />} />
        <Route path="/booking-history" element={<BookingHistory />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/userDashboard" element={<UserDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
