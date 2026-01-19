import React, { useEffect, useState } from "react";
import "../assets/styles.css";

export default function RouteTable({ refresh }) {
  const [routes, setRoutes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    route_name: "",
    city: "",
    province: "",
    postal_code: "",
  });

  const fetchRoutes = async () => {
    try {
      const res = await fetch("http://localhost/qrsys/api/route_api.php");
      const data = await res.json();
      setRoutes(data);
    } catch (error) {
      console.error("Failed to load routes", error);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [refresh]);

  /* ---------- EDIT ---------- */
  const handleEdit = (route) => {
    setEditId(route.route_id);
    setForm({
      route_name: route.route_name,
      city: route.city,
      province: route.province,
      postal_code: route.postal_code,
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    await fetch("http://localhost/qrsys/api/route_api.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        route_id: editId,
        ...form,
      }),
    });

    setEditId(null);
    fetchRoutes();
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this route?")) return;

    await fetch("http://localhost/qrsys/api/route_api.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete",
        route_id: id,
      }),
    });

    fetchRoutes();
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Route List</h2>

      <table className="data-table">
        <thead>
          <tr>
            <th>Route</th>
            <th>City</th>
            <th>Province</th>
            <th>Postal Code</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {routes.length > 0 ? (
            routes.map((r) => (
              <tr key={r.route_id}>
                {editId === r.route_id ? (
                  <>
                    <td>
                      <input
                        name="route_name"
                        value={form.route_name}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        name="province"
                        value={form.province}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        name="postal_code"
                        value={form.postal_code}
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
                    <td>{r.route_name}</td>
                    <td>{r.city}</td>
                    <td>{r.province}</td>
                    <td>{r.postal_code}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn edit-btn" onClick={() => handleEdit(r)}>Edit</button>
                      <button className="btn delete-btn" onClick={() => handleDelete(r.route_id)}>
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
              <td colSpan="5">No routes found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}