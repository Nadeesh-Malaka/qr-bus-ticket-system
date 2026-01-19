import React, { useState, useEffect } from "react";
import "../assets/styles.css";

export default function BusSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost/qrsys/api/get_schedule.php")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSchedule(data);
        } else {
          setSchedule([]);
          setError("Failed to load schedule");
        }
      })
      .catch(() => {
        setError("Server connection error");
        setSchedule([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading schedule...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Bus No</th>
          <th>Route Name</th>
          <th>Start Time</th>
          <th>Reach Time</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {schedule.length === 0 ? (
          <tr>
            <td colSpan="5">No schedules available</td>
          </tr>
        ) : (
          schedule.map((s) => (
            <tr key={s.schedule_id}>
              <td>{s.bus_no}</td>
              <td>{s.route_name}</td>
              <td>{s.start_time}</td>
              <td>{s.end_time}</td>
              <td>{s.scheduled_date}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
