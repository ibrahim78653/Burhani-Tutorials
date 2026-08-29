import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('bt_admin_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bt_admin_token');
    if (token) {
      API.get('/auth/verify')
        .then(res => setAdmin(res.data.admin))
        .catch(() => { localStorage.removeItem('bt_admin_token'); localStorage.removeItem('bt_admin_user'); setAdmin(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await API.post('/auth/login', { username, password });
    const { token, admin: adminData } = res.data;
    localStorage.setItem('bt_admin_token', token);
    localStorage.setItem('bt_admin_user', JSON.stringify(adminData));
    setAdmin(adminData);
    return adminData;
  };

  const logout = () => {
    localStorage.removeItem('bt_admin_token');
    localStorage.removeItem('bt_admin_user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading, isLoggedIn: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
