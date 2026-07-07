import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      // Basic decode of JWT to get email/id if needed, or just set user info directly if we had a /me endpoint
      // For now, we will rely on login/register setting the user.
      // Ideally you'd fetch the user profile here, but we can just use the token state for auth checks.
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, email: payload.email });
      } catch (e) {
        console.error("Failed to parse token", e);
        logout();
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    if (res.data.token) {
      setToken(res.data.token);
      setUser({ email }); // Just setting email since it's what we have
    }
    return res;
  };

  const register = async (email, password) => {
    const res = await axios.post('/api/auth/register', { email, password });
    if (res.data.token) {
      setToken(res.data.token);
      setUser({ email });
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
