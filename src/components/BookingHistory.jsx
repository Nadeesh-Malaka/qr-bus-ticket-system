import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function BookingHistory() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, confirmed

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchBookingHistory();
  }, [user]);

  const fetchBookingHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost/qrsys/api/get_booking_history.php?user_id=${encodeURIComponent(user.user_id)}`
      );
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.data);
      } else {
        setError(data.message || "Failed to load booking history");
      }
    } catch (err) {
      console.error("Error fetching booking history:", err);
      setError("Failed to load booking history");
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = (booking) => {
    // Get the first booking ID for this reference
    fetch(`http://localhost/qrsys/api/get_booking_by_reference.php?reference_no=${booking.reference_no}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          const firstBooking = data.data[0];
          navigate('/payment', {
            state: {
              bus: {
                bus_id: booking.bus_id,
                bus_no: booking.bus_no,
                bus_route: booking.bus_route,
                base_fare: booking.total_amount / booking.seat_count
              },
              busId: booking.bus_id,
              busNo: booking.bus_no,
              travelDate: booking.travel_date,
              selectedSeats: booking.seat_numbers.split(', '),
              totalAmount: booking.total_amount,
              passengerCount: booking.seat_count,
              bookingId: firstBooking.seat_booking_id,
              fromPendingBooking: true
            }
          });
        }
      });
  };

  const handleViewTicket = (booking) => {
    navigate('/ticket', {
      state: {
        ticketData: {
          ticket_number: booking.ticket_number,
          ticket_id: booking.ticket_id,
          booking_ref: booking.reference_no,
          bus_no: booking.bus_no,
          bus_route: booking.bus_route,
          travel_date: booking.travel_date,
          passenger_name: booking.passenger_name,
          seats: booking.seat_numbers.split(', '),
          total_amount: booking.total_amount,
          qr_code_data: JSON.stringify({
            ticket_number: booking.ticket_number,
            booking_ref: booking.reference_no,
            bus_no: booking.bus_no,
            travel_date: booking.travel_date,
            seats: booking.seat_numbers.split(', '),
            passenger: booking.passenger_name
          })
        }
      }
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fff3cd', color: '#856404', icon: 'clock' },
      confirmed: { bg: '#d4edda', color: '#155724', icon: 'check-circle' },
      cancelled: { bg: '#f8d7da', color: '#721c24', icon: 'x-circle' }
    };
    
    const style = styles[status] || styles.pending;
    
    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.color,
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        <i className={`icon-${style.icon}`} style={{ fontSize: '14px' }}></i>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true;
    return booking.booking_status === filter;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 style={{ fontWeight: '700', color: '#2c3e50' }}>
              <i className="icon-clock me-2"></i>
              Booking History
            </h2>
            <div className="btn-group" role="group">
              <button
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('all')}
              >
                All ({bookings.length})
              </button>
              <button
                className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => setFilter('pending')}
              >
                Pending ({bookings.filter(b => b.booking_status === 'pending').length})
              </button>
              <button
                className={`btn ${filter === 'confirmed' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setFilter('confirmed')}
              >
                Confirmed ({bookings.filter(b => b.booking_status === 'confirmed').length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="icon-alert-circle me-2"></i>
          {error}
        </div>
      )}

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ opacity: 0.3, marginBottom: '30px' }}>
            <i className="icon-calendar" style={{ fontSize: '120px', color: '#ccc' }}></i>
          </div>
          <h4 className="text-muted mb-3">No bookings found</h4>
          <p className="text-muted mb-4">
            {filter !== 'all' 
              ? `You don't have any ${filter} bookings.` 
              : "You haven't made any bookings yet."}
          </p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/')}
            style={{ 
              borderRadius: '15px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            <i className="icon-search me-2"></i>
            Book a Bus
          </button>
        </div>
      ) : (
        <div className="row">
          {filteredBookings.map((booking, index) => (
            <div key={index} className="col-12 mb-4">
              <div 
                className="card border-0 shadow-sm"
                style={{ 
                  borderRadius: '20px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                }}
              >
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    {/* Bus Info */}
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle p-3 me-3" 
                          style={{ 
                            background: booking.booking_status === 'confirmed' 
                              ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                              : 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
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
                            {booking.bus_no}
                          </h5>
                          <small className="text-muted d-block" style={{ fontSize: '12px' }}>
                            {booking.bus_route}
                          </small>
                          <small className="text-muted" style={{ fontSize: '11px' }}>
                            Ref: {booking.reference_no.substring(0, 12)}...
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Route & Date */}
                    <div className="col-md-4">
                      <div className="mb-2">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <strong style={{ fontSize: '15px' }}>{booking.start_city}</strong>
                          <i className="icon-arrow-right" style={{ color: '#667eea' }}></i>
                          <strong style={{ fontSize: '15px' }}>{booking.end_city}</strong>
                        </div>
                        <div className="text-muted" style={{ fontSize: '13px' }}>
                          <i className="icon-calendar me-1"></i>
                          {new Date(booking.travel_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div>
                        <span className="badge bg-light text-dark" style={{ fontSize: '12px', padding: '6px 12px' }}>
                          <i className="icon-grid me-1"></i>
                          Seats: {booking.seat_numbers}
                        </span>
                      </div>
                    </div>

                    {/* Status & Amount */}
                    <div className="col-md-2 text-center">
                      <div className="mb-2">
                        {getStatusBadge(booking.booking_status)}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#27ae60' }}>
                        Rs. {booking.total_amount}
                      </div>
                      <small className="text-muted">{booking.seat_count} seat(s)</small>
                    </div>

                    {/* Actions */}
                    <div className="col-md-3 text-end">
                      {booking.booking_status === 'confirmed' && booking.ticket_number ? (
                        <button
                          className="btn btn-success btn-lg w-100 mb-2"
                          onClick={() => handleViewTicket(booking)}
                          style={{
                            borderRadius: '12px',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                          }}
                        >
                          <i className="icon-ticket me-2"></i>
                          View Ticket
                        </button>
                      ) : booking.booking_status === 'pending' ? (
                        <button
                          className="btn btn-warning btn-lg w-100 mb-2"
                          onClick={() => handleCompletePayment(booking)}
                          style={{
                            borderRadius: '12px',
                            fontWeight: '600',
                            color: '#fff',
                            background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)'
                          }}
                        >
                          <i className="icon-credit-card me-2"></i>
                          Complete Payment
                        </button>
                      ) : null}
                      
                      <small className="text-muted d-block mt-2" style={{ fontSize: '11px' }}>
                        Booked: {new Date(booking.created_at).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
