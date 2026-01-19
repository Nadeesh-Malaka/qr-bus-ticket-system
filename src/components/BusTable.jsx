import React, { useEffect, useState } from "react";
import "../assets/styles.css";

export default function BusTable() {
  const [buses, setBuses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");

  /* ---------- FETCH BUS DATA ---------- */
  const fetchBuses = async () => {
    try {
      const res = await fetch("http://localhost/qrsys/api/bus_api.php");
      const data = await res.json();
      if (data.status) setBuses(data.data);
    } catch {
      setMessage("❌ Failed to load buses");
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  /* ---------- EDIT ---------- */
  const handleEdit = (bus) => {
    setEditId(bus.bus_id);
    setForm(bus);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const res = await fetch("http://localhost/qrsys/api/bus_api.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        ...form,
        seat_count: Number(form.seat_count),
      }),
    });

    const data = await res.json();
    setMessage(data.message);
    setEditId(null);
    fetchBuses();
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (bus_id) => {
    if (!window.confirm("Delete this bus?")) return;

    const res = await fetch("http://localhost/qrsys/api/bus_api.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", bus_id }),
    });

    const data = await res.json();
    setMessage(data.message);
    fetchBuses();
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Bus List</h2>
      {message && <p>{message}</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Bus No</th>
            <th>Route</th>
            <th>Seats</th>
            <th>Service Tel</th>
            <th>Start</th>
            <th>Reach</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {buses.length > 0 ? (
            buses.map((bus) => (
              <tr key={bus.bus_id}>
                {editId === bus.bus_id ? (
                  <>
                    <td>
                      <input
                        name="bus_no"
                        value={form.bus_no}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        name="bus_route"
                        value={form.bus_route}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name="seat_count"
                        value={form.seat_count}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        name="bus_service_tel"
                        value={form.bus_service_tel}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        name="start_time"
                        value={form.start_time}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        name="reach_time"
                        value={form.reach_time}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <button onClick={handleUpdate}>Save</button>
                      <button onClick={() => setEditId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{bus.bus_no}</td>
                    <td>{bus.bus_route}</td>
                    <td>{bus.seat_count}</td>
                    <td>{bus.bus_service_tel}</td>
                    <td>{bus.start_time}</td>
                    <td>{bus.reach_time}</td>
                    <td>{bus.date}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn edit-btn" onClick={() => handleEdit(bus)}>
                          Edit
                        </button>
                        <button
                          className="btn delete-btn"
                          onClick={() => handleDelete(bus.bus_id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No buses found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}