import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react"; // new import style
import "../assets/styles.css";

export default function BusSeatLayout() {
  const [buses, setBuses] = useState([]);
  const [busNo, setBusNo] = useState("");
  const [name, setName] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [seats, setSeats] = useState([]);
  const [booked, setBooked] = useState([]);
  const [selected, setSelected] = useState([]);
  const [tickets, setTickets] = useState([]);

  // Load buses from API
  useEffect(() => {
    fetch("http://localhost/qrsys/api/get_buses.php")
      .then(res => res.json())
      .then(data => setBuses(data))
      .catch(err => console.error("Error fetching buses:", err));
  }, []);

  // Load seats when bus changes
  useEffect(() => {
    if (!busNo) return;

    fetch(`http://localhost/qrsys/api/get_bus_seats.php?bus_no=${encodeURIComponent(busNo)}`)
      .then(res => res.json())
      .then(data => {
        setBooked(data.booked_seats || []);
        generateSeats(data.total_seats || 0);
        setSelected([]);
      })
      .catch(err => console.error("Error fetching seats:", err));
  }, [busNo]);

  // Generate seat list
  const generateSeats = (count) => {
    setSeats(Array.from({ length: count }, (_, i) => `S${i + 1}`));
  };

  // Toggle seat selection
  const toggleSeat = (seat) => {
    if (booked.includes(seat)) return;

    if (selected.length >= passengers && !selected.includes(seat)) {
      alert(`You can only select ${passengers} seat(s)`);
      return;
    }

    setSelected(prev =>
      prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat]
    );
  };

  // Confirm booking
  const confirmBooking = () => {
    if (!name || !busNo || selected.length === 0) {
      alert("Fill passenger name, bus, number of passengers & select seats");
      return;
    }

    if (selected.length !== Number(passengers)) {
      alert(`Please select exactly ${passengers} seat(s)`);
      return;
    }

    const bookingData = {
      passenger_name: name,
      bus_no: busNo,
      seats: selected // send as array
    };

    fetch("http://localhost/qrsys/api/save_booking.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
    })
      .then(res => res.json())
      .then((data) => {
        console.log("Booking API response:", data);

        if (data.status !== "success") {
          alert("Booking failed: " + (data.message || "Unknown error"));
          return;
        }

        alert("Booking successful!");

        const newTickets = selected.map(seat => ({
          passenger_name: name,
          bus_no: busNo,
          seat_no: seat
        }));

        setTickets(newTickets);
        setBooked([...booked, ...selected]);
        setSelected([]);
      })
      .catch(err => {
        console.error(err);
        alert("Server error");
      });
  };

  return (
    <div className="seat-page-modern">
      {/* Hero Header */}
      <div className="seat-hero-header">
        <h1 className="seat-hero-title">
          Book Your Journey <span className="text-gradient">With Confidence</span>
        </h1>
        <p className="seat-hero-subtitle">
          Select your preferred seats and travel comfortably. Easy booking process with instant QR tickets.
        </p>
      </div>

      {/* Booking Form Card */}
      <div className="seat-booking-card">
        <h3 className="booking-card-title">Passenger Information</h3>
        <div className="booking-form-modern">
          <div className="form-group-modern">
            <label className="form-label-modern">
              <i className="icon-user"></i> Passenger Name
            </label>
            <input
              className="form-input-modern"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group-modern">
            <label className="form-label-modern">
              <i className="icon-users"></i> Number of Passengers
            </label>
            <input
              className="form-input-modern"
              type="number"
              min="1"
              max="10"
              placeholder="How many passengers?"
              value={passengers}
              onChange={e => setPassengers(e.target.value)}
            />
          </div>

          <div className="form-group-modern">
            <label className="form-label-modern">
              <i className="icon-bus"></i> Select Bus
            </label>
            <select 
              className="form-select-modern" 
              value={busNo} 
              onChange={e => setBusNo(e.target.value)}
            >
              <option value="">Choose your bus</option>
              {buses.map(bus => (
                <option key={bus.bus_id} value={bus.bus_no}>
                  {bus.bus_no} - {bus.bus_route || "No route specified"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Seat Selection Section */}
      {busNo && (
        <div className="seat-selection-card">
          <div className="seat-header">
            <h3 className="seat-card-title">Select Your Seats</h3>
            <div className="seat-legend">
              <div className="legend-item">
                <div className="legend-box available"></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="legend-box selected"></div>
                <span>Selected</span>
              </div>
              <div className="legend-item">
                <div className="legend-box booked"></div>
                <span>Booked</span>
              </div>
            </div>
          </div>

          {/* Bus Layout */}
          <div className="bus-layout-container">
            <div className="bus-driver-section">
              <div className="driver-wheel">🚗</div>
            </div>
            <div className="bus-seats-grid">
              {seats.map(seat => (
                <div
                  key={seat}
                  className={`seat-modern
                    ${booked.includes(seat) ? "seat-booked" : ""}
                    ${selected.includes(seat) ? "seat-selected" : ""}
                  `}
                  onClick={() => toggleSeat(seat)}
                  title={booked.includes(seat) ? "Already booked" : "Click to select"}
                >
                  <span className="seat-number">{seat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="selected-info">
            <p>Selected Seats: <strong>{selected.length > 0 ? selected.join(", ") : "None"}</strong></p>
          </div>

          <button 
            className="confirm-btn-modern" 
            onClick={confirmBooking}
            disabled={selected.length === 0}
          >
            <span className="btn-icon">✓</span> Confirm Booking
          </button>
        </div>
      )}

      {/* Tickets & QR Codes */}
      {tickets.length > 0 && (
        <div className="ticket-section-modern">
          <h3 className="ticket-section-title">Your Tickets</h3>
          <p className="ticket-section-subtitle">Present these QR codes when boarding</p>
          <div className="tickets-grid">
            {tickets.map(ticket => (
              <div key={ticket.seat_no} className="ticket-card-modern">
                <div className="ticket-header">
                  <h4>🎫 Ticket</h4>
                  <span className="ticket-badge">Confirmed</span>
                </div>
                <div className="ticket-details">
                  <div className="ticket-detail-row">
                    <span className="detail-label">Passenger:</span>
                    <span className="detail-value">{ticket.passenger_name}</span>
                  </div>
                  <div className="ticket-detail-row">
                    <span className="detail-label">Bus No:</span>
                    <span className="detail-value">{ticket.bus_no}</span>
                  </div>
                  <div className="ticket-detail-row">
                    <span className="detail-label">Seat:</span>
                    <span className="detail-value highlight">{ticket.seat_no}</span>
                  </div>
                </div>
                <div className="ticket-qr">
                  <QRCodeCanvas
                    value={`Bus:${ticket.bus_no}|Seat:${ticket.seat_no}|Name:${ticket.passenger_name}`}
                    size={150}
                    level="H"
                  />
                </div>
                <button className="download-btn" onClick={() => window.print()}>
                  📥 Download Ticket
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
