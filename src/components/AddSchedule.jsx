import React, { useState, useEffect } from "react";

export default function AddSchedule() {
  const [busId, setBusId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState("");

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);

  /* 🔹 Load buses & routes */
  useEffect(() => {
    fetch("http://localhost/qrsys/api/get_buses.php")
      .then(res => res.json())
      .then(data => setBuses(data))
      .catch(err => console.error(err));

    fetch("http://localhost/qrsys/api/get_routes.php")
      .then(res => res.json())
      .then(data => setRoutes(data))
      .catch(err => console.error(err));
  }, []);

  /* 🔹 Submit schedule */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      bus_id: busId,
      route_id: routeId,
      start_time: startTime,
      end_time: endTime,
      schedule_date: date
    };

    try {
      const res = await fetch("http://localhost/qrsys/api/add_schedule.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.status) {
        alert("✅ Schedule added successfully!");

        // Reset form
        setBusId("");
        setRouteId("");
        setStartTime("");
        setEndTime("");
        setDate("");
      } else {
        alert("❌ Insert failed");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server error");
    }
  };

  return (
    <div className="main-center">
    <div className="form-container">
    <form onSubmit={handleSubmit}>

      <h2 className="form-title">Add Bus Schedule</h2>

      <label className="form-label">Bus Number*</label>
      <select className="form-select" value={busId} onChange={e => setBusId(e.target.value)} required>
        <option value="">Select Bus</option>
        {buses.map(bus => (
          <option key={bus.bus_id} value={bus.bus_id}>
            {bus.bus_no}
          </option>
        ))}
      </select>

      <label className="form-label">Route Name*</label>
      <select className="form-select" value={routeId} onChange={e => setRouteId(e.target.value)} required>
        <option value="">Select Route*</option>
        {routes.map(route => (
          <option key={route.route_id} value={route.route_id}>
            {route.route_name}
          </option>
        ))}
      </select>

      <label className="form-label">Start Time*</label>
      <input
        className="form-input"
        type="time"
        value={startTime}
        onChange={e => setStartTime(e.target.value)}
        required
      />

      <label className="form-label">End Time*</label>
      <input
        className="form-input"
        type="time"
        value={endTime}
        onChange={e => setEndTime(e.target.value)}
        required
      />

      <label className="form-label">Date*</label>
      <input
        className="form-input"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        required
      />

      <button className="form-btn" type="submit">Add Schedule</button>
    </form>
    </div>
    </div>
  );
}