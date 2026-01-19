import React, { useState, useEffect, useMemo } from "react";
import "../assets/styles.css";

const API_URL = "http://localhost/qr_system/api/get_users.php";

export default function BusSchedule() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  /* 🔵 FETCH USERS */
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
          setError("Failed to load users");
        }
      })
      .catch(() => {
        setError("Server connection error");
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  /* 🔴 DELETE USER */
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setDeletingId(userId);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await res.json();

      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      } else {
        alert(data.message || "Delete failed");
      }
    } catch {
      alert("Server error");
    } finally {
      setDeletingId(null);
    }
  };

  /* 🔍 SEARCH FILTER (Optimized) */
  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      Object.values(u).some((val) =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [users, search]);

  /* 🖨 PRINT */
  const handlePrint = () => window.print();

  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="table-container">
      <h2 className="table-heading">Users</h2>

      {/* 🔍 Search + Print */}
      <div className="table-actions">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <button onClick={handlePrint} className="print-btn">
          Print
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Full Name</th>
            <th>Gender</th>
            <th>DOB</th>
            <th>NIC</th>
            <th>Address 1</th>
            <th>Address 2</th>
            <th>City</th>
            <th>Mobile</th>
            <th>User Type</th>
            <th>Created</th>
            <th>Gmail</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="13">No users found</td>
            </tr>
          ) : (
            filteredUsers.map((u) => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{u.full_name}</td>
                <td>{u.gender}</td>
                <td>{u.dob}</td>
                <td>{u.nic}</td>
                <td>{u.address1}</td>
                <td>{u.address2}</td>
                <td>{u.city}</td>
                <td>{u.mobile_no}</td>
                <td>{u.user_type}</td>
                <td>{u.created_at}</td>
                <td>{u.gmail}</td>
                <td>
                  <button
                    className="delete-btn"
                    disabled={deletingId === u.user_id}
                    onClick={() => handleDelete(u.user_id)}
                  >
                    {deletingId === u.user_id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
