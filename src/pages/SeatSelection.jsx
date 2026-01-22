import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Footer from '../components/Footer';

export default function SeatSelection() {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const busId = searchParams.get('busId');
  const busNo = searchParams.get('busNo');
  const travelDate = searchParams.get('date');
  const passengerCount = parseInt(searchParams.get('passengers')) || 1;

  const [seats, setSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bus, setBus] = useState(location.state?.bus || null);

  useEffect(() => {
    if (!user) {
      navigate(`/booking?busId=${busId}&busNo=${busNo}&date=${travelDate}`);
      return;
    }

    fetchSeatsAndBookings();
  }, [busId, travelDate]);

  const fetchSeatsAndBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch all seats for this bus
      const seatsResponse = await fetch(`http://localhost/qrsys/api/get_bus_seats.php?bus_id=${busId}`);
      const seatsData = await seatsResponse.json();
      
      if (seatsData.success) {
        setSeats(seatsData.data);
        
        // Fetch booked seats for this bus and date
        const bookingsResponse = await fetch(
          `http://localhost/qrsys/api/get_booked_seats.php?bus_id=${busId}&travel_date=${travelDate}`
        );
        const bookingsData = await bookingsResponse.json();
        
        if (bookingsData.success) {
          setBookedSeats(bookingsData.booked_seats || []);
        }
      }
    } catch (err) {
      console.error("Error fetching seats:", err);
      alert("Failed to load seats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSeatBooked = (seatNo) => {
    // Normalize seat numbers - remove 'S' prefix if exists and compare
    const normalizedSeat = seatNo.toString().replace(/^S/i, '');
    return bookedSeats.some(booked => {
      const normalizedBooked = booked.toString().replace(/^S/i, '');
      return normalizedBooked === normalizedSeat;
    });
  };

  const isSeatSelected = (seatNo) => {
    return selectedSeats.includes(seatNo);
  };

  const handleSeatClick = (seat) => {
    if (isSeatBooked(seat.seat_no)) {
      return; // Can't select booked seats
    }

    if (isSeatSelected(seat.seat_no)) {
      // Deselect
      setSelectedSeats(selectedSeats.filter(s => s !== seat.seat_no));
    } else {
      // Select if not exceeded passenger count
      if (selectedSeats.length < passengerCount) {
        setSelectedSeats([...selectedSeats, seat.seat_no]);
      } else {
        alert(`You can only select ${passengerCount} seat(s)`);
      }
    }
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length !== passengerCount) {
      alert(`Please select exactly ${passengerCount} seat(s)`);
      return;
    }

    // Navigate to payment page
    navigate('/payment', {
      state: {
        bus: bus,
        busId: busId,
        busNo: busNo,
        travelDate: travelDate,
        selectedSeats: selectedSeats,
        passengerCount: passengerCount,
        totalAmount: (bus?.base_fare || 100) * selectedSeats.length,
        fromCity: location.state?.fromCity,
        toCity: location.state?.toCity
      }
    });
  };

  const renderSeatLayout = () => {
    if (seats.length === 0) return null;

    const rows = Math.max(...seats.map(s => s.row_no));
    const cols = Math.max(...seats.map(s => s.col_no));
    const aisleAfter = bus?.aisle_after_column || 2;

    const layout = [];
    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      for (let col = 1; col <= cols; col++) {
        const seat = seats.find(s => s.row_no === row && s.col_no === col);
        
        if (seat) {
          const isBooked = isSeatBooked(seat.seat_no);
          const isSelected = isSeatSelected(seat.seat_no);
          const isLarge = seat.is_large_seat === 1;

          rowSeats.push(
            <div 
              key={`${row}-${col}`}
              className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''} ${isLarge ? 'large-seat' : ''}`}
              onClick={() => handleSeatClick(seat)}
              style={{
                width: isLarge ? '60px' : '45px',
                height: '45px',
                margin: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderColor: isBooked ? '#dc3545' : isSelected ? '#28a745' : '#007bff',
                borderRadius: '8px',
                backgroundColor: isBooked ? '#f8d7da' : isSelected ? '#d4edda' : '#e7f3ff',
                cursor: isBooked ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
                transition: 'all 0.2s'
              }}
            >
              {seat.seat_no}
            </div>
          );
        }

        // Add aisle spacing
        if (col === aisleAfter && col < cols) {
          rowSeats.push(
            <div key={`aisle-${row}-${col}`} style={{ width: '30px' }}></div>
          );
        }
      }

      layout.push(
        <div key={`row-${row}`} className="d-flex justify-content-center mb-2">
          <div className="me-3" style={{ width: '30px', textAlign: 'center', fontWeight: 'bold' }}>
            {row}
          </div>
          {rowSeats}
        </div>
      );
    }

    return layout;
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
        <div className="row">
          {/* Seat Layout */}
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="icon-grid"></i> Select Your Seats - {busNo}
                </h5>
              </div>
              <div className="card-body p-4">
                {/* Bus Front Indicator */}
                <div className="text-center mb-4">
                  <div className="d-inline-block px-4 py-2 bg-secondary text-white rounded" style={{ fontSize: '14px' }}>
                    <i className="icon-steering"></i> Driver
                  </div>
                </div>

                {/* Seat Layout */}
                <div className="seat-layout">
                  {renderSeatLayout()}
                </div>

                {/* Legend */}
                <div className="mt-4 d-flex justify-content-center gap-4 flex-wrap">
                  <div className="d-flex align-items-center">
                    <div style={{ 
                      width: '25px', 
                      height: '25px', 
                      backgroundColor: '#e7f3ff', 
                      border: '2px solid #007bff',
                      borderRadius: '4px',
                      marginRight: '8px'
                    }}></div>
                    <span>Available</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div style={{ 
                      width: '25px', 
                      height: '25px', 
                      backgroundColor: '#d4edda', 
                      border: '2px solid #28a745',
                      borderRadius: '4px',
                      marginRight: '8px'
                    }}></div>
                    <span>Selected</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div style={{ 
                      width: '25px', 
                      height: '25px', 
                      backgroundColor: '#f8d7da', 
                      border: '2px solid #dc3545',
                      borderRadius: '4px',
                      marginRight: '8px'
                    }}></div>
                    <span>Booked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="col-md-4">
            <div className="card shadow-sm sticky-top" style={{ top: '100px' }}>
              <div className="card-header bg-light">
                <h5 className="mb-0">Booking Summary</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <strong>Bus:</strong> {busNo}
                </div>
                <div className="mb-3">
                  <strong>Date:</strong><br />
                  {new Date(travelDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="mb-3">
                  <strong>Passengers:</strong> {passengerCount}
                </div>
                <div className="mb-3">
                  <strong>Selected Seats:</strong>
                  <div className="mt-2">
                    {selectedSeats.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {selectedSeats.map(seat => (
                          <span key={seat} className="badge bg-success" style={{ fontSize: '14px' }}>
                            {seat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">No seats selected</span>
                    )}
                  </div>
                  <small className="text-muted">
                    {selectedSeats.length}/{passengerCount} selected
                  </small>
                </div>
                
                <hr />
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Fare per seat:</span>
                    <span>Rs. {bus?.base_fare || 100}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Seats:</span>
                    <span>× {selectedSeats.length}</span>
                  </div>
                </div>
                
                <div className="alert alert-success mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>Total:</strong>
                    <h4 className="mb-0">Rs. {((bus?.base_fare || 100) * selectedSeats.length).toFixed(2)}</h4>
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-lg w-100 mb-2"
                  onClick={handleProceedToPayment}
                  disabled={selectedSeats.length !== passengerCount}
                  style={{
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  Proceed to Payment
                </button>
                
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={() => navigate(-1)}
                >
                  <i className="icon-arrow-left"></i> Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

     <style jsx>{`
        
        .seat-layout {
          display: flex;
          flex-direction: column; 
          gap: 10px; 
          align-items: center; 
        }

        .seat:hover:not(.booked) {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .large-seat {
           width: 60px !important;
        }
      `}</style>
      <Footer />
    </>
  );
}
