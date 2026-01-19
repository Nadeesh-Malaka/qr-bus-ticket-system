import React, { useState, useEffect, useMemo } from "react";
import "../assets/styles.css";

const API_URL = "http://localhost/qrsys/api/get_users.php";

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

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

  /* ✏️ UPDATE USER ROLE */
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const res = await fetch("http://localhost/qrsys/api/update_user_role.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: userId, 
          user_type: newRole 
        }),
      });

      const data = await res.json();

      if (data.status) {
        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === userId ? { ...u, user_type: newRole } : u
          )
        );
        setEditingUser(null);
        alert("User role updated successfully");
      } else {
        alert(data.message || "Update failed");
      }
    } catch {
      alert("Server error");
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
      <h2 className="table-heading">Users Management</h2>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        Admin can view all users and change user roles
      </p>

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
            <th>NIC</th>
            <th>City</th>
            <th>Mobile</th>
            <th>User Type</th>
            <th>Gmail</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="9">No users found</td>
            </tr>
          ) : (
            filteredUsers.map((u) => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{u.full_name}</td>
                <td>{u.gender}</td>
                <td>{u.nic}</td>
                <td>{u.city}</td>
                <td>{u.mobile_no}</td>
                <td>
                  {editingUser === u.user_id ? (
                    <select
                      defaultValue={u.user_type}
                      onChange={(e) => handleRoleUpdate(u.user_id, e.target.value)}
                      style={{
                        padding: '5px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                    >
                      <option value="passenger">Passenger</option>
                      <option value="bus driver">Bus Driver</option>
                      <option value="bus operator">Bus Operator</option>
                      <option value="admin">Administrator</option>
                    </select>
                  ) : (
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: 
                          u.user_type === 'admin' ? '#dc3545' :
                          u.user_type === 'bus operator' ? '#fd7e14' :
                          u.user_type === 'bus driver' ? '#0dcaf0' :
                          '#28a745',
                        color: 'white',
                        fontSize: '12px'
                      }}
                    >
                      {u.user_type}
                    </span>
                  )}
                </td>
                <td>{u.gmail}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning"
                    style={{ marginRight: '5px' }}
                    onClick={() => setEditingUser(u.user_id === editingUser ? null : u.user_id)}
                  >
                    {editingUser === u.user_id ? "Cancel" : "Change Role"}
                  </button>
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
