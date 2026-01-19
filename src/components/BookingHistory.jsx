import React, { useEffect, useState } from "react";

export default function BookingHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("http://localhost/qrsys/api/get_booking_history.php")
      .then(res => res.json())
      .then(setHistory);
  }, []);

  return (
    <div>
      <h3>Booking History</h3>
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Name</th>
            <th>Bus</th>
            <th>Seat</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, i) => (
            <tr key={i}>
              <td>{h.passenger_name}</td>
              <td>{h.bus_no}</td>
              <td>{h.seat_no}</td>
              <td>{h.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
