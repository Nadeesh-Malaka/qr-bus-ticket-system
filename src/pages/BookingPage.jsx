import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";
import Footer from '../components/Footer';

export default function BookingPage() {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bus, setBus] = useState(location.state?.bus || null);
  const [travelDate, setTravelDate] = useState(searchParams.get('date') || location.state?.travelDate || '');
  const [passengerCount, setPassengerCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  
  const busId = searchParams.get('busId');
  const busNo = searchParams.get('busNo');

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // Fetch full user data including email and mobile
    if (user && user.user_id) {
      fetchUserData();
    }

    // If bus data not in state, fetch it
    if (!bus && busId) {
      fetchBusDetails();
    }
  }, [user, bus, busId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://localhost/qrsys/api/get_users.php?user_id=${user.user_id}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setUserData(data[0]);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const fetchBusDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost/qrsys/api/get_bus_api.php?bus_id=${busId}`);
      const data = await response.json();
      if (data) {
        setBus(data);
      }
    } catch (err) {
      console.error("Error fetching bus details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // After login, stay on same page - user context will update
    window.location.reload();
  };

  const handleProceedToSeats = () => {
    if (!travelDate) {
      alert("Please select a travel date");
      return;
    }

    if (passengerCount < 1) {
      alert("Please select at least 1 passenger");
      return;
    }

    // Navigate to seat selection
    navigate(`/select-seats?busId=${busId}&busNo=${encodeURIComponent(busNo)}&date=${travelDate}&passengers=${passengerCount}`, {
      state: {
        bus: bus,
        travelDate: travelDate,
        passengerCount: passengerCount,
        fromCity: location.state?.fromCity,
        toCity: location.state?.toCity
      }
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginModal 
          show={showLoginModal} 
          onHide={() => {
            setShowLoginModal(false);
            navigate(-1); // Go back if user closes without logging in
          }}
          onLoginSuccess={handleLoginSuccess}
        />
        <div className="container mt-5 pt-5 text-center">
          <h3>Please login to continue booking</h3>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => setShowLoginModal(true)}
          >
            Login / Sign Up
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            {/* Booking Header */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">
                  <i className="icon-ticket"></i> Book Your Seats
                </h4>
              </div>
              <div className="card-body">
                {bus && (
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h5 className="text-primary">{bus.bus_no}</h5>
                      <p className="mb-1"><strong>Route:</strong> {bus.bus_route}</p>
                      <p className="mb-1"><strong>Available Seats:</strong> {bus.no_of_seats}</p>
                    </div>
                    <div className="col-md-6 text-end">
                      <p className="mb-1"><strong>Fare:</strong> <span className="text-success h5">Rs. {bus.base_fare || '100.00'}</span> per seat</p>
                      <p className="mb-1"><strong>Contact:</strong> {bus.bus_service_tel}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Form */}
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h5 className="mb-4">Booking Details</h5>
                
                {/* Travel Date */}
                <div className="mb-4">
                  <label className="form-label">
                    <i className="icon-calendar"></i> Travel Date <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="date"
                    className="form-control form-control-lg"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    style={{ 
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0'
                    }}
                  />
                  <small className="text-muted">Select your preferred travel date</small>
                </div>

                {/* Passenger Count */}
                <div className="mb-4">
                  <label className="form-label">
                    <i className="icon-users"></i> Number of Passengers <span className="text-danger">*</span>
                  </label>
                  <select 
                    className="form-control form-control-lg"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(parseInt(e.target.value))}
                    style={{ 
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0'
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  <small className="text-muted">You'll select {passengerCount} seat{passengerCount > 1 ? 's' : ''} in the next step</small>
                </div>

                {/* Total Estimate */}
                <div className="alert alert-info">
                  <div className="d-flex justify-content-between align-items-center">
                    <span><strong>Estimated Total:</strong></span>
                    <span className="h4 mb-0 text-primary">
                      Rs. {((bus?.base_fare || 100) * passengerCount).toFixed(2)}
                    </span>
                  </div>
                  <small className="text-muted d-block mt-2">
                    <i className="icon-info-circle"></i> Final amount may vary based on seat selection
                  </small>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-3 mt-4">
                  <button 
                    className="btn btn-outline-secondary btn-lg flex-grow-1"
                    onClick={() => navigate(-1)}
                  >
                    <i className="icon-arrow-left"></i> Back
                  </button>
                  <button 
                    className="btn btn-primary btn-lg flex-grow-1"
                    onClick={handleProceedToSeats}
                    style={{
                      borderRadius: '8px',
                      fontWeight: '600'
                    }}
                  >
                    Proceed to Seat Selection <i className="icon-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="card shadow-sm mt-4">
              <div className="card-body">
                <h6 className="mb-3">Booking for:</h6>
                <p className="mb-1"><strong>Name:</strong> {userData?.full_name || user?.full_name || 'N/A'}</p>
                <p className="mb-1"><strong>Email:</strong> {userData?.gmail || user?.email || 'N/A'}</p>
                <p className="mb-0"><strong>Mobile:</strong> {userData?.mobile_no || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
