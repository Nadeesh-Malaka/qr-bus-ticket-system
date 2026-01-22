import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiEdit, FiEye, FiClock, FiMapPin } from 'react-icons/fi';
import axios from 'axios';
import '../pages/AdminDashboard.css';

export default function OperatorMyBuses() {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBus, setEditingBus] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.user_id) {
      fetchOperatorBuses();
    }
  }, [user]);

  const fetchOperatorBuses = async () => {
    try {
      const response = await axios.get(
        `http://localhost/qrsys/api/get_operator_buses.php?operator_id=${user.user_id}`
      );
      
      if (response.data.success) {
        setBuses(response.data.buses || []);
      } else {
        alert('Failed to fetch buses: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error fetching operator buses:', error);
      alert('Error loading buses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (bus) => {
    setEditingBus(bus);
    setShowEditModal(true);
  };

  const handleUpdateBus = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost/qrsys/api/update_bus.php',
        {
          bus_id: editingBus.bus_id,
          bus_service_tel: editingBus.bus_service_tel,
          start_time: editingBus.start_time,
          reach_time: editingBus.reach_time,
          operator_id: user.user_id
        }
      );

      if (response.data.success) {
        alert('Bus updated successfully!');
        setShowEditModal(false);
        fetchOperatorBuses();
      } else {
        alert('Failed to update bus: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating bus:', error);
      alert('Error updating bus. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>My Buses</h1>
          <p>Loading your buses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>My Buses</h1>
          <p>Manage your assigned bus fleet</p>
        </div>
      </div>

      {/* Buses Table */}
      <div className="dashboard-section">
        {buses.length === 0 ? (
          <div className="info-card">
            <p>No buses assigned to you yet. Please contact the administrator.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bus Number</th>
                  <th>Route</th>
                  <th>Total Seats</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((bus) => (
                  <tr key={bus.bus_id}>
                    <td><strong>{bus.bus_no}</strong></td>
                    <td>{bus.bus_route || bus.route_name || 'N/A'}</td>
                    <td>{bus.no_of_seats}</td>
                    <td>{bus.start_time}</td>
                    <td>{bus.reach_time}</td>
                    <td>{bus.bus_service_tel}</td>
                    <td>
                      <button
                        className="btn-icon btn-primary"
                        onClick={() => handleEditClick(bus)}
                        title="Edit Bus"
                      >
                        <FiEdit />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingBus && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Bus Details</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateBus}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Bus Number</label>
                  <input
                    type="text"
                    value={editingBus.bus_no}
                    disabled
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    value={editingBus.bus_service_tel}
                    onChange={(e) => setEditingBus({...editingBus, bus_service_tel: e.target.value})}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={editingBus.start_time}
                    onChange={(e) => setEditingBus({...editingBus, start_time: e.target.value})}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={editingBus.reach_time}
                    onChange={(e) => setEditingBus({...editingBus, reach_time: e.target.value})}
                    className="form-control"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
