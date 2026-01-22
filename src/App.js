import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useState, useEffect } from 'react';
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Users from "./components/Users";
import ProfilePage from "./pages/ProfilePage";
import BusSchedule from "./components/BusSchedule";
import ViewBusSchedules from "./pages/ViewBusSchedules";
import ViewRoutes from "./pages/ViewRoutes";
import ViewTimetable from "./pages/ViewTimetable";
import BusData from "./components/BusData";
import BusTable from "./components/BusTable";
import RouteData from "./components/RouteData";
import RouteTable from "./components/RouteTable";
import AddSchedule from "./components/AddSchedule";
import BusTracker from "./components/BusTracker";
import BusSeatLayout from './components/BusSeatLayout';
import BookingHistory from './components/BookingHistory';
import AdminDashboardLayout from './pages/AdminDashboardLayout';
import AdminDashboardMain from './pages/AdminDashboardMain';
import ManageRoutes from './components/ManageRoutes';
import ManageBuses from './components/ManageBuses';
import PassengerDashboard from './pages/PassengerDashboard';
import BusOperatorDashboard from './pages/BusOperatorDashboard';
import BusOperatorDashboardLayout from './pages/BusOperatorDashboardLayout';
import BusOperatorDashboardMain from './pages/BusOperatorDashboardMain';
import OperatorMyBuses from './components/OperatorMyBuses';
import OperatorBookings from './components/OperatorBookings';
import OperatorTrackBuses from './components/OperatorTrackBuses';
import OperatorReports from './components/OperatorReports';
import BusDriverDashboard from './pages/BusDriverDashboard';
import QRScanner from './components/QRScanner';
import ManageUsers from './components/ManageUsers';
import UserActivityLog from './components/UserActivityLog';
import FeedbackForm from './components/FeedbackForm';
import CustomerFeedback from './components/CustomerFeedback';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
// New booking flow pages
import AvailableBuses from './pages/AvailableBuses';
import BookingPage from './pages/BookingPage';
import SeatSelection from './pages/SeatSelection';
import PaymentPage from './pages/PaymentPage';
import TicketPage from './pages/TicketPage';


