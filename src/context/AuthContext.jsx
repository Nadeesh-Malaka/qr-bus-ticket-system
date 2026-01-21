import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export { AuthContext }; // Export AuthContext for direct use

// Helper function to normalize user_id format
const normalizeUserId = (userId) => {
  if (!userId) return userId;
  const match = userId.match(/^([A-Z]+)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const number = match[2];
    return prefix + number.padStart(6, '0');
  }
  return userId;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Normalize user_id when loading from localStorage
        if (parsedUser.user_id) {
          parsedUser.user_id = normalizeUserId(parsedUser.user_id);
        }
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Normalize user_id before storing
    if (userData.user_id) {
      userData.user_id = normalizeUserId(userData.user_id);
    }
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return user.role === allowedRoles;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hasRole,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
