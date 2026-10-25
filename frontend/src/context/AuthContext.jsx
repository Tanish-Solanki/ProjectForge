import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in by verifying HTTP-only cookie on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await authAPI.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        }
      } catch (err) {
        // User is not authenticated; keep user as null
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    if (data.success && data.user) {
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    if (data.success && data.user) {
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout request error:', err);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const userRole = user?.role || 'student';

  const value = {
    user,
    role: userRole,
    isAdmin: userRole === 'admin',
    isFaculty: userRole === 'faculty',
    isStudent: userRole === 'student',
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    updateUser,
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
