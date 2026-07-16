import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
  const [user, setUser] = useState(useMock ? {
    name: 'Demo Guwahati User',
    email: 'demo.guwahati@philixmate.test',
    city: 'Guwahati',
    gender: 'male'
  } : null);
  const [loading, setLoading] = useState(!useMock);

  // On app load, if a token exists, verify it and load the user
  useEffect(() => {
    if (useMock) {
      return;
    }
    const init = async () => {
      const token = localStorage.getItem('philixmate_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await authService.getMe();
        setUser(user);
      } catch {
        localStorage.removeItem('philixmate_token');
        localStorage.removeItem('philixmate_user');
      } finally {
        setLoading(false);
      }
    };
    init();

    // Cross-tab synchronization
    const handleStorageChange = async (e) => {
      if (e.key === 'philixmate_token') {
        if (!e.newValue) {
          setUser(null);
        } else {
          try {
            const { user } = await authService.getMe();
            setUser(user);
          } catch {
            setUser(null);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password) => {
    const { token, user } = await authService.login(email, password);
    localStorage.setItem('philixmate_token', token);
    localStorage.setItem('philixmate_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const signup = async (data) => {
    const res = await authService.signup(data);
    if (res?.requiresVerification) {
      return { requiresVerification: true };
    }
    const { token, user } = res;
    localStorage.setItem('philixmate_token', token);
    localStorage.setItem('philixmate_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('philixmate_token');
    localStorage.removeItem('philixmate_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('philixmate_user', JSON.stringify(updatedUser));
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
