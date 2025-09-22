import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('winguport_user');

      if (token && storedUser) {
        try {
          // Immediately set the user from local storage for a fast UI response
          setUser(JSON.parse(storedUser));
        } catch (error) {
          // If stored user is invalid, clear it
          setUser(null);
          localStorage.removeItem('winguport_user');
          localStorage.removeItem('authToken');
        }
      }
      // We are done with the initial, critical loading phase
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    setUser,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
