import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, apiJson } from '../utils/api';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveAuth = (data, token) => {
    localStorage.setItem('ldcp_token', token);
    setUser(data);
  };

  const clearAuth = () => {
    localStorage.removeItem('ldcp_token');
    setUser(null);
  };

  const login = async ({ email, password }) => {
    const res = await apiJson('/api/auth/login', { email, password });
    saveAuth(res.data, res.token);
    return res.data;
  };

  const register = async ({ name, email, password }) => {
    const res = await apiJson('/api/auth/register', { name, email, password });
    saveAuth(res.data, res.token);
    return res.data;
  };

  const logout = () => {
    clearAuth();
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const res = await apiFetch('/api/auth/me');
        if (isMounted) {
          setUser(res.data);
        }
      } catch (err) {
        clearAuth();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthProvider, useAuth };
