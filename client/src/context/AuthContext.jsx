import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load demo users and active session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.get('/auth/demo-users');
        if (res.data.success) {
          setDemoUsers(res.data.users);

          const savedRole = localStorage.getItem('brandguard_role') || 'creator';
          const savedUser = res.data.users.find(u => u.role === savedRole) || res.data.users[0];

          setUser(savedUser);
          localStorage.setItem('brandguard_role', savedUser.role);
        }
      } catch (err) {
        console.warn('[AuthContext] Defaulting to local demo user:', err.message);
        // Fallback default user
        setUser({
          id: 'usr-creator-01',
          name: 'Dhruv Sharma',
          email: 'creator@brandguard.ai',
          role: 'creator',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv'
        });
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const switchRole = (newRole) => {
    const targetUser = demoUsers.find(u => u.role === newRole);
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem('brandguard_role', targetUser.role);
      // Generate clean token or clear
      localStorage.removeItem('brandguard_token');
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('brandguard_token', res.data.token);
        localStorage.setItem('brandguard_role', res.data.user.role);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const logout = () => {
    // Revert to demo creator
    const defaultCreator = demoUsers.find(u => u.role === 'creator') || demoUsers[0];
    setUser(defaultCreator);
    localStorage.removeItem('brandguard_token');
    localStorage.setItem('brandguard_role', defaultCreator ? defaultCreator.role : 'creator');
  };

  return (
    <AuthContext.Provider value={{ user, demoUsers, loading, switchRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
