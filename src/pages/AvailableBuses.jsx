import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function AvailableBuses() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const fromCity = searchParams.get('from');
  const toCity = searchParams.get('to');
  const travelDate = searchParams.get('date');

  useEffect(() => {
    if (!fromCity || !toCity || !travelDate) {
      setError("Invalid search parameters");
      setLoading(false);
      return;
    }

    fetchBuses();
  }, [fromCity, toCity, travelDate]);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost/qrsys/api/search_buses.php?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}`
      );
      const data = await response.json();
      
      if (data.success) {
        setBuses(data.data);
      } else {
        setError(data.message || "No buses found");
      }
    } catch (err) {
      console.error("Error fetching buses:", err);
      setError("Failed to load buses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (bus) => {
    // Store booking info and navigate to booking page
    navigate(`/booking?busId=${bus.bus_id}&busNo=${encodeURIComponent(bus.bus_no)}&date=${travelDate}`, {
      state: {
        bus: bus,
        travelDate: travelDate,
        fromCity: fromCity,
        toCity: toCity
      }
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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

  return (
    <>
      <div className="container mt-5 pt-5">
        {/* Modern Search Summary Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-lg" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px'
            }}>
              <div className="card-body p-4">
                <div className="row align-items-center text-white">
                  <div className="col-md-8">
                    <h3 className="mb-3" style={{ fontWeight: '700' }}>
                      <i className="icon-search me-2"></i>Available Buses
                    </h3>
                    <div className="d-flex flex-wrap gap-4 align-items-center">
                      <div className="d-flex align-items-center">
                        <div className="bg-white bg-opacity-25 rounded-circle p-2 me-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="icon-location-pin" style={{ fontSize: '20px' }}></i>
                        </div>
                        <div>
                          <small className="opacity-75">From</small>
                          <div style={{ fontSize: '18px', fontWeight: '600' }}>{fromCity}</div>
                        </div>
                      </div>
                      
                      <div>
                        <i className="icon-arrow-right" style={{ fontSize: '28px', opacity: 0.7 }}></i>
                      </div>
                      
                      <div className="d-flex align-items-center">
                        <div className="bg-white bg-opacity-25 rounded-circle p-2 me-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="icon-location-pin" style={{ fontSize: '20px' }}></i>
                        </div>
                        <div>
                          <small className="opacity-75">To</small>
                          <div style={{ fontSize: '18px', fontWeight: '600' }}>{toCity}</div>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center">
                        <div className="bg-white bg-opacity-25 rounded-circle p-2 me-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="icon-calendar" style={{ fontSize: '20px' }}></i>
                        </div>
                        <div>
                          <small className="opacity-75">Travel Date</small>
                          <div style={{ fontSize: '16px', fontWeight: '600' }}>
                            {new Date(travelDate).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <button 
                      className="btn btn-light btn-lg px-4"
                      onClick={() => navigate('/')}
                      style={{ 
                        borderRadius: '15px',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                      }}
                    >
                      <i className="icon-edit me-2"></i>
                      Modify Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {buses.length > 0 && (
          <div className="mb-4">
            <h5 className="text-muted">
              <i className="icon-bus me-2"></i>
              Found {buses.length} bus{buses.length !== 1 ? 'es' : ''} for your journey
            </h5>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-warning border-0 shadow-sm" role="alert" style={{ borderRadius: '15px' }}>
            <div className="d-flex align-items-center">
              <i className="icon-info-circle me-3" style={{ fontSize: '24px' }}></i>
              <div className="flex-grow-1">
                <strong>No buses found</strong>
                <p className="mb-0 mt-1">{error}</p>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/')}
                style={{ borderRadius: '10px' }}
              >
                Search Again
              </button>
            </div>
          </div>
        )}

        {/* Modern Bus List */}
        {buses.length > 0 ? (
          <div className="row">
            {buses.map((bus, index) => (
              <div key={bus.bus_id} className="col-md-12 mb-4">
                <div 
                  className="card border-0 shadow-sm" 
                  style={{ 
                    borderRadius: '20px',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                  }}
                >
                  <div className="card-body p-4">
                    <div className="row align-items-center">
                      {/* Bus Icon & Info */}
                      <div className="col-md-3">
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle p-3 me-3" 
                            style={{ 
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              width: '60px',
                              height: '60px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <i className="icon-bus" style={{ fontSize: '28px', color: 'white' }}></i>
                          </div>
                          <div>
                            <h5 className="mb-1" style={{ fontWeight: '700', color: '#667eea' }}>
                              {bus.bus_no}
                            </h5>
                            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                              {bus.bus_route}
                            </p>
                            <div className="mt-1">
                              <span className="badge" style={{ 
                                backgroundColor: '#e3f2fd', 
                                color: '#1976d2',
                                fontSize: '11px',
                                padding: '4px 10px',
                                borderRadius: '8px'
                              }}>
                                <i className="icon-grid" style={{ fontSize: '10px' }}></i> {bus.no_of_seats} Seats
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Journey Timeline */}
                      <div className="col-md-4 text-center my-3 my-md-0">
                        <div className="position-relative">
                          <div className="d-flex justify-content-between align-items-center">
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontSize: '24px', 
                                fontWeight: '700',
                                color: '#2c3e50'
                              }}>
                                {formatTime(bus.start_time)}
                              </div>
                              <small className="text-muted d-block" style={{ fontSize: '12px' }}>
                                {fromCity}
                              </small>
                            </div>
                            
                            <div style={{ 
                              flex: 1, 
                              padding: '0 20px',
                              position: 'relative'
                            }}>
                              <div style={{
                                height: '2px',
                                background: 'linear-gradient(to right, #667eea, #764ba2)',
                                position: 'relative'
                              }}>
                                <div style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  background: 'white',
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  border: '2px solid #667eea',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: '#667eea',
                                  whiteSpace: 'nowrap'
                                }}>
                                  <i className="icon-clock" style={{ fontSize: '10px' }}></i> Journey
                                </div>
                              </div>
                              <i className="icon-arrow-right" style={{ 
                                fontSize: '20px', 
                                color: '#667eea',
                                position: 'absolute',
                                right: '10px',
                                top: '-8px'
                              }}></i>
                            </div>
                            
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontSize: '24px', 
                                fontWeight: '700',
                                color: '#2c3e50'
                              }}>
                                {formatTime(bus.reach_time)}
                              </div>
                              <small className="text-muted d-block" style={{ fontSize: '12px' }}>
                                {toCity}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fare & Action */}
                      <div className="col-md-5">
                        <div className="row align-items-center">
                          <div className="col-6 text-center">
                            <div className="mb-2">
                              <small className="text-muted d-block" style={{ fontSize: '12px' }}>
                                Fare Per Seat
                              </small>
                              <div style={{ 
                                fontSize: '32px', 
                                fontWeight: '700',
                                color: '#27ae60'
                              }}>
                                Rs. {bus.base_fare || '0'}
                              </div>
                            </div>
                            <div>
                              <i className="icon-phone me-2" style={{ fontSize: '12px', color: '#999' }}></i>
                              <small className="text-muted">{bus.bus_service_tel}</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <button 
                              className="btn btn-lg w-100"
                              onClick={() => handleBookNow(bus)}
                              style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                borderRadius: '15px',
                                fontWeight: '700',
                                fontSize: '16px',
                                padding: '15px',
                                border: 'none',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                              }}
                            >
                              <i className="icon-ticket me-2"></i>
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !error && (
            <div className="text-center py-5">
              <div style={{ opacity: 0.3, marginBottom: '30px' }}>
                <i className="icon-bus" style={{ fontSize: '120px', color: '#ccc' }}></i>
              </div>
              <h4 className="text-muted mb-3">No buses available for this route</h4>
              <p className="text-muted mb-4">Try searching for a different route or date</p>
              <button 
                className="btn btn-primary btn-lg px-5"
                onClick={() => navigate('/')}
                style={{ 
                  borderRadius: '15px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                <i className="icon-search me-2"></i>
                Try Different Route
              </button>
            </div>
          )
        )}
      </div>
    </>
  );
}
