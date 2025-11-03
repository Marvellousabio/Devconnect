import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { useApolloClient } from '@apollo/client';
import socketService from '../services/socket';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const client = useApolloClient();

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
          setUser(decoded);
          setIsAuthenticated(true);

          // Connect to socket
          socketService.connect(decoded.userId);
        } else {
          // Token expired
          logout();
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token, refreshToken, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);

    setUser(userData);
    setIsAuthenticated(true);

    // Connect to socket
    socketService.connect(userData.id);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');

    setUser(null);
    setIsAuthenticated(false);

    // Disconnect socket
    socketService.disconnect();

    // Clear Apollo cache
    client.clearStore();
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};