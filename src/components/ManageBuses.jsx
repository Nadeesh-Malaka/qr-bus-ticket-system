import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiTruck, FiClock, FiGrid } from 'react-icons/fi';
import '../pages/AdminDashboard.css';

export default function ManageBuses() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    bus_no: '',
    bus_route: '',
    no_of_seats: '',
    bus_service_tel: '',
    start_time: '',
    reach_time: '',
    seat_rows: '',
    seat_columns: '',
    aisle_after_column: ''
  });

  useEffect(() => {
    fetchBuses();
    fetchRoutes();
  }, []);

  const fetchBuses = async () => {
    try {
      const response = await fetch('http://localhost/qrsys/api/bus_api.php');
      const data = await response.json();
      setBuses(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching buses:', error);
      setMessage({ type: 'error', text: 'Failed to fetch buses' });
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch('http://localhost/qrsys/api/route_api.php');
      const data = await response.json();
      setRoutes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validate seat configuration
    const totalSeats = parseInt(formData.seat_rows) * parseInt(formData.seat_columns);
    if (parseInt(formData.no_of_seats) !== totalSeats) {
      setMessage({ 
        type: 'error', 
        text: `Total seats (${formData.no_of_seats}) must equal rows × columns (${totalSeats})`
      });
      return;
    }

    try {
      const payload = {
        action: editingBus ? 'update' : 'create',
        ...formData,
        no_of_seats: parseInt(formData.no_of_seats),
        seat_rows: parseInt(formData.seat_rows),
        seat_columns: parseInt(formData.seat_columns),
        aisle_after_column: parseInt(formData.aisle_after_column),
        ...(editingBus && { bus_id: editingBus.bus_id })
      };

      const response = await fetch('http://localhost/qrsys/api/bus_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status) {
        setMessage({ 
          type: 'success', 
          text: editingBus ? 'Bus updated successfully' : 'Bus added successfully'
        });
        fetchBuses();
        closeModal();
      } else {
        setMessage({ type: 'error', text: result.message || 'Operation failed' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Server error occurred' });
    }
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      bus_no: bus.bus_no || '',
      bus_route: bus.bus_route || '',
      no_of_seats: bus.no_of_seats || '',
      bus_service_tel: bus.bus_service_tel || '',
      start_time: bus.start_time || '',
      reach_time: bus.reach_time || '',
      seat_rows: bus.seat_rows || '',
      seat_columns: bus.seat_columns || '',
      aisle_after_column: bus.aisle_after_column || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (busId) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;

    try {
      const response = await fetch('http://localhost/qrsys/api/bus_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          bus_id: busId
        })
      });

      const result = await response.json();

      if (result.status) {
        setMessage({ type: 'success', text: 'Bus deleted successfully' });
        fetchBuses();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to delete bus' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Server error occurred' });
    }
  };

  const openAddModal = () => {
    setEditingBus(null);
    setFormData({
      bus_no: '',
      bus_route: '',
      no_of_seats: '',
      bus_service_tel: '',
      start_time: '',
      reach_time: '',
      seat_rows: '',
      seat_columns: '',
      aisle_after_column: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBus(null);
  };

  const filteredBuses = buses.filter(bus =>
    bus.bus_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.bus_route?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="page-header">
        <h1>Manage Buses</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={openAddModal}>
            <FiPlus />
            <span>Add Bus</span>
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Search Bar */}
      <div className="dashboard-section">
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <FiSearch style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b'
          }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search buses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      {/* Buses Table */}
      <div className="data-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="empty-state">
            <FiTruck size={48} />
            <h3>No buses found</h3>
            <p>Start by adding your first bus</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Bus No</th>
                <th>Route</th>
                <th>Seats</th>
                <th>Contact</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuses.map((bus) => (
                <tr key={bus.bus_id}>
                  <td><strong>{bus.bus_no}</strong></td>
                  <td>{bus.bus_route}</td>
                  <td>{bus.no_of_seats} ({bus.seat_rows}×{bus.seat_columns})</td>
                  <td>{bus.bus_service_tel}</td>
                  <td>{bus.start_time}</td>
                  <td>{bus.reach_time}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(bus)}
                      >
                        <FiEdit2 size={14} />
                        <span>Edit</span>
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(bus.bus_id)}
                      >
                        <FiTrash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBus ? 'Edit Bus' : 'Add New Bus'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Bus Details Section */}
                <div style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FiTruck size={16} />
                    Bus Details
                  </h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label required">Bus Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., ND-4567"
                        value={formData.bus_no}
                        onChange={(e) => setFormData({...formData, bus_no: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Contact Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="e.g., 0771234567"
                        value={formData.bus_service_tel}
                        onChange={(e) => setFormData({...formData, bus_service_tel: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label required">Assigned Route</label>
                      <select
                        className="form-select"
                        value={formData.bus_route}
                        onChange={(e) => setFormData({...formData, bus_route: e.target.value})}
                        required
                      >
                        <option value="">Select a route</option>
                        {routes.map((route) => (
                          <option key={route.route_id} value={route.route_name}>
                            {route.route_name} ({route.start_city} → {route.end_city})
                          </option>
                        ))}
                      </select>
                      <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Bus operates on this route
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Total Seats</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g., 50"
                        value={formData.no_of_seats}
                        onChange={(e) => setFormData({...formData, no_of_seats: e.target.value})}
                        required
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule & Timing */}
                <div style={{
                  background: '#eff6ff',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  border: '1px solid #bfdbfe'
                }}>
                  <h3 style={{ 
                    fontSize: '15px', 
                    fontWeight: 600, 
                    color: '#1e40af',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FiClock size={16} />
                    Schedule & Timing
                  </h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label required">Departure Time</label>
                      <input
                        type="time"
                        className="form-input"
                        value={formData.start_time}
                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Arrival Time</label>
                      <input
                        type="time"
                        className="form-input"
                        value={formData.reach_time}
                        onChange={(e) => setFormData({...formData, reach_time: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seat Configuration */}
                <div style={{ 
                  background: '#fefce8', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #fef08a'
                }}>
                  <h3 style={{ 
                    fontSize: '15px', 
                    fontWeight: 600, 
                    color: '#854d0e',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FiGrid size={16} />
                    Seat Configuration
                  </h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label required">No. of Rows</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g., 10"
                        value={formData.seat_rows}
                        onChange={(e) => setFormData({...formData, seat_rows: e.target.value})}
                        required
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">No. of Columns</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g., 5"
                        value={formData.seat_columns}
                        onChange={(e) => setFormData({...formData, seat_columns: e.target.value})}
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Aisle After Column</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g., 2 (aisle appears after 2nd column)"
                      value={formData.aisle_after_column}
                      onChange={(e) => setFormData({...formData, aisle_after_column: e.target.value})}
                      required
                      min="0"
                    />
                    <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      Enter the column number after which the aisle appears
                    </small>
                  </div>

                  {/* Preview calculation */}
                  {formData.seat_rows && formData.seat_columns && (
                    <div style={{
                      background: 'white',
                      padding: '12px',
                      borderRadius: '6px',
                      marginTop: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <small style={{ color: '#475569', fontSize: '13px' }}>
                        <strong>Configuration Preview:</strong> {formData.seat_rows} rows × {formData.seat_columns} columns = {formData.seat_rows * formData.seat_columns} total seats
                      </small>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingBus ? 'Update Bus' : 'Add Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
