import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (token && role) {
        try {
          const res = await api.get('/auth/validate');
          // Token is valid – set user
          setUser({ token, role: res.data.role });
        } catch (err) {
          // Token invalid or expired – clear
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    validateToken();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, role } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setUser({ token, role });
    toast.success('Login successful!');
  };

  const register = async (formData) => {
    await api.post('/auth/register', formData);
    toast.success('Registration successful! Please login.');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};