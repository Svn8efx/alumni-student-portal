import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';

const AuthContext = createContext(null);

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // On mount, verify the stored token is still valid and refresh the profile
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  // Establish a socket connection for real-time notifications/messages once
  // logged in. The JWT rides along in the handshake — the server verifies it
  // and joins us to our own private room; no client-side 'join' emit anymore.
  useEffect(() => {
    if (!user) return;
    const s = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') },
    });
    setSocket(s);
    return () => s.disconnect();
  }, [user?._id]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    setUser(data.data);
    return data.data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    setUser(data.data);
    return data.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    socket?.disconnect();
  }, [socket]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, socket }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);