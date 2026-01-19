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
    <div className="seat-page">
      <h3>Bus Seat Booking</h3>

      {/* Booking Form */}
      <div className="booking-form">
        <input
          placeholder="Passenger Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          type="number"
          min="1"
          max="10"
          placeholder="Number of Passengers"
          value={passengers}
          onChange={e => setPassengers(e.target.value)}
        />

        <select value={busNo} onChange={e => setBusNo(e.target.value)}>
          <option value="">Select Bus</option>
          {buses.map(bus => (
            <option key={bus.bus_id} value={bus.bus_no}>
              {bus.bus_no} - {bus.bus_route || ""}
            </option>
          ))}
        </select>
      </div>

      {/* Seat Layout */}
      <div className="bus-container">
        {seats.map(seat => (
          <div
            key={seat}
            className={`seat
              ${booked.includes(seat) ? "booked" : ""}
              ${selected.includes(seat) ? "selected" : ""}
            `}
            onClick={() => toggleSeat(seat)}
          >
            {seat}
          </div>
        ))}
      </div>

      <button className="confirm-btn" onClick={confirmBooking}>Confirm Booking</button>

      {/* Tickets & QR Codes */}
      {tickets.length > 0 && (
        <div className="ticket-section">
          <h4>Tickets & QR Codes</h4>
          {tickets.map(ticket => (
            <div key={ticket.seat_no} className="ticket">
              <p>Passenger: {ticket.passenger_name}</p>
              <p>Bus: {ticket.bus_no}</p>
              <p>Seat: {ticket.seat_no}</p>
              <QRCodeCanvas
                value={`Bus:${ticket.bus_no}|Seat:${ticket.seat_no}|Name:${ticket.passenger_name}`}
                size={128}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
