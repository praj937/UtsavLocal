import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('utsavlocal_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details on boot if token exists
  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('utsavlocal_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Authentication token expired or invalid:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Login handler
  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    if (response.data.success) {
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('utsavlocal_token', newToken);
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(response.data.message || 'Login failed');
  };

  // Register handler
  const register = async (name, email, password, role = 'user') => {
    const response = await authService.register({ name, email, password, role });
    if (response.data.success) {
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('utsavlocal_token', newToken);
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(response.data.message || 'Registration failed');
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('utsavlocal_token');
    setToken(null);
    setUser(null);
  };

  // Update user saved / rsvp list in state
  const updateSavedEvents = (savedEvents) => {
    setUser((prev) => (prev ? { ...prev, savedEvents } : prev));
  };

  const updateRsvpedEvents = (rsvpedEvents) => {
    setUser((prev) => (prev ? { ...prev, rsvpedEvents } : prev));
  };

  const isSaved = (eventId) => {
    if (!user || !user.savedEvents) return false;
    return user.savedEvents.some((item) => {
      const id = typeof item === 'object' && item !== null ? item._id : item;
      return id?.toString() === eventId?.toString();
    });
  };

  const isRsvped = (eventId) => {
    if (!user || !user.rsvpedEvents) return false;
    return user.rsvpedEvents.some((item) => {
      const id = typeof item === 'object' && item !== null ? item._id : item;
      return id?.toString() === eventId?.toString();
    });
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser: fetchCurrentUser,
    updateSavedEvents,
    updateRsvpedEvents,
    isSaved,
    isRsvped,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOrganizer: user?.role === 'organizer' || user?.role === 'admin',
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
