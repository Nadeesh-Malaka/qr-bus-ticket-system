// API Configuration
// Centralized API base URL for the QR System

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost/qrsys/api";

const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/login.php`,
  LOGIN_API: `${API_BASE_URL}/login_api.php`,
  REGISTER: `${API_BASE_URL}/register_api.php`,
  
  // Bus Management
  BUS_API: `${API_BASE_URL}/bus_api.php`,
  GET_BUSES: `${API_BASE_URL}/get_buses.php`,
  GET_BUS_API: `${API_BASE_URL}/get_bus_api.php`,
  GET_BUS_SEATS: `${API_BASE_URL}/get_bus_seats.php`,
  
  // Route Management
  ROUTE_API: `${API_BASE_URL}/route_api.php`,
  GET_ROUTES: `${API_BASE_URL}/get_routes.php`,
  
  // Schedule Management
  ADD_SCHEDULE: `${API_BASE_URL}/add_schedule.php`,
  GET_SCHEDULE: `${API_BASE_URL}/get_schedule.php`,
  
  // Booking Management
  SAVE_BOOKING: `${API_BASE_URL}/save_booking.php`,
  GET_BOOKING_HISTORY: `${API_BASE_URL}/get_booking_history.php`,
  
  // Feedback
  FEEDBACK: `${API_BASE_URL}/feedback_api.php`,
  
  // Users
  GET_USERS: `${API_BASE_URL}/get_users.php`,
};

// Export both API_BASE_URL and API_ENDPOINTS
export { API_BASE_URL };
export default API_ENDPOINTS;