function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (showProfileDropdown) {
      const handleClickOutside = (e) => {
        if (!e.target.closest('.dropdown')) {
          setShowProfileDropdown(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showProfileDropdown]);

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
      } else if (user.role === 'bus operator' || user.role === 'bus_operator') {
        navigate('/operator/dashboard');
      } else if (user.role === 'bus driver' || user.role === 'bus_driver') {
        navigate('/driver/dashboard');
      } else {
        navigate('/home');
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
    <nav className="navbar navbar-expand-lg sticky-top" style={{
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      padding: '15px 0',
      transition: 'all 0.3s ease'
    }}>
      <div className="container-fluid" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Brand Logo */}
        <Link 
          className="navbar-brand" 
          to="/home" 
          onClick={handleLogoClick}
          style={{
            color: '#2563eb', // Modern Blue Color
            fontSize: '1.6rem',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            letterSpacing: '-0.5px'
          }}
        >
          <div style={{
            background: '#eff6ff',
            padding: '8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🚌</span>
          </div>
          ExpressBook
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ border: 'none', boxShadow: 'none' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto" style={{ marginLeft: '40px', gap: '5px' }}>
            {/* Home Link */}
            <li className="nav-item">
                <Link 
                  className="nav-link" 
                  to="/home"
                  onClick={handleHomeClick}
                  style={{
                    color: '#475569', // Slate Gray text
                    fontWeight: '600',
                    fontSize: '15px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#2563eb';
                    e.target.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#475569';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Home
                </Link>
            </li>

            {/* View Routes Link */}
            <li className="nav-item">
                <Link 
                  className="nav-link" 
                  to="/routes"
                  style={{
                    color: '#475569',
                    fontWeight: '600',
                    fontSize: '15px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#2563eb';
                    e.target.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#475569';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  View Routes
                </Link>
            </li>

            {/* View Timetable Link */}
            <li className="nav-item">
                <Link 
                  className="nav-link" 
                  to="/timetable"
                  style={{
                    color: '#475569',
                    fontWeight: '600',
                    fontSize: '15px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#2563eb';
                    e.target.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#475569';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  View Timetable
                </Link>
            </li>
          </ul>

          {/* Auth Actions */}
          <ul className="navbar-nav" style={{ alignItems: 'center', gap: '15px' }}>
            {!user ? (
              <>
                <li className="nav-item">
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    style={{
                      color: '#475569',
                      fontWeight: '600',
                      background: 'transparent',
                      border: 'none',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                    onMouseLeave={(e) => e.target.style.color = '#475569'}
                  >
                    Log In
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    onClick={() => setShowSignupModal(true)}
                    style={{
                      background: '#2563eb', // Bright Blue
                      color: 'white',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: '50px', // Rounded pill shape
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                      transition: 'transform 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    Register
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item dropdown" style={{ position: 'relative' }}>
                 <button
                    className="btn"
                    type="button"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #e2e8f0',
                      borderRadius: '50px',
                      padding: '6px 16px 6px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e2e8f0';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                    }}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700'
                    }}>
                      {user.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.full_name?.split(' ')[0]}</span>
                    <svg 
                      style={{ 
                        width: '16px', 
                        height: '16px', 
                        transition: 'transform 0.2s',
                        transform: showProfileDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                      }} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showProfileDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: '0',
                        marginTop: '8px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: 'white',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        padding: '10px',
                        minWidth: '220px',
                        zIndex: 1000
                      }}
                    >
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', marginBottom: '8px' }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Signed in as</div>
                        <div style={{ fontWeight: '600', color: '#333' }}>{user.full_name}</div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: 'white', 
                          background: '#2563eb',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          marginTop: '6px'
                        }}>
                          {user.role}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          navigate('/profile');
                        }}
                        style={{ 
                          width: '100%',
                          padding: '10px 16px', 
                          borderRadius: '8px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px', 
                          fontWeight: '500',
                          color: '#334155',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '18px' }}>👤</span> View Profile
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          handleLogout();
                        }}
                        style={{ 
                          width: '100%',
                          padding: '10px 16px', 
                          borderRadius: '8px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px', 
                          color: '#dc3545', 
                          fontWeight: '500',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#fff5f5'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '18px' }}>🚪</span> Logout
                      </button>
                    </div>
                  )}
              </li>
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
          
          {/* New Booking Flow Routes */}
          <Route path="/schedules" element={<AvailableBuses />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/select-seats" element={<SeatSelection />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/ticket" element={<TicketPage />} />
          
          {/* Other public routes */}
          <Route path="/routes" element={<ViewRoutes />} />
          <Route path="/timetable" element={<ViewTimetable />} />
          <Route path="/busSchedule" element={<BusSchedule />} />
          <Route path="/view-schedules" element={<ViewBusSchedules />} />

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
              <ProfilePage />
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
            <Route path="users" element={<ManageUsers />} />
            <Route path="activity-log" element={<UserActivityLog />} />
            <Route path="reports" element={<CustomerFeedback />} />
            <Route path="feedback" element={<CustomerFeedback />} />
          </Route>

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

          {/* Bus Operator Routes with New Layout */}
          <Route path="/operator" element={
            <ProtectedRoute allowedRoles={['bus operator', 'bus_operator']}>
              <BusOperatorDashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<BusOperatorDashboardMain />} />
            <Route path="dashboard" element={<BusOperatorDashboardMain />} />
            <Route path="buses" element={<OperatorMyBuses />} />
            <Route path="bookings" element={<OperatorBookings />} />
            <Route path="track" element={<OperatorTrackBuses />} />
            <Route path="reports" element={<OperatorReports />} />
          </Route>

          {/* Bus Driver Routes */}
          <Route path="/driver/dashboard" element={
            <ProtectedRoute allowedRoles={['bus_driver', 'bus driver']}>
              <BusDriverDashboard />
            </ProtectedRoute>
          } />
          <Route path="/driver/routes" element={
            <ProtectedRoute allowedRoles={['bus_driver', 'bus driver']}>
              <RouteTable />
            </ProtectedRoute>
          } />
          <Route path="/driver/qr-scanner" element={
            <ProtectedRoute allowedRoles={['bus_driver', 'bus driver']}>
              <QRScanner />
            </ProtectedRoute>
          } />
          <Route path="/driver/tracking" element={
            <ProtectedRoute allowedRoles={['bus_driver', 'bus driver']}>
              <BusTracker />
            </ProtectedRoute>
          } />
          <Route path="/driver/schedule" element={
            <ProtectedRoute allowedRoles={['bus_driver', 'bus driver']}>
              <BusSchedule />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;