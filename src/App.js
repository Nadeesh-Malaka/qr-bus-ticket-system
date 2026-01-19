import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Users from "./components/Users";
import BusSchedule from "./components/BusSchedule";
import BusData from "./components/BusData";
import BusTable from "./components/BusTable";
import RouteData from "./components/RouteData";
import RouteTable from "./components/RouteTable";
import AddSchedule from "./components/AddSchedule";
import BusTracker from "./components/BusTracker";
import BusSeatLayout from './components/BusSeatLayout';
import BookingHistory from './components/BookingHistory';
import AdminDashboardNew from './pages/AdminDashboardNew';
import AdminDashboardLayout from './pages/AdminDashboardLayout';
import AdminDashboardMain from './pages/AdminDashboardMain';
import ManageRoutes from './components/ManageRoutes';
import ManageBuses from './components/ManageBuses';
import PassengerDashboard from './pages/PassengerDashboard';
import BusOperatorDashboard from './pages/BusOperatorDashboard';
import BusDriverDashboard from './pages/BusDriverDashboard';
import QRScanner from './components/QRScanner';
import UserTable from './components/UserTable';
import FeedbackForm from './components/FeedbackForm';
import CustomerFeedback from './components/CustomerFeedback';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import { useState } from 'react';

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Make functions globally accessible for modal cross-navigation
  window.openLoginModal = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };
  window.openSignupModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (user) {
      // Redirect to respective dashboard
      if (user.role === 'passenger') {
        navigate('/passenger/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'bus operator') {
        navigate('/operator/dashboard');
      } else if (user.role === 'bus driver') {
        navigate('/driver/dashboard');
      }
    } else {
      navigate('/home');
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/home');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/home" onClick={handleLogoClick}>
          <strong>QR Bus System</strong>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home" onClick={handleHomeClick}>Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/busSchedule">View Bus Schedules</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/busSchedule">View Routes</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/busSchedule">View Timetable</Link>
            </li>
          </ul>

          {/* Auth Actions */}
          <ul className="navbar-nav">
            {!user ? (
              <>
                <li className="nav-item">
                  <button 
                    className="btn btn-outline-primary me-2" 
                    onClick={() => setShowLoginModal(true)}
                  >
                    Login
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setShowSignupModal(true)}
                  >
                    Register
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <span className="nav-link" style={{ color: '#333' }}>
                    Welcome, <strong>{user.full_name}</strong> ({user.role})
                  </span>
                </li>
                <li className="nav-item">
                  <button 
                    className="btn btn-outline-danger btn-sm" 
                    onClick={handleLogout}
                    style={{ marginLeft: '10px' }}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Modals */}
      <LoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <SignupModal show={showSignupModal} onClose={() => setShowSignupModal(false)} />
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <div>
        <NavBar />

        {/* Routes */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup" element={<Users />} />
          <Route path="/busSchedule" element={<BusSchedule />} />

          {/* Passenger Routes */}
          <Route path="/passenger/dashboard" element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <PassengerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/seat-booking" element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <BusSeatLayout />
            </ProtectedRoute>
          } />
          <Route path="/booking-history" element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <BookingHistory />
            </ProtectedRoute>
          } />
          <Route path="/busTracker" element={
            <ProtectedRoute allowedRoles={['passenger', 'bus driver']}>
              <BusTracker />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/feedback" element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <FeedbackForm />
            </ProtectedRoute>
          } />

          {/* Admin Routes with New Layout */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboardMain />} />
            <Route path="routes" element={<ManageRoutes />} />
            <Route path="buses" element={<ManageBuses />} />
            <Route path="users" element={<UserTable />} />
            <Route path="reports" element={<CustomerFeedback />} />
            <Route path="feedback" element={<CustomerFeedback />} />
          </Route>

          {/* Legacy Admin Routes for backward compatibility */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardNew />
            </ProtectedRoute>
          } />
          <Route path="/admin/add-route" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteData />
            </ProtectedRoute>
          } />
          <Route path="/admin/add-bus" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BusData />
            </ProtectedRoute>
          } />
          <Route path="/admin/schedules" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddSchedule />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BookingHistory />
            </ProtectedRoute>
          } />

          {/* Bus Operator Routes */}
          <Route path="/operator/dashboard" element={
            <ProtectedRoute allowedRoles={['bus operator']}>
              <BusOperatorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/operator/buses" element={
            <ProtectedRoute allowedRoles={['bus operator']}>
              <BusTable />
            </ProtectedRoute>
          } />
          <Route path="/operator/routes" element={
            <ProtectedRoute allowedRoles={['bus operator']}>
              <RouteTable />
            </ProtectedRoute>
          } />
          <Route path="/operator/schedules" element={
            <ProtectedRoute allowedRoles={['bus operator']}>
              <AddSchedule />
            </ProtectedRoute>
          } />
          <Route path="/operator/bookings" element={
            <ProtectedRoute allowedRoles={['bus operator']}>
              <BookingHistory />
            </ProtectedRoute>
          } />

          {/* Bus Driver Routes */}
          <Route path="/driver/dashboard" element={
            <ProtectedRoute allowedRoles={['bus driver']}>
              <BusDriverDashboard />
            </ProtectedRoute>
          } />
          <Route path="/driver/routes" element={
            <ProtectedRoute allowedRoles={['bus driver']}>
              <RouteTable />
            </ProtectedRoute>
          } />
          <Route path="/driver/qr-scanner" element={
            <ProtectedRoute allowedRoles={['bus driver']}>
              <QRScanner />
            </ProtectedRoute>
          } />
          <Route path="/driver/tracking" element={
            <ProtectedRoute allowedRoles={['bus driver']}>
              <BusTracker />
            </ProtectedRoute>
          } />
          <Route path="/driver/schedule" element={
            <ProtectedRoute allowedRoles={['bus driver']}>
              <BusSchedule />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
