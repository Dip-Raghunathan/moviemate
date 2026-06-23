import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, if a token exists, verify it and load the user
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('moviemate_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await authService.getMe();
        setUser(user);
      } catch {
        localStorage.removeItem('moviemate_token');
        localStorage.removeItem('moviemate_user');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const { token, user } = await authService.login(email, password);
    localStorage.setItem('moviemate_token', token);
    localStorage.setItem('moviemate_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const signup = async (data) => {
    const { token, user } = await authService.signup(data);
    localStorage.setItem('moviemate_token', token);
    localStorage.setItem('moviemate_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('moviemate_token');
    localStorage.removeItem('moviemate_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('moviemate_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
